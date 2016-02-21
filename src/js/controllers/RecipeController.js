//-------------------------------------------------------------------------------
// Imports
//-------------------------------------------------------------------------------

import {
    Class,
    Map,
    Obj,
    ObjectUtil,
    Promises,
    Proxy,
    Set,
    Throwables,
    TypeUtil
} from 'bugcore';
import fs from 'fs';
import npm from 'npm';
import path from 'path';
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
    RecipeFileStore,
    RecipeStore
} from '../stores';


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
         * @type {Set.<string>}
         */
        this.dependencyCacheSet             = new Set();

        /**
         * @pivate
         * @type {boolean}
         */
        this.npmLoaded                      = false;

        /**
         * @private
         * @type {Promise}
         */
        this.npmLoadingPromise              = null;

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
     * @return {boolean}
     */
    getNpmLoaded() {
        return this.npmLoaded;
    },

    /**
     * @return {Promise}
     */
    getNpmLoadingPromise() {
        return this.npmLoadingPromise;
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
     * @return {Promise}
     */
    getRecipe(recipeQuery) {
        return QueryController.query(recipeQuery)
            .then((recipeQueryResult) => {
                return this.ensureRecipeInstalled(recipeQueryResult.getName(), recipeQueryResult.getVersion());
            })
            .then((installedRecipeData) => {
                return this.loadRecipe(installedRecipeData.getName(), installedRecipeData.getVersion());
            });
    },

    /**
     * @param {string} recipeQuery
     * @return {Promise}
     */
    installRecipe(recipeQuery) {
        return QueryController.query(recipeQuery)
            .then((recipeQueryResult) => {
                return this.ensureRecipeInstalled(recipeQueryResult.getName(), recipeQueryResult.getVersion());
            });
    },

    /**
     * @param {string} recipeName
     * @param {string} recipeVersion
     * @returns {Promise<Recipe>}
     */
    loadRecipe(recipeName, recipeVersion) {
        return Promises.try(() => {
            const context = ContextController.getCurrentContext();
            const recipeStore = this.generateRecipeStore(context);
            return recipeStore.loadRecipe(recipeName, recipeVersion);
        });
    },

    /**
     * @param {string} recipePath
     * @return {Promise<RecipeFile>}
     */
    loadRecipeFile(recipePath) {
        return Promises.try(() => {
            const recipeFilePath = path.resolve(recipePath, RecipeController.RECIPE_FILE_NAME);
            return this.recipeFileStore.loadRecipeFile(recipeFilePath);
        });
    },

    /**
     * @param {string} recipePath
     * @return {Promise<RecipePackage>}
     */
    packageRecipe(recipePath) {
        return RecipePackage.fromPath(recipePath);
    },

    /**
     * @param {string} recipePath
     * @return {Promise<PublishKeyEntity>}
     */
    publishRecipe(recipePath) {
        return AuthController.auth()
            .then(() => {
                return this.loadRecipeFile(recipePath);
            })
            .then((recipeFile) => {
                return this.validateNewRecipe(recipeFile);
            })
            .then((recipeFile) => {
                return this.packageRecipe(recipePath)
                    .then((recipePackage) => {
                        return [recipeFile, recipePackage];
                    });
            })
            .then((results) => {
                const [recipeFile, recipePackage] = results;
                return this.ensureRecipeCreated(recipeFile.getName())
                    .then((recipeEntity) => {
                        return [recipeFile, recipePackage, recipeEntity];
                    });
            })
            .then((results) => {
                const [recipeFile, recipePackage, recipeEntity] = results;
                return this.verifyCurrentUserAccessToRecipe(recipeEntity)
                    .then(() => {
                        return [recipeFile, recipePackage];
                    });
            })
            .then((results) => {
                const [recipeFile, recipePackage] = results;
                return this.ensureRecipeVersionCreated(recipeFile)
                    .then((recipeVersionData) => {
                        return [recipeFile, recipePackage, recipeVersionData];
                    });
            })
            .then((results) => {
                const [recipeFile, recipePackage, recipeVersionData] = results;
                return this.createPublishKey(recipeFile, recipePackage, recipeVersionData)
                    .then((publishKeyEntity) => {
                        return [recipePackage, publishKeyEntity];
                    });
            })
            .then((results) => {
                const [recipePackage, publishKeyEntity] = results;
                console.log('publishing ' + publishKeyEntity.getRecipeName() + '@' + publishKeyEntity.getRecipeVersionNumber());
                return this.uploadRecipePackage(recipePackage, publishKeyEntity)
                    .then(() => {
                        return publishKeyEntity;
                    });
            });
    },

    unpackageRecipe(packagePath) {

    },

    /**
     * @param {RecipeFile} recipeFile
     * @return {Promise<RecipeFile>}
     */
    validateNewRecipe(recipeFile) {
        return Promises.try(() => {
            this.validateRecipe(recipeFile);
            return this.loadRecipeVersionEntity(recipeFile.getName(), recipeFile.getVersion())
                .then((entity) => {
                    if (entity) {
                        if (entity.getPublished()) {
                            throw Throwables.exception('RecipeVersionExists', {}, 'Recipe ' + recipeFile.getName() + '@' + recipeFile.getVersion() + ' has already been published');
                        }
                    }
                    return recipeFile;
                });
        });
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
     * @return {Promise<PublishKeyEntity>}
     */
    createPublishKey(recipeFile, recipePackage, recipeVersionEntity) {
        return PublishKeyManager.create({
            recipeHash: recipePackage.getRecipeHash(),
            recipeName: recipeFile.getName(),
            recipeVersionNumber: recipeVersionEntity.getVersionNumber()
        });
    },

    /**
     * @private
     * @param {{
     *      name: string
     * }} rawData
     * @return {Promise<RecipeEntity>}
     */
    createRecipeEntity(rawData) {
        return AuthController.getCurrentUser()
            .then((currentUser) => {
                ObjectUtil.assign(rawData, {
                    scope: 'public',
                    type: 'gulp'
                });
                return RecipeManager.create(rawData, currentUser.getUserData());
            });
    },

    /**
     * @private
     * @param {string} recipeName
     * @param {string} recipeVersion
     * @return {Promise<RecipeVersionEntity>}
     */
    createRecipeVersionEntity(recipeName, recipeVersion) {
        return RecipeVersionManager.create(recipeName, recipeVersion);
    },

    /**
     * @private
     * @param {string} recipeName
     * @param {string} recipeVersion
     * @return {Promise}
     */
    doRecipeInstall(recipeName, recipeVersion) {
        // TODO BRN:

        //-- check download cache to see if recipe has already been downloaded (ConfigController.get('cache')[default: $HOME/.recipe])
        //-- if not in cache,
        //--- load recipe and recipeVersion data from DB
        //--- ensure recipe and recipeVersion exist and user has access to both
        //--- download recipe from S3 and store in cache
        //-- copy taball to local install at [execPath]/.recipe/[recipeType]/[recipeScope]/[recipeName]/[recipeVersion] and extract
        //-- install npmDependencies in to local recipe folder [execPath]/.recipe/[recipeType]/[recipeScope]/[recipeName]/[recipeVersion]/node_modules

        return RecipeManager.get({recipeName, recipeScope: 'public', recipeType: 'gulp'})
            .then((recipeEntity) => {
                if (!recipeEntity) {
                    throw new Throwables.exception('RecipeDoesNotExist', {}, 'A gulp-recipe by the name "' + recipeName + '" does not exist.');
                }
                if (recipeVersionQuery) {
                    return this.resolveRecipeVersionQuery(recipeVersionQuery);
                }
                //
                return snapshot.val().lastPublishedVersion;
            })
            .then((recipeVersionNumber) => {
                return this.loadRecipeVersionEntity(recipeName, recipeVersionNumber)
                    .then((entity) => {
                        if (!entity) {
                            throw new Throwables.exception('RecipeVersionDoesNotExist', {}, 'Cannot find version "' + recipeVersionNumber + '" for gulp-recipe "' + recipeName + '".');
                        }
                        return entity;
                    });
            });
            /*.then((recipeVersion) => {
                //TODO BRN: Check the download cache
            });*/
    },

    /**
     * @private
     * @return {Promise}
     */
    ensureNpmLoaded() {
        return Promises.promise((resolve) => {
            if (!this.npmLoaded) {
                resolve(this.loadNpm());
            } else {
                resolve();
            }
        });
    },

    /**
     * @private
     * @param {string} recipeName
     * @return {Promise<RecipeEntity>}
     */
    ensureRecipeCreated(recipeName) {
        const recipeScope   = 'public';
        const recipeType    = 'gulp';
        return RecipeManager.get({ recipeName, recipeType, recipeScope })
            .then((recipeEntity) => {
                if (!recipeEntity) {
                    return this.createRecipeEntity({ name:recipeName });
                }
                return recipeEntity;
            });
    },

    /**
     * @private
     * @param {Recipe} recipe
     * @return {Promise}
     */
    ensureRecipeDependenciesInstalled(recipe) {
        return this.ensureNpmLoaded()
            .then(() => {
                const dependenciesToInstall = [];
                recipe.getDependencies().forEach((dependency) => {
                    if (!this.isDependencyInstalled(dependency)) {
                        dependenciesToInstall.push(dependency);
                    }
                });
                return this.installDependencies(dependenciesToInstall);
            }).then(() => {
                return recipe;
            });
    },

    /**
     * @private
     * @param {string} recipeName
     * @param {string} recipeVersion
     * @return {Promise}
     */
    ensureRecipeInstalled(recipeName, recipeVersion) {
        return this.loadRecipe(recipeName, recipeVersion)
            .then((recipe) => {
                if (!recipe) {
                    return this.doRecipeInstall(recipeName, recipeVersion);
                }
            });
    },

     /**
     * @private
     * @param {RecipeFile} recipeFile
     * @return {Promise<RecipeVersionEntity>}
     */
    ensureRecipeVersionCreated(recipeFile) {
        return this.loadRecipeVersionEntity(recipeFile.getName(), recipeFile.getVersion())
            .then((entity) => {
                if (!entity) {
                    return this.createRecipeVersionEntity(recipeFile.getName(), recipeFile.getVersion());
                }
                return entity;
            });
    },

    /**
     * @private
     * @param {string} recipeName
     * @return {Promise}
     */
    findAndDefineRecipe(recipeName) {
        this.tryFindRecipeObject(recipeName)
            .then((recipeObject) => {
                if (!recipeObject) {
                    throw Throwables.exception('CouldNotFindRecipe', {}, 'Could not find recipe by the name "' + recipeName + '"');
                }
                return this.define(recipeObject);
            });
    },

    /**
     * @private
     * @param {RecipeContext} context
     * @returns {RecipeStore}
     */
    generateRecipeStore(context) {
        const recipesDir    = path.resolve(context.getExecPath(), RecipeController.RECIPE_DIR_NAME);
        let recipeStore     = this.recipesDirToRecipeStoreMap.get(context);
        if (!recipeStore) {
            recipeStore         = new RecipeStore(recipesDir);
            this.recipesDirToRecipeStoreMap.put(recipesDir, recipeStore);
        }
        return recipeStore;
    },

    /**
     * @private
     * @param {Array.<string>} dependencies
     * @returns {Promise}
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
     * @param {string} dependency
     * @returns {boolean}
     */
    isDependencyInstalled(dependency) {
        let result = false;
        if (this.dependencyCacheSet.contains(dependency)) {
            return true;
        }
        try {
            result = !!require.resolve(dependency);
            this.dependencyCacheSet.add(dependency);
        } catch(error) {
            console.log('could not find dependency "' + dependency + '"'); //eslint-disable-line  no-console
        }
        return result;
    },

    /**
     * @private
     * @return {Promise}
     */
    loadNpm() {
        if (!this.npmLoadingPromise) {
            this.npmLoadingPromise = Promises.promise((resolve, reject) => {
                npm.on('log', (message) => {
                    console.log(message); //eslint-disable-line  no-console
                });
                npm.load({
                    loaded: false
                }, (error) => {
                    this.npmLoadingPromise = null;
                    if (error) {
                        this.npmLoaded = false;
                        return reject(error);
                    }
                    this.npmLoaded = true;
                    return resolve();
                });
            });
        }
        return this.npmLoadingPromise;
    },

    /**
     * @private
     * @param {string} recipeName
     * @param {string} versionNumber
     * @return {Promise<RecipeVersionEntity>}
     */
    loadRecipeVersionEntity(recipeName, versionNumber) {
        return RecipeVersionManager.get({
            recipeName,
            recipeScope: 'public',
            recipeType: 'gulp',
            versionNumber
        });
    },

    /**
     * @private
     * @param {string} recipeQuery
     * @return {{
     *      name: string,
     *      versionQuery: string
     * }}
     */
    parseRecipeQuery(recipeQuery) {
        if (recipeQuery.indexOf('@') > -1) {
            const parts = recipeQuery.split('@');
            return {
                name: parse[0],
                versionQuery: parts[1]
            };
        }
        return {
            name: recipeQuery,
            versionQuery: ''
        };
    },

    /**
     * @private
     * @param {string} recipeVersionQuery
     * @returns {Promise}
     */
    resolveRecipeVersionQuery(recipeVersionQuery) {
        //TODO BRN: resolve the query to the correct version for this query.
        return Promises.resolve(recipeVersionQuery);
    },

    /**
     * @private
     * @param {string} recipeName
     * @returns {{
     *      dependencies: Array.<string>,
     *      recipe: function(function(Error), *...)
     * }}
     */
    tryFindRecipeObject(recipeName) {
        let recipeObject = null;
        try {
            recipeObject = fs.readFile(this.recipesDir + path.sep + recipeName + path.sep + 'recipe.json');
        } catch(error) {} //eslint-disable-line  no-empty
        return recipeObject;
    },

    /**
     * @private
     * @param {RecipePackage} recipePackage
     * @param {PublishKeyEntity} publishKeyEntity
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
     * @param {RecipeEntity} recipeEntity
     * @return {Promise}
     */
    verifyCurrentUserAccessToRecipe(recipeEntity) {
        return AuthController.getCurrentUser()
            .then((currentUser) => {
                return RecipeCollaboratorManager.get({
                    recipeName: recipeEntity.getName(),
                    userId: currentUser.getUserData().getId()
                });
            })
            .then((entity) => {
                if (!entity) {
                    throw Throwables.exception('AccessDenied', {}, 'User does not have access to publish to recipe "' + recipeEntity.getName() + '"');
                }
            });
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

/**
 * @static
 * @private
 * @enum {string}
 */
RecipeController.RECIPE_DIR_NAME    = '.recipe';

/**
 * @static
 * @private
 * @enum {string}
 */
RecipeController.RECIPE_FILE_NAME   = 'recipe.json';


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
