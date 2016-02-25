//-------------------------------------------------------------------------------
// Imports
//-------------------------------------------------------------------------------

import {
    Class,
    Map,
    Obj,
    Promises,
    Proxy,
    Throwables,
    TypeUtil
} from 'bugcore';
import npm from 'npm';
import request from 'request';
import {
    AuthController,
    ConfigController,
    ContextController,
    QueryController
} from './';
import {
    RecipePackage
} from '../core';
import {
    SemanticVersionField
} from '../fields';
import {
    PublishKeyManager,
    RecipeCollaboratorManager,
    RecipeManager,
    RecipeVersionManager
} from '../managers';
import {
    RecipeDownloadStore,
    RecipeFileStore,
    RecipeStore
} from '../stores';
import {
    PathUtil
} from '../util';
import _ from 'lodash';


//-------------------------------------------------------------------------------
// Declare Class
//-------------------------------------------------------------------------------

/**
 * @class
 * @extends {Obj}
 */
const RecipeController = Class.extend(Obj, {

    _name: 'recipe.RecipeController',


    //-------------------------------------------------------------------------------
    // Constructor
    //-------------------------------------------------------------------------------

    /**
     * @constructs
     */
    _constructor() {

        this._super();


        //-------------------------------------------------------------------------------
        // Public Properties
        //-------------------------------------------------------------------------------

        /**
         * @private
         * @type {Map.<string, RecipeDownloadStore>}
         */
        this.cacheDirToRecipeDownloadStore  = new Map();

        /**
         * @private
         * @type {Promise}
         */
        this.prefixToNpmLoadingPromise      = new Map();

        /**
         * @private
         * @type {RecipeFileStore}
         */
        this.recipeFileStore                = new RecipeFileStore();

        /**
         * @private
         * @type {Map.<string, RecipeStore>}
         */
        this.recipesDirToRecipeStoreMap     = new Map();
    },


    //-------------------------------------------------------------------------------
    // Getters and Setters
    //-------------------------------------------------------------------------------

    /**
     * @return {Map.<string, RecipeDownloadStore>}
     */
    getCacheDirToRecipeDownloadStoreMap() {
        return this.cacheDirToRecipeDownloadStore;
    },

    /**
     * @return {Promise}
     */
    getPrefixToNpmLoadingPromise() {
        return this.prefixToNpmLoadingPromise;
    },

    /**
     * @return {RecipeFileStore}
     */
    getRecipeFileStore() {
        return this.recipeFileStore;
    },

    /**
     * @return {Map.<RecipeContext, RecipeStore>}
     */
    getRecipesDirToRecipeStoreMap() {
        return this.recipesDirToRecipeStoreMap;
    },


    //-------------------------------------------------------------------------------
    // Public Methods
    //-------------------------------------------------------------------------------

    /**
     * @param {string} recipeQuery
     * @return {Recipe}
     */
    async getRecipe(recipeQuery) {
        return await this.installRecipe(recipeQuery);
    },

    /**
     * @param {string} recipeQuery
     * @return {Recipe}
     */
    async installRecipe(recipeQuery) {
        const recipeQueryResult = await QueryController.query(recipeQuery);
        return await this.ensureRecipeInstalled(recipeQueryResult.getType(), recipeQueryResult.getScope(), recipeQueryResult.getName(), recipeQueryResult.getVersionNumber());
    },

    /**
     * @param {string} recipeType
     * @param {string} recipeScope
     * @param {string} recipeName
     * @param {string} recipeVersionNumber
     * @returns {Recipe}
     */
    async loadRecipe(recipeType, recipeScope, recipeName, recipeVersionNumber) {
        const recipeContext     = ContextController.getCurrentRecipeContext();
        const recipeStore       = this.generateRecipeStore(recipeContext);
        try {
            return await recipeStore.loadRecipe(recipeType, recipeScope, recipeName, recipeVersionNumber);
        } catch(throwable) {
            if (throwable.type !== 'RecipeDoesNotExist') {
                throw throwable;
            }
        }
    },

    /**
     * @param {string} recipePath
     * @return {RecipeFile}
     */
    async loadRecipeFile(recipePath) {
        const recipeFilePath = PathUtil.resolveRecipeFileFromRecipePath(recipePath);
        return await this.recipeFileStore.loadRecipeFile(recipeFilePath);
    },

    /**
     * @param {string} recipePath
     * @return {RecipePackage}
     */
    packageRecipe(recipePath) {
        return RecipePackage.fromPath(recipePath);
    },

    /**
     * @param {string} recipePath
     * @return {PublishKeyEntity}
     */
    async publishRecipe(recipePath) {
        const recipeType = 'gulp';
        const recipeScope = 'public';
        const recipeFile = await this.loadRecipeFile(recipePath);
        await this.validateNewRecipe(recipeFile);
        const recipePackage = await this.packageRecipe(recipePath);
        await this.verifyCurrentUserAccessToRecipe(recipeFile.getName());
        await this.ensureRecipeEntityCreated(recipeType, recipeScope, recipeFile.getName());
        const recipeVersionEntity = await this.ensureRecipeVersionEntityCreated(recipeFile);
        const publishKeyEntity = await this.createPublishKey(recipeFile, recipePackage, recipeVersionEntity);
        console.log('publishing ' + publishKeyEntity.getRecipeName() + '@' + publishKeyEntity.getRecipeVersionNumber());
        await this.uploadRecipePackage(recipePackage, publishKeyEntity);
        return publishKeyEntity;
    },

    /**
     * @param {RecipeFile} recipeFile
     * @return {RecipeFile}
     */
    async validateNewRecipe(recipeFile) {
        this.validateRecipe(recipeFile);
        const entity = await this.loadRecipeVersionEntity(recipeFile.getName(), recipeFile.getVersion());
        if (entity) {
            if (entity.getPublished()) {
                throw Throwables.exception('RecipeVersionExists', {}, 'Recipe ' + recipeFile.getName() + '@' + recipeFile.getVersion() + ' has already been published');
            }
        }
        return recipeFile;
    },

    /**
     * @param {RecipeFile} recipeFile
     */
    validateRecipe(recipeFile) {
        this.validateRecipeName(recipeFile.getName());
        this.validateRecipeVersion(recipeFile.getVersion());
    },


    //-------------------------------------------------------------------------------
    // Private Methods
    //-------------------------------------------------------------------------------

    /**
     * @private
     * @param {RecipeFile} recipeFile
     * @param {RecipePackage} recipePackage
     * @param {RecipeVersionEntity} recipeVersionEntity
     * @return {PublishKeyEntity}
     */
    async createPublishKey(recipeFile, recipePackage, recipeVersionEntity) {
        return await PublishKeyManager.create({
            recipeHash: recipePackage.getRecipeHash(),
            recipeName: recipeFile.getName(),
            recipeVersionNumber: recipeVersionEntity.getVersionNumber()
        });
    },

    /**
     * @private
     * @param {{
     *      name: string,
     *      scope: string,
     *      type: string
     * }} rawData
     * @return {RecipeEntity}
     */
    async createRecipeEntity(rawData) {
        const currentUser = await AuthController.getCurrentUser();
        if (currentUser.isAnonymous()) {
            throw Throwables.exception('UserIsAnonymous');
        }
        return await RecipeManager.create(rawData, currentUser.getUserData());
    },

    /**
     * @private
     * @param {string} recipeType
     * @param {string} recipeScope
     * @param {string} recipeName
     * @param {string} recipeVersion
     * @return {RecipeVersionEntity}
     */
    async createRecipeVersionEntity(recipeType, recipeScope, recipeName, recipeVersion) {
        return await RecipeVersionManager.create(recipeType, recipeScope, recipeName, recipeVersion);
    },

    /**
     * @private
     * @param {string} recipeType
     * @param {string} recipeScope
     * @param {string} recipeName
     * @param {string} recipeVersionNumber
     * @return {Recipe}
     */
    async doRecipeInstall(recipeType, recipeScope, recipeName, recipeVersionNumber) {
        const recipeContext     = ContextController.getCurrentRecipeContext();
        const config = await Promises.props({
            cache: ConfigController.getConfigProperty('cache'),
            firebaseUrl: ConfigController.getConfigProperty('firebaseUrl')
        });
        // TODO BRN:
        //-- install npmDependencies in to local recipe folder [execPath]/.recipe/[recipeType]/[recipeScope]/[recipeName]/[recipeVersion]/node_modules

        const recipeVersionEntity = await this.loadRecipeVersionEntity(recipeType, recipeScope, recipeName, recipeVersionNumber);
        if (!recipeVersionEntity) {
            throw new Throwables.exception('RecipeVersionDoesNotExist', {}, 'Cannot find ' + recipeScope + ' version "' + recipeVersionNumber + '" for ' + recipeType + '-recipe "' + recipeName + '".');
        }
        const recipeDownloadStore = this.generateDownloadStore(config.cache);
        const recipeDownload = await recipeDownloadStore.download(recipeVersionEntity.getRecipeUrl());
        const recipesDir = PathUtil.resolveRecipesDirFromContext(recipeContext);
        const recipePath = PathUtil.resolveRecipePath(recipesDir, recipeType, recipeScope, recipeName, recipeVersionNumber);
        await recipeDownload.getRecipePackage().extractToPath(recipePath);
        const recipe = await this.loadRecipe(recipeType, recipeScope, recipeName, recipeVersionNumber);
        await this.ensureRecipeDependenciesInstalled(recipe);
        return recipe;
    },

    /**
     * @private
     * @param {string} prefix
     */
    async ensureNpmLoaded(prefix) {
        return await this.loadNpm(prefix);
    },

    /**
     * @private
     * @param {string} recipeType
     * @param {string} recipeScope
     * @param {string} recipeName
     * @return {RecipeEntity}
     */
    async ensureRecipeEntityCreated(recipeType, recipeScope, recipeName) {
        let recipeEntity = await this.loadRecipeEntity(recipeType, recipeScope, recipeName);
        if (!recipeEntity) {
            recipeEntity = await this.createRecipeEntity({
                name: recipeName,
                scope: recipeScope,
                type: recipeType
            });
        }
        return recipeEntity;
    },

    /**
     * @private
     * @param {Recipe} recipe
     * @return {Recipe}
     */
    async ensureRecipeDependenciesInstalled(recipe) {
        await this.ensureNpmLoaded(recipe.getRecipePath());
        const dependenciesToInstall = _.map(recipe.getNpmDependencies(), (version, packageName) => {
            return packageName + '@' + version;
        });
        await this.installDependencies(dependenciesToInstall);
        return recipe;
    },

    /**
     * @private
     * @param {string} recipeType
     * @param {string} recipeScope
     * @param {string} recipeName
     * @param {string} recipeVersionNumber
     * @return {Recipe}
     */
    async ensureRecipeInstalled(recipeType, recipeScope, recipeName, recipeVersionNumber) {
        let recipe = await this.loadRecipe(recipeType, recipeScope, recipeName, recipeVersionNumber);
        if (!recipe) {
            recipe = await this.doRecipeInstall(recipeType, recipeScope, recipeName, recipeVersionNumber);
        }
        return recipe;
    },

    /**
     * @private
     * @param {RecipeFile} recipeFile
     * @return {RecipeVersionEntity}
     */
    async ensureRecipeVersionEntityCreated(recipeFile) {
        const recipeType = 'gulp';
        const recipeScope = 'public';
        let entity = await this.loadRecipeVersionEntity(recipeType, recipeScope, recipeFile.getName(), recipeFile.getVersion());
        if (!entity) {
            entity = await this.createRecipeVersionEntity(recipeType, recipeScope, recipeFile.getName(), recipeFile.getVersion());
        }
        return entity;
    },

    /**
     * @private
     * @param {string} cacheDir
     * @return {RecipeDownloadStore}
     */
    generateDownloadStore(cacheDir) {
        let recipeDownloadStore     = this.cacheDirToRecipeDownloadStore.get(cacheDir);
        if (!recipeDownloadStore) {
            recipeDownloadStore         = new RecipeDownloadStore(cacheDir);
            this.cacheDirToRecipeDownloadStore.put(cacheDir, recipeDownloadStore);
        }
        return recipeDownloadStore;
    },

    /**
     * @private
     * @param {RecipeContext} recipeContext
     * @return {RecipeStore}
     */
    generateRecipeStore(recipeContext) {
        const recipesDir    = PathUtil.resolveRecipesDirFromContext(recipeContext);
        let recipeStore     = this.recipesDirToRecipeStoreMap.get(recipesDir);
        if (!recipeStore) {
            recipeStore         = new RecipeStore(recipesDir, this.recipeFileStore);
            this.recipesDirToRecipeStoreMap.put(recipesDir, recipeStore);
        }
        return recipeStore;
    },

    /**
     * @private
     * @param {Array.<string>} dependencies
     * @return {Promise}
     */
    installDependencies(dependencies) {
        return Promises.promise((resolve, reject) => {
            if (dependencies.length > 0) {
                npm.commands.install(dependencies, (error) => {
                    if (error) {
                        return reject(error);
                    }
                    return resolve();
                });
            } else {
                resolve();
            }
        });
    },

    /**
     * @private
     * @return {Promise}
     */
    loadNpm(prefix) {
        let npmLoadingPromise = this.prefixToNpmLoadingPromise.get(prefix);
        if (!npmLoadingPromise) {
            npmLoadingPromise = Promises.promise((resolve, reject) => {
                npm.on('log', (message) => {
                    console.log(message); //eslint-disable-line  no-console
                });
                npm.load({
                    prefix: prefix
                }, (error) => {
                    if (error) {
                        return reject(error);
                    }
                    return resolve();
                });
            });
            this.prefixToNpmLoadingPromise.put(prefix, npmLoadingPromise);
        }
        return npmLoadingPromise;
    },

    /**
     * @private
     * @param {string} recipeType
     * @param {string} recipeScope
     * @param {string} recipeName
     * @return {RecipeEntity}
     */
    async loadRecipeEntity(recipeType, recipeScope, recipeName) {
        return await RecipeManager.get({
            recipeName,
            recipeScope,
            recipeType
        });
    },

    /**
     * @private
     * @param {string} recipeType
     * @param {string} recipeScope
     * @param {string} recipeName
     * @param {string} versionNumber
     * @return {RecipeVersionEntity}
     */
    async loadRecipeVersionEntity(recipeType, recipeScope, recipeName, versionNumber) {
        return await RecipeVersionManager.get({
            recipeName,
            recipeScope,
            recipeType,
            versionNumber
        });
    },

    /**
     * @private
     * @param {RecipePackage} recipePackage
     * @param {PublishKeyEntity} publishKeyEntity
     * @return {Promise}
     */
    uploadRecipePackage(recipePackage, publishKeyEntity) {
        return Promises.props({
            debug: ConfigController.getConfigProperty('debug'),
            serverUrl: ConfigController.getConfigProperty('serverUrl')
        }).then((config) => {
            return Promises.promise((resolve, reject) => {
                console.log('uploading to ', config.serverUrl + '/api/v1/publish');
                const req = request.post(config.serverUrl + '/api/v1/publish', {
                    auth: {
                        bearer: publishKeyEntity.getKey()
                    }
                });
                req.on('error', (error) => {
                    reject(error);
                }).on('response', (response) => {
                    if (response.statusCode === 200) {
                        return resolve();
                    }
                    return reject(new Throwables.exception('UPLOAD_ERROR', {}, 'Package upload error'));
                });
                recipePackage.pipe(req);
            });
        });
    },

    /**
     * @private
     * @param {string} recipeName
     */
    validateRecipeName(recipeName) {
        if (!TypeUtil.isString(recipeName)) {
            throw Throwables.exception('RecipeInvalid', {}, 'Recipe name must be a string');
        }
        if (!(/^[a-z]+(?:[a-z0-9-][a-z0-9]+)*$/).test(recipeName)) {
            throw Throwables.exception('RecipeInvalid', {}, 'Recipe name must be lower case letters, numbers or dashes and must start with a letter');
        }
    },

    /**
     * @private
     * @param {string} recipeVersion
     */
    validateRecipeVersion(recipeVersion) {
        SemanticVersionField.validate(recipeVersion);
    },

    /**
     * @private
     * @param {string} recipeType
     * @param {string} recipeScope
     * @param {string} recipeName
     */
    async verifyCurrentUserAccessToRecipe(recipeType, recipeScope, recipeName) {
        const recipeEntity = await this.loadRecipeEntity(recipeType, recipeScope, recipeName);
        if (recipeEntity) {
            const currentUser = await AuthController.getCurrentUser();
            if (currentUser.isAnonymous()) {
                return null;
            }
            const entity = await RecipeCollaboratorManager.get({
                recipeType,
                recipeScope,
                recipeName,
                userId: currentUser.getUserId()
            });
            if (!entity) {
                throw Throwables.exception('AccessDenied', {}, 'User does not have access to publish to recipe "' + recipeName + '"');
            }
        }
    }
});


//-------------------------------------------------------------------------------
// Private Static Properties
//-------------------------------------------------------------------------------

/**
 * @static
 * @private
 * @type {RecipeController}
 */
RecipeController.instance           = null;


//-------------------------------------------------------------------------------
// Static Methods
//-------------------------------------------------------------------------------

/**
 * @static
 * @return {RecipeController}
 */
RecipeController.getInstance = function() {
    if (RecipeController.instance === null) {
        RecipeController.instance = new RecipeController();
    }
    return RecipeController.instance;
};


//-------------------------------------------------------------------------------
// Static Proxy
//-------------------------------------------------------------------------------

Proxy.proxy(RecipeController, Proxy.method(RecipeController.getInstance), [
    'getRecipe',
    'installRecipe',
    'loadRecipe',
    'loadRecipeFile',
    'packageRecipe',
    'publishRecipe',
    'validateNewRecipe',
    'validateRecipe'
]);


//-------------------------------------------------------------------------------
// Exports
//-------------------------------------------------------------------------------

export default RecipeController;
