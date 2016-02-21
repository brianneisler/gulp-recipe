//-------------------------------------------------------------------------------
// Imports
//-------------------------------------------------------------------------------

import {
    Class,
    Obj,
    Promises
} from 'bugcore';
import { RecipeFileCache } from '../caches';
import { RecipeFile } from '../core';



//-------------------------------------------------------------------------------
// Declare Class
//-------------------------------------------------------------------------------

/**
 * @class
 * @extends {Obj}
 */
const RecipeFileStore = Class.extend(Obj, {

    _name: 'recipe.RecipeFileStore',


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

        //TODO BRN: Add watchers for when recipeFiles change. On change, delete cache entry (or reload file and update cache)
        /**
         * @private
         * @type {RecipeFileCache}
         */
        this.recipeFileCache        = new RecipeFileCache();
    },


    //-------------------------------------------------------------------------------
    // Getters and Setters
    //-------------------------------------------------------------------------------

    /**
     * @return {RecipeFileCache}
     */
    getRecipeFileCache() {
        return this.recipeFileCache;
    },


    //-------------------------------------------------------------------------------
    // Public Methods
    //-------------------------------------------------------------------------------

    /**
     * @param {string} recipeFilePath
     * @return {Promise<RecipeFile>}
     */
    loadRecipeFile(recipeFilePath) {
        const recipeFile = this.recipeFileCache.getRecipeFile(recipeFilePath);
        if (!recipeFile) {
            return RecipeFile.loadFromFile(recipeFilePath)
                .then((loadedRecipeFile) => {
                    this.recipeFileCache.setRecipeFile(recipeFilePath, loadedRecipeFile);
                    return loadedRecipeFile;
                });
        }
        return Promises.resolve(recipeFile);
    }
});


//-------------------------------------------------------------------------------
// Exports
//-------------------------------------------------------------------------------

export default RecipeFileStore;
