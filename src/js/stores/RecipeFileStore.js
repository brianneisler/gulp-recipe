//-------------------------------------------------------------------------------
// Imports
//-------------------------------------------------------------------------------

import {
    Class,
    Obj,
    Promises,
    Throwables,
    TypeUtil
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
     * @return {RecipeFile}
     */
    async loadRecipeFile(recipeFilePath) {
        let recipeFile = this.recipeFileCache.get(recipeFilePath);
        if (!recipeFile) {
            try {
                recipeFile = await RecipeFile.loadFromFile(recipeFilePath);
                this.validateRecipeFile(recipeFile);
            } catch (throwable) {
                if (throwable.type !== 'NoRecipeFileFound') {
                    throw throwable;
                }
            }
            if (recipeFile) {
                this.recipeFileCache.set(recipeFilePath, recipeFile);
            }
        }
        return recipeFile;
    },


    //-------------------------------------------------------------------------------
    // Private Methods
    //-------------------------------------------------------------------------------

    /**
     * @private
     * @param {RecipeFile} recipeFile
     */
    validateRecipeFile(recipeFile) {
        if (!TypeUtil.isString(recipeFile.getName())) {
            throw Throwables.exception('InvalidRecipeFile', {}, 'Invalid recipe.json file, "name" must be specified.');
        }
        if (!TypeUtil.isString(recipeFile.getVersion())) {
            throw Throwables.exception('InvalidRecipeFile', {}, 'Invalid recipe.json file, "version" must be specified.');
        }
    }
});


//-------------------------------------------------------------------------------
// Exports
//-------------------------------------------------------------------------------

export default RecipeFileStore;
