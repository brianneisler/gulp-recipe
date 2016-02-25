//-------------------------------------------------------------------------------
// Imports
//-------------------------------------------------------------------------------

import {
    Class,
    Map,
    Obj
} from 'bugcore';
import path from 'path';


//-------------------------------------------------------------------------------
// Declare Class
//-------------------------------------------------------------------------------

/**
 * @class
 * @extends {Obj}
 */
const RecipeFileCache = Class.extend(Obj, {

    _name: 'recipe.RecipeFileCache',


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
         * @type {Map.<string, RecipeFile>}
         */
        this.cacheKeyToRecipeFileMap  = new Map();
    },


    //-------------------------------------------------------------------------------
    // Getters and Setters
    //-------------------------------------------------------------------------------

    /**
     * @return {Map.<string, RecipeFile>}
     */
    getCacheKeyToRecipeFileMap() {
        return this.cacheKeyToRecipeFileMap;
    },


    //-------------------------------------------------------------------------------
    // Public Methods
    //-------------------------------------------------------------------------------

    /**
     * @param {string} recipeFilePath
     * @return {boolean}
     */
    delete(recipeFilePath) {
        const cacheKey = this.makeCacheKey(recipeFilePath);
        return this.cacheKeyToRecipeFileMap.delete(cacheKey);
    },

    /**
     * @param {string} recipeFilePath
     * @return {RecipeFile}
     */
    get(recipeFilePath) {
        const cacheKey = this.makeCacheKey(recipeFilePath);
        return this.cacheKeyToRecipeFileMap.get(cacheKey);
    },

    /**
     * @param {string} recipeFilePath
     * @return {boolean}
     */
    has(recipeFilePath) {
        const cacheKey = this.makeCacheKey(recipeFilePath);
        return this.cacheKeyToRecipeFileMap.containsKey(cacheKey);
    },

    /**
     * @param {string} recipeFilePath
     * @param {RecipeFile} recipeFile
     * @return {RecipeFile}
     */
    set(recipeFilePath, recipeFile) {
        const cacheKey = this.makeCacheKey(recipeFilePath);
        return this.cacheKeyToRecipeFileMap.put(cacheKey, recipeFile);
    },


    //-------------------------------------------------------------------------------
    // Private Methods
    //-------------------------------------------------------------------------------

    /**
     * @private
     * @param {string} recipeFilePath
     * @return {string}
     */
    makeCacheKey(recipeFilePath) {
        return path.resolve(recipeFilePath);
    }
});


//-------------------------------------------------------------------------------
// Exports
//-------------------------------------------------------------------------------

export default RecipeFileCache;
