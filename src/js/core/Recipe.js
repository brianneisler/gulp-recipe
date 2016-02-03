//-------------------------------------------------------------------------------
// Imports
//-------------------------------------------------------------------------------

import {
    Class,
    Obj,
    Throwables,
    TypeUtil
} from 'bugcore';
import path from 'path';


//-------------------------------------------------------------------------------
// Declare Class
//-------------------------------------------------------------------------------

/**
 * @class
 * @extends {Obj}
 */
const Recipe = Class.extend(Obj, {

    _name: 'recipe.Recipe',


    //-------------------------------------------------------------------------------
    // Constructor
    //-------------------------------------------------------------------------------

    /**
     * @constructs
     */
    _constructor() {

        this._super();


        //-------------------------------------------------------------------------------
        // Private Properties
        //-------------------------------------------------------------------------------

        /**
         * @private
         * @type {string}
         */
        this.main               = '';

        /**
         * @private
         * @type {string}
         */
        this.name               = '';

        /**
         * @private
         * @type {Object.<string, string>}
         */
        this.npmDependencies    = {};

         /**
         * @private
         * @type {function(function(Error), *)}
         */
        this.recipeMethod       = null;

        /**
         * @private
         * @type {RecipeStore}
         */
        this.recipeStore        = null;

        /**
         * @private
         * @type {string}
         */
        this.version            = '';
    },


    //-------------------------------------------------------------------------------
    // Init Methods
    //-------------------------------------------------------------------------------

    /**
     * @param {RecipeStore} recipeStore
     * @param {{
     *      main: string,
     *      name: string,
     *      npmDependencies: Object.<string, string>,
     *      version: string
     * }} recipeObject
     * @return {Recipe}
     */
    init(recipeStore, recipeObject) {
        const _this = this._super();
        if (_this) {
            if (!recipeStore) {
                throw new Throwables.illegalArgumentBug('recipeStore', recipeStore, 'must be supplied');
            }
            if (!TypeUtil.isObject(recipeObject)) {
                throw new Throwables.illegalArgumentBug('recipeObject', recipeObject, 'must be an object');
            }
            if (!TypeUtil.isString(recipeObject.name)) {
                throw new Throwables.illegalArgumentBug('recipeObject.name', recipeObject.name, 'must be a string');
            }
            if (!TypeUtil.isString(recipeObject.main)) {
                throw new Throwables.illegalArgumentBug('recipeObject.main', recipeObject.main, 'must be a string');
            }
            if (!TypeUtil.isString(recipeObject.version)) {
                throw new Throwables.illegalArgumentBug('recipeObject.version', recipeObject.version, 'must be a string');
            }
            _this.recipeStore = recipeStore;
            _this.main = recipeObject.main;
            _this.name = recipeObject.name;
            _this.version = recipeObject.version;
            if (TypeUtil.isObject(recipeObject.npmDependencies)) {
                _this.npmDependencies = recipeObject.npmDependencies;
            }
        }
        return _this;
    },


    //-------------------------------------------------------------------------------
    // Getters and Setters
    //-------------------------------------------------------------------------------

    /**
     * @return {string}
     */
    getMain() {
        return this.main;
    },

    /**
     * @return {string}
     */
    getName() {
        return this.name;
    },

    /**
     * @return {Object.<string, string>}
     */
    getNpmDependencies() {
        return this.npmDependencies;
    },

    /**
     * @return {function(function(Error), *)}
     */
    getRecipeMethod() {
        return this.recipeMethod;
    },

    /**
     * @return {RecipeStore}
     */
    getRecipeStore() {
        return this.recipeStore;
    },

    /**
     * @return {string}
     */
    getVersion() {
        return this.version;
    },


    //-------------------------------------------------------------------------------
    // Public Methods
    //-------------------------------------------------------------------------------

    /**
     * @param {Array.<*>} recipeArgs
     */
    runRecipe(recipeArgs) {
        if (!this.recipeMethod) {
            this.recipeMethod = require(path.resolve(this.recipeStore.getRecipesDir(), this.name, this.main));
        }
        return this.recipeMethod.apply(null, recipeArgs);
    }
});


//-------------------------------------------------------------------------------
// Exports
//-------------------------------------------------------------------------------

export default Recipe;
