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
const RecipeDownloadCache = Class.extend(Obj, {

    _name: 'recipe.RecipeDownloadCache',


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
         * @type {Map.<string, RecipeDownload>}
         */
        this.cacheKeyToRecipeDownloadMap  = new Map();
    },


    //-------------------------------------------------------------------------------
    // Getters and Setters
    //-------------------------------------------------------------------------------

    /**
     * @return {string}
     */
    getCacheDir() {
        return this.cacheDir;
    },

    /**
     * @return {Map.<string, RecipeDownload>}
     */
    getCacheKeyToRecipeDownloadMap() {
        return this.cacheKeyToRecipeDownloadMap;
    },


    //-------------------------------------------------------------------------------
    // Public Methods
    //-------------------------------------------------------------------------------

    /**
     * @param {string} recipeUrl
     * @return {boolean}
     */
    delete(recipeUrl) {
        const cacheKey = this.makeCacheKey(recipeUrl);
        return this.cacheKeyToRecipeDownloadMap.delete(cacheKey);
    },

    /**
     * @param {string} recipeUrl
     * @return {RecipeDownload}
     */
    get(recipeUrl) {
        const cacheKey = this.makeCacheKey(recipeUrl);
        return this.cacheKeyToRecipeDownloadMap.get(cacheKey);
    },

    /**
     * @param {string} recipeUrl
     * @return {boolean}
     */
    has(recipeUrl) {
        const cacheKey = this.makeCacheKey(recipeUrl);
        return this.cacheKeyToRecipeDownloadMap.containsKey(cacheKey);
    },

    /**
     * @param {string} recipeUrl
     * @param {RecipeDownload} recipeDownload
     * @return {RecipeDownload}
     */
    set(recipeUrl, recipeDownload) {
        const cacheKey = this.makeCacheKey(recipeUrl);
        return this.cacheKeyToRecipeDownloadMap.put(cacheKey, recipeDownload);
    },


    //-------------------------------------------------------------------------------
    // Private Methods
    //-------------------------------------------------------------------------------

    /**
     * @private
     * @param {string} recipeUrl
     * @return {string}
     */
    makeCacheKey(recipeUrl) {
        return recipeUrl;
    }
});


//-------------------------------------------------------------------------------
// Exports
//-------------------------------------------------------------------------------

export default RecipeDownloadCache;
