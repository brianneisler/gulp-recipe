//-------------------------------------------------------------------------------
// Imports
//-------------------------------------------------------------------------------

import {
    Class,
    Obj,
    Promises,
    Proxy,
    Set,
    Throwables,
    TypeUtil
} from 'bugcore';
import fs from 'fs';
import npm from 'npm';
import path from 'path';
import AuthController from './controllers/AuthController';
import Recipe from './core/Recipe';
import RecipeStore from './core/RecipeStore';
import DataRecipe from './data/Recipe';
import DataRecipeVersion from './data/RecipeVersion';


//-------------------------------------------------------------------------------
// Declare Class
//-------------------------------------------------------------------------------

/**
 * @class
 * @extends {Obj}
 */
var GulpRecipe = Class.extend(Obj, {

    _name: 'recipe.GulpRecipe',


    //-------------------------------------------------------------------------------
    // Constructor
    //-------------------------------------------------------------------------------

    /**
     * @constructs
     */
    _constructor: function() {

        this._super();


        //-------------------------------------------------------------------------------
        // Public Properties
        //-------------------------------------------------------------------------------

        /**
         * @private
         * @type {RecipeStore}
         */
        this.currentRecipeStore     = null;

        /**
         * @private
         * @type {Set.<string>}
         */
        this.dependencyCacheSet     = new Set();

        /**
         * @pivate
         * @type {boolean}
         */
        this.npmLoaded              = false;

        /**
         * @private
         * @type {Promise}
         */
        this.npmLoadingPromise      = null;

        /**
         * @private
         * @type {Map.<string, RecipeStore>}
         */
        this.recipeStoreMap         = new Map();
    },


    //-------------------------------------------------------------------------------
    // Init Methods
    //-------------------------------------------------------------------------------

    /**
     * @return {GulpRecipe}
     */
    init: function() {
        const _this = this._super();
        if (_this) {
            _this.configure({
                recipesDir: path.resolve(process.cwd() + path.sep + 'gulp-recipes')
            });
        }
        return _this;
    },


    //-------------------------------------------------------------------------------
    // Getters and Setters
    //-------------------------------------------------------------------------------

    /**
     * @return {RecipeStore}
     */
    getCurrentRecipeStore: function() {
        return this.currentRecipeStore;
    },

    /**
     * @return {Map.<string, RecipeStore>}
     */
    getRecipeStoreMap: function() {
        return this.recipeStoreMap;
    },


    //-------------------------------------------------------------------------------
    // Public Methods
    //-------------------------------------------------------------------------------

    /**
     * @param {{
     *      recipesDir: string
     * }} configObject
     */
    configure: function(configObject) {
        if (TypeUtil.isObject(configObject)) {
            if (TypeUtil.isString(configObject.recipesDir)) {
                this.configureRecipesDir(configObject.recipesDir);
            }
        } else {
            throw Throwables.illegalArgumentBug('configObject', configObject, 'must be an object');
        }
    },

    /**
     * @param {{
     *      main: string,
     *      name: string,
     *      npmDependencies: Object.<string, string>,
     *      version: string
     * }} recipeObject
     * @return {Recipe}
     */
    define: function(recipeObject) {
        const gulpRecipe = new Recipe(recipeObject);
        this.recipeStore.setRecipe(gulpRecipe.getName(), gulpRecipe);
        return gulpRecipe;
    },

    /**
     * @param {string} recipeIdentifier
     * @return {function(function(Error), *...)}
     */
    get: function(recipeIdentifier) {
        var recipeArgs  = Array.prototype.slice.call(arguments);
        recipeArgs.shift();

        return () => {
            const gulpArgs = Array.prototype.slice.call(arguments);
            const [ recipeName, recipeVersionQuery ] = this.parseRecipeIdentifier(recipeIdentifier);
            return this.ensureRecipeInstalled(recipeName, recipeVersionQuery)
                .then((installedRecipeData) => {
                    return this.loadRecipe(installedRecipeData.recipeName, installedRecipeData.recipeVersion);
                })
                .then((recipe) => {
                    return recipe.runRecipe(gulpArgs.concat(recipeArgs));
                });
        };
    },

    /**
     * @param {string} email
     * @param {string} password
     * @param {{}} options
     */
    login: function(email, password, options) {
        AuthController.login(email, password, options);
    },


    //-------------------------------------------------------------------------------
    // Private Methods
    //-------------------------------------------------------------------------------

    /**
     * @private
     * @param {string} recipesDir
     */
    configureRecipesDir: function(recipesDir) {
        const recipeStore = new RecipeStore(recipesDir);
        this.recipeStoreMap.put(recipesDir, recipeStore);
        this.currentRecipeStore = recipeStore;
    },

    /**
     * @private
     * @return {Promise}
     */
    ensureNpmLoaded: function() {
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
     * @param {Recipe} gulpRecipe
     * @return {Promise}
     */
    ensureRecipeDependenciesInstalled: function(gulpRecipe) {
        return this.ensureNpmLoaded()
            .then(() => {
                const dependenciesToInstall = [];
                gulpRecipe.getDependencies().forEach((dependency) => {
                    if (!this.isDependencyInstalled(dependency)) {
                        dependenciesToInstall.push(dependency);
                    }
                });
                return this.installDependencies(dependenciesToInstall);
            }).then(() => {
                return gulpRecipe;
            });
    },

    /**
     * @private
     * @param {string} recipeName
     * @param {string} recipeVersionQuery
     * @return {Promise}
     */
    ensureRecipeInstalled: function(recipeName, recipeVersionQuery) {
        return DataRecipe.get(recipeName)
            .then((snapshot) => {
                if (!snapshot.exists()) {
                    throw new Throwables.exception('RecipeDoesNotExist', {}, 'A gulp-recipe by the name "' + recipeName + '" does not exist.');
                }
                if (recipeVersionQuery) {
                    return this.resolveRecipeVersionQuery(recipeVersionQuery);
                }
                return snapshot.val().lastPublishedVersion;
            })
            .then((recipeVersionNumber) => {
                return DataRecipeVersion.get(recipeName, recipeVersionNumber)
                    .then((snapshot) => {
                        if (!snapshot.exists()) {
                            throw new Throwables.exception('RecipeVersionDoesNotExist', {}, 'Cannot find version "' + recipeVersionNumber + '" for gulp-recipe "' + recipeName + '".');
                        }
                        return snapshot.val();
                    });
            })
            .then((recipeVersion) => {
                //TODO BRN: Check the download cache
            });
    },

    /**
     * @private
     * @param {string} recipeName
     * @return {Promise}
     */
    findAndDefineRecipe: function(recipeName) {
        this.tryFindRecipeObject(recipeName)
            .then((recipeObject) => {
                if (!recipeObject) {
                    throw Throwables.exception('CouldNotFindRecipe', {}, 'Could not find recipe by the name "' + recipeName + '"');
                }
            });

        return this.define(recipeName, recipeObject);
    },

    /**
     * @private
     * @param {Array.<string>} dependencies
     * @returns {Promise}
     */
    installDependencies: function(dependencies) {
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
    isDependencyInstalled: function(dependency) {
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
     * @return {Promise}
     */
    loadNpm: function() {
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
     * @param {string} recipeVersion
     * @returns {Promise}
     */
    loadRecipe: function(recipeName, recipeVersion) {
        return Promises.try(() => {
            let gulpRecipe = this.currentRecipeStore.getRecipe(recipeName);
            if (!gulpRecipe) {
                gulpRecipe = this.findAndDefineRecipe(recipeName);
            }
            return this.ensureRecipeDependenciesInstalled(gulpRecipe);
        });
    },

    /**
     * @private
     * @param {string} recipeIdentifier
     * @return {[string, string]}
     */
    parseRecipeIdentifier: function(recipeIdentifier) {
        if (recipeIdentifier.indexOf('@') > -1) {
            return recipeIdentifier.split('@');
        }
        return [recipeIdentifier, ''];
    },

    /**
     * @private
     * @param {string} recipeVersionQuery
     * @returns {Promise}
     */
    resolveRecipeVersionQuery: function(recipeVersionQuery) {
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
    tryFindRecipeObject: function(recipeName) {
        let recipeObject = null;
        try {
            recipeObject = fs.readFile(this.recipesDir + path.sep + recipeName + path.sep + 'recipe.json');
        } catch(error) {} //eslint-disable-line  no-empty
        return recipeObject;
    }
});


//-------------------------------------------------------------------------------
// Public Static Properties
//-------------------------------------------------------------------------------

/**
 * @static
 * @type {function(new:Recipe)}
 */
GulpRecipe.Recipe         = Recipe;

/**
 * @static
 * @type {function(new:RecipeStore)}
 */
GulpRecipe.RecipeStore    = RecipeStore;


//-------------------------------------------------------------------------------
// Private Static Properties
//-------------------------------------------------------------------------------

/**
 * @static
 * @private
 * @type {BugCore}
 */
GulpRecipe.instance        = null;


//-------------------------------------------------------------------------------
// Static Methods
//-------------------------------------------------------------------------------

/**
 * @static
 * @return {GulpRecipe}
 */
GulpRecipe.getInstance = function() {
    if (GulpRecipe.instance === null) {
        GulpRecipe.instance = new GulpRecipe();
    }
    return GulpRecipe.instance;
};


//-------------------------------------------------------------------------------
// Static Proxy
//-------------------------------------------------------------------------------

Proxy.proxy(GulpRecipe, Proxy.method(GulpRecipe.getInstance), [
    'configure',
    'define',
    'get'
]);


//-------------------------------------------------------------------------------
// Exports
//-------------------------------------------------------------------------------

module.exports = GulpRecipe;
