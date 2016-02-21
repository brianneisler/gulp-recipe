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
     * @param {string} recipeName
     * @param {string} recipeVersion
     * @return {boolean}
     */
    deleteRecipe(recipeName, recipeVersion) {
        const cacheKey = this.makeCacheKey(recipeName,  recipeVersion);
        return this.cacheKeyToRecipeMap.delete(cacheKey);
    },

    /**
     * @param {string} recipeName
     * @param {string} recipeVersion
     * @return {Recipe}
     */
    getRecipe(recipeName, recipeVersion) {
        const cacheKey = this.makeCacheKey(recipeName,  recipeVersion);
        return this.cacheKeyToRecipeMap.get(cacheKey);
    },

    /**
     * @param {string} recipeName
     * @param {string} recipeVersion
     * @return {boolean}
     */
    hasRecipe(recipeName, recipeVersion) {
        const cacheKey = this.makeCacheKey(recipeName,  recipeVersion);
        return this.cacheKeyToRecipeMap.containsKey(cacheKey);
    },

    /**
     * @param {string} recipeName
     * @param {string} recipeVersion
     * @param {Recipe} recipe
     * @return {Recipe}
     */
    setRecipe(recipeName, recipeVersion, recipe) {
        const cacheKey = this.makeCacheKey(recipeName,  recipeVersion);
        return this.cacheKeyToRecipeMap.put(cacheKey, recipe);
    },


    //-------------------------------------------------------------------------------
    // Private Methods
    //-------------------------------------------------------------------------------

    /**
     * @private
     * @param {string} recipeName
     * @param {string} recipeVersion
     * @return {string}
     */
    makeCacheKey(recipeName, recipeVersion) {
        return recipeName + '@' + recipeVersion;
    }
});


//-------------------------------------------------------------------------------
// Exports
//-------------------------------------------------------------------------------

export default RecipeCache;
