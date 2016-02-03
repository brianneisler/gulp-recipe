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
import path from 'path';
import request from 'request';
import AuthController from './AuthController';
import ConfigController from './ConfigController';
import PublishKey from '../entities/PublishKey';
import PublishKeyData from '../data/PublishKeyData';
import Recipe from '../entities/Recipe';
import RecipeData from '../data/RecipeData';
import RecipeFile from '../core/RecipeFile';
import RecipePackage from '../core/RecipePackage';
import RecipeVersion from '../entities/RecipeVersion';
import RecipeVersionData from '../data/RecipeVersionData';


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
         * @type {Map.<string, RecipeFile>}
         */
        this.recipeFileCache = new Map();
    },


    //-------------------------------------------------------------------------------
    // Public Methods
    //-------------------------------------------------------------------------------

    /**
     * @param {string} recipePath
     * @return {Promise<RecipeFile>}
     */
    loadRecipeFile(recipePath) {
        const recipeFilePath = path.resolve(recipePath, RecipeController.RECIPE_FILE_NAME);
        const recipeFile = this.recipeFileCache.get(recipeFilePath);
        if (!recipeFile) {
            return RecipeFile.loadFromFile(recipeFilePath)
                .then((loadedRecipeFile) => {
                    this.recipeFileCache.put(recipeFilePath, loadedRecipeFile);
                    return loadedRecipeFile;
                });
        }
        return Promises.resolve(recipeFile);
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
     * @return {Promise}
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
                    .then((recipeData) => {
                        return [recipeFile, recipePackage, recipeData];
                    });
            })
            .then((results) => {
                const [recipeFile, recipePackage, recipeData] = results;
                return this.verifyCurrentUserAccessToRecipe(recipeData)
                    .then(() => {
                        return [recipeFile, recipePackage];
                    });
            })
            .then((results) => {
                const [recipeFile, recipePackage] = results;
                return this.ensureRecipeVersionCreated(recipeFile)
                    .then(() => {
                        return [recipeFile, recipePackage];
                    });
            })
            .then((results) => {
                const [recipeFile, recipePackage] = results;
                return this.createPublishKey(recipeFile, recipePackage)
                    .then((publishKeyData) => {
                        return [recipePackage, publishKeyData];
                    });
            })
            .then((results) => {
                const [recipePackage, publishKeyData] = results;
                console.log('publishing ' + publishKeyData.getRecipeName() + '@' + publishKeyData.getRecipeVersionNumber());
                return this.uploadRecipePackage(recipePackage, publishKeyData)
                    .then(() => {
                        return publishKeyData;
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
            return RecipeVersion.get(recipeFile.getName(), recipeFile.getVersion())
                .then((snapshot) => {
                    if (snapshot.exists()) {
                        const data = snapshot.val();
                        if (data.published) {
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
     * @return {Promise<PublishKeyData>}
     */
    createPublishKey(recipeFile, recipePackage) {
        return PublishKey.create({
            recipeHash: recipePackage.getRecipeHash(),
            recipeName: recipeFile.getName(),
            recipeVersionNumber: recipeFile.getVersion()
        }).then((data) => {
            return new PublishKeyData(data);
        });
    },

    /**
     * @private
     * @param {{
     *      name: string
     * }} data
     * @return {Promise<RecipeData>}
     */
    createRecipe(data) {
        return AuthController.getCurrentUser()
            .then((currentUser) => {
                return Recipe.create(data, currentUser.getUserData())
                    .then((newData) => {
                        return new RecipeData(newData);
                    });
            });
    },

    /**
     * @private
     * @param {string} recipeName
     * @param {{
     *      versionNumber: string,
     * }} data
     * @return {Promise<RecipeVersionData>}
     */
    createRecipeVersion(recipeName, data) {
        return RecipeVersion.create(recipeName, data)
            .then((newData) => {
                return new RecipeVersionData(newData);
            });
    },

    /**
     * @private
     * @param {string} recipeName
     * @return {Promise<RecipeData>}
     */
    ensureRecipeCreated(recipeName) {
        return Recipe.get(recipeName)
            .then((snapshot) => {
                if (!snapshot.exists()) {
                    return this.createRecipe({ name:recipeName });
                }
                return new RecipeData(snapshot.val());
            });
    },

    /**
     * @private
     * @param {RecipeFile} recipeFile
     * @return {Promise<RecipeVersionData>}
     */
    ensureRecipeVersionCreated(recipeFile) {
        return RecipeVersion.get(recipeFile.getName(), recipeFile.getVersion())
            .then((snapshot) => {
                if (!snapshot.exists()) {
                    return this.createRecipeVersion(recipeFile.getName(), {
                        versionNumber: recipeFile.getVersion()
                    });
                }
                return new RecipeVersionData(snapshot.val());
            });
    },

    /**
     * @private
     * @param {RecipePackage} recipePackage
     * @param {PublishKeyData} publishKeyData
     */
    uploadRecipePackage(recipePackage, publishKeyData) {
        return Promises.props({
            debug: ConfigController.getConfigProperty('debug'),
            serverUrl: ConfigController.getConfigProperty('serverUrl')
        }).then((config) => {
            return Promises.promise((resolve, reject) => {
                const req = request.post(config.serverUrl + '/api/v1/publish', {
                    auth: {
                        bearer: publishKeyData.getKey()
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
        if (!TypeUtil.isString(recipeVersion)) {
            throw Throwables.exception('RecipeInvalid', {}, 'Recipe version must be a string');
        }
        if (!(/^[0-9]\.[0-9]\.[0-9]$/).test(recipeVersion)) {
            throw Throwables.exception('RecipeInvalid', {}, 'Recipe version must of of the format [number].[number].[number]');
        }
    },

    /**
     * @private
     * @param {RecipeData} recipeData
     * @return {Promise}
     */
    verifyCurrentUserAccessToRecipe(recipeData) {
        return AuthController.getCurrentUser()
            .then((currentUser) => {
                if (!recipeData.getCollaborators()[currentUser.getUserData().getId()]) {
                    throw Throwables.exception('AccessDenied', {}, 'User does not have access to publish to recipe "' + recipeData.getName() + '"');
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
RecipeController.instance        = null;

/**
 * @static
 * @enum {string}
 */
RecipeController.RECIPE_FILE_NAME = 'recipe.json';


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
