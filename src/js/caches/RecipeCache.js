//-------------------------------------------------------------------------------
// Imports
//-------------------------------------------------------------------------------

import {
    Class,
    Map,
    Obj
} from 'bugcore';


//-------------------------------------------------------------------------------
// Declare Class
//-------------------------------------------------------------------------------

/**
 * @class
 * @extends {Obj}
 */
const RecipeCache = Class.extend(Obj, {

    _name: 'recipe.RecipeCache',


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
         * @type {Map.<string, Recipe>}
         */
        this.cacheKeyToRecipeMap  = new Map();
    },


    //-------------------------------------------------------------------------------
    // Getters and Setters
    //-------------------------------------------------------------------------------

    /**
     * @return {Map.<string, Recipe>}
     */
    getCacheKeyToRecipeMap() {
        return this.cacheKeyToRecipeMap;
    },


    //-------------------------------------------------------------------------------
    // Public Methods
    //-------------------------------------------------------------------------------

    /**
     * @param {string} recipeType
     * @param {string} recipeScope
     * @param {string} recipeName
     * @param {string} recipeVersionNumber
     * @return {boolean}
     */
    delete(recipeType, recipeScope, recipeName, recipeVersionNumber) {
        const cacheKey = this.makeCacheKey(recipeType, recipeScope, recipeName,  recipeVersionNumber);
        return this.cacheKeyToRecipeMap.delete(cacheKey);
    },

    /**
     * @param {string} recipeType
     * @param {string} recipeScope
     * @param {string} recipeName
     * @param {string} recipeVersionNumber
     * @return {Recipe}
     */
    get(recipeType, recipeScope, recipeName, recipeVersionNumber) {
        const cacheKey = this.makeCacheKey(recipeType, recipeScope, recipeName,  recipeVersionNumber);
        return this.cacheKeyToRecipeMap.get(cacheKey);
    },

    /**
     * @param {string} recipeType
     * @param {string} recipeScope
     * @param {string} recipeName
     * @param {string} recipeVersionNumber
     * @return {boolean}
     */
    has(recipeType, recipeScope, recipeName, recipeVersionNumber) {
        const cacheKey = this.makeCacheKey(recipeType, recipeScope, recipeName,  recipeVersionNumber);
        return this.cacheKeyToRecipeMap.containsKey(cacheKey);
    },

    /**
     * @param {string} recipeType
     * @param {string} recipeScope
     * @param {string} recipeName
     * @param {string} recipeVersionNumber
     * @param {Recipe} recipe
     * @return {Recipe}
     */
    set(recipeType, recipeScope, recipeName, recipeVersionNumber, recipe) {
        const cacheKey = this.makeCacheKey(recipeType, recipeScope, recipeName,  recipeVersionNumber);
        return this.cacheKeyToRecipeMap.put(cacheKey, recipe);
    },


    //-------------------------------------------------------------------------------
    // Private Methods
    //-------------------------------------------------------------------------------

    /**
     * @private
     * @param {string} recipeType
     * @param {string} recipeScope
     * @param {string} recipeName
     * @param {string} recipeVersionNumber
     * @return {string}
     */
    makeCacheKey(recipeType, recipeScope, recipeName, recipeVersionNumber) {
        return recipeType + '@' + recipeScope + '@' + recipeName + '@' + recipeVersionNumber;
    }
});


//-------------------------------------------------------------------------------
// Exports
//-------------------------------------------------------------------------------

export default RecipeCache;
