//-------------------------------------------------------------------------------
// Imports
//-------------------------------------------------------------------------------

var bugcore         = require('bugcore');
var npm             = require('npm');
var path            = require('path');
var Recipe          = require('./core/Recipe');
var RecipeStore     = require('./core/RecipeStore');


//-------------------------------------------------------------------------------
// Simplify References
//-------------------------------------------------------------------------------

var Class           = bugcore.Class;
var Obj             = bugcore.Obj;
var Promises        = bugcore.Promises;
var Proxy           = bugcore.Proxy;
var Set             = bugcore.Set;
var Throwables      = bugcore.Throwables;
var TypeUtil        = bugcore.TypeUtil;


//-------------------------------------------------------------------------------
// Declare Class
//-------------------------------------------------------------------------------

/**
 * @class
 * @extends {Obj}
 */
var GulpRecipe = Class.extend(Obj, {

    _name: 'gulprecipe.GulpRecipe',


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
         * @type {string}
         */
        this.defaultRecipesDir  = __dirname + path.sep + 'recipes';

        /**
         * @private
         * @type {Set.<string>}
         */
        this.dependencyCacheSet = new Set();

        /**
         * @pivate
         * @type {boolean}
         */
        this.npmLoaded          = false;

        /**
         * @private
         * @type {Promise}
         */
        this.npmLoadingPromise  = null;

        /**
         * @private
         * @type {string}
         */
        this.recipesDir         = process.cwd() + path.sep + 'gulp-recipes';

        /**
         * @private
         * @type {RecipeStore}
         */
        this.recipeStore        = new RecipeStore();
    },


    //-------------------------------------------------------------------------------
    // Getters and Setters
    //-------------------------------------------------------------------------------

    /**
     * @return {string}
     */
    getDefaultRecipeDir: function() {
        return this.defaultRecipesDir;
    },

    /**
     * @return {string}
     */
    getRecipesDir: function() {
        return this.recipesDir;
    },

    /**
     * @return {RecipeStore}
     */
    getRecipeStore: function() {
        return this.recipeStore;
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
                this.recipesDir = configObject.recipesDir;
            }
        } else {
            throw Throwables.illegalArgumentBug('configObject', configObject, 'must be an object');
        }
    },

    /**
     * @param {string} recipeName
     * @param {{
     *      dependencies: Array.<string>,
     *      recipe: function(function(Error), *...)
     * }} recipeObject
     * @return {Recipe}
     */
    define: function(recipeName, recipeObject) {
        var elfRecipe = new Recipe(recipeObject.dependencies, recipeObject.recipe);
        this.recipeStore.setRecipe(recipeName, elfRecipe);
        return elfRecipe;
    },

    /**
     * @param {string} recipeName
     * @return {function(function(Error), *...)}
     */
    get: function(recipeName) {
        var _this       = this;
        var recipeArgs    = Array.prototype.slice.call(arguments);
        recipeArgs.shift();

        return function() {
            var gulpArgs = Array.prototype.slice.call(arguments);
            return _this.loadRecipe(recipeName)
                .then(function(recipe) {
                    return recipe.runRecipe(gulpArgs.concat(recipeArgs));
                });
        };
    },


    //-------------------------------------------------------------------------------
    // Private Methods
    //-------------------------------------------------------------------------------

    /**
     * @private
     * @return {Promise}
     */
    ensureNpmLoaded: function() {
        var _this = this;
        return Promises.promise(function(resolve) {
            if (!_this.npmLoaded) {
                resolve(_this.loadNpm());
            } else {
                resolve();
            }
        });
    },

    /**
     * @private
     * @param {Recipe} elfRecipe
     * @return {Promise}
     */
    ensureRecipeDependenciesInstalled: function(elfRecipe) {
        var _this = this;
        return this.ensureNpmLoaded()
            .then(function() {
                var dependenciesToInstall = [];
                elfRecipe.getDependencies().forEach(function(dependency) {
                    if (!_this.isDependencyInstalled(dependency)) {
                        dependenciesToInstall.push(dependency);
                    }
                });
                return _this.installDependencies(dependenciesToInstall);
            }).then(function() {
                return elfRecipe;
            });
    },

    /**
     * @private
     * @param {string} recipeName
     * @return {Recipe}
     */
    findAndDefineRecipe: function(recipeName) {
        var recipeObject = this.tryFindRecipeObject(recipeName);
        if (!recipeObject) {
            recipeObject = this.tryFindDefaultRecipeObject(recipeName);
            if (!recipeObject) {
                throw Throwables.exception('CouldNotFindRecipe', {}, 'Could not find recipe by the name "' + recipeName + '"');
            }
        }
        return this.define(recipeName, recipeObject);
    },

    /**
     * @private
     * @param {Array.<string>} dependencies
     * @returns {Promise}
     */
    installDependencies: function(dependencies) {
        return Promises.promise(function(resolve, reject) {
            if (dependencies.length > 0) {
                npm.commands.install(dependencies, function(error) {
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
        var result = false;
        if (this.dependencyCacheSet.contains(dependency)) {
            return true;
        }
        try {
            result = !!require.resolve(dependency);
            this.dependencyCacheSet.add(dependency);
        } catch(e) {
            console.log('could not find dependency "' + dependency + '"'); //eslint-disable-line  no-console
        }
        return result;
    },

    /**
     * @return {Promise}
     */
    loadNpm: function() {
        var _this = this;
        if (!this.npmLoadingPromise) {
            this.npmLoadingPromise = Promises.promise(function(resolve, reject) {
                npm.on('log', function (message) {
                    console.log(message); //eslint-disable-line  no-console
                });
                npm.load({
                    loaded: false
                }, function(error) {
                    _this.npmLoadingPromise = null;
                    if (error) {
                        _this.npmLoaded = false;
                        return reject(error);
                    } else {
                        _this.npmLoaded = true;
                        return resolve();
                    }
                });
            });
        }
        return this.npmLoadingPromise;
    },

    /**
     * @private
     * @param {string} recipeName
     * @returns {Promise}
     */
    loadRecipe: function(recipeName) {
        var _this = this;
        return Promises.try(function() {
            var elfRecipe = _this.recipeStore.getRecipe(recipeName);
            if (!elfRecipe) {
                elfRecipe = _this.findAndDefineRecipe(recipeName);
            }
            return _this.ensureRecipeDependenciesInstalled(elfRecipe);
        });
    },

    /**
     * @private
     * @param {string} recipeName
     * @returns {{
     *      dependencies: Array.<string>,
     *      recipe: function(function(Error), *...)
     * }}
     */
    tryFindDefaultRecipeObject: function(recipeName) {
        var recipeObject = null;
        try {
            recipeObject = require(this.defaultRecipesDir + '/' + recipeName);
        } catch(e) {} //eslint-disable-line  no-empty
        return recipeObject;
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
        var recipeObject = null;
        try {
            recipeObject = require(this.recipesDir + '/' + recipeName);
        } catch(e) {} //eslint-disable-line  no-empty
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
