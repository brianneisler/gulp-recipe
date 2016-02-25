//-------------------------------------------------------------------------------
// Imports
//-------------------------------------------------------------------------------

import {
    Class,
    Obj,
    Throwables
} from 'bugcore';
import {
    RecipeCache
} from '../caches';
import {
    Recipe
} from '../core';
import {
    PathUtil
} from '../util';
import fs from 'fs-promise';


//-------------------------------------------------------------------------------
// Declare Class
//-------------------------------------------------------------------------------

/**
 * @class
 * @extends {Obj}
 */
const RecipeStore = Class.extend(Obj, {

    _name: 'recipe.RecipeStore',


    //-------------------------------------------------------------------------------
    // Constructor
    //-------------------------------------------------------------------------------

    /**
     * @constructs
     * @param {string} recipesDir
     * @param {RecipeFileStore} recipeFileStore
     */
    _constructor(recipesDir, recipeFileStore) {

        this._super();


        //-------------------------------------------------------------------------------
        // Private Properties
        //-------------------------------------------------------------------------------

        /**
         * @private
         * @type {RecipeCache}
         */
        this.recipeCache        = new RecipeCache();

        /**
         * @private
         * @type {string}
         */
        this.recipesDir         = recipesDir;

        /**
         * @private
         * @type {RecipeFileStore}
         */
        this.recipeFileStore    = recipeFileStore
    },


    //-------------------------------------------------------------------------------
    // Getters and Setters
    //-------------------------------------------------------------------------------

    /**
     * @return {RecipeCache}
     */
    getRecipeCache() {
        return this.recipeCache;
    },

    /**
     * @return {string}
     */
    getRecipesDir() {
        return this.recipesDir;
    },

    /**
     * @return {RecipeFileStore}
     */
    getRecipeFileStore() {
        return this.recipeFileStore;
    },


    //-------------------------------------------------------------------------------
    // Public Methods
    //-------------------------------------------------------------------------------

    /**
     * @param {string} recipeType
     * @param {string} recipeScope
     * @param {string} recipeName
     * @param {string} recipeVersionNumber
     * @return {Recipe}
     */
    async loadRecipe(recipeType, recipeScope, recipeName, recipeVersionNumber) {
        let recipe = this.recipeCache.get(recipeType, recipeScope, recipeName, recipeVersionNumber);
        if (!recipe) {
            recipe = await this.doLoadRecipe(recipeType, recipeScope, recipeName, recipeVersionNumber);
            if (recipe) {
                this.recipeCache.set(recipeType, recipeScope, recipeName, recipeVersionNumber, recipe);
            }
        }
        return recipe;
    },


    //-------------------------------------------------------------------------------
    // Private Methods
    //-------------------------------------------------------------------------------

    /**
     * @param {string} recipeType
     * @param {string} recipeScope
     * @param {string} recipeName
     * @param {string} recipeVersionNumber
     * @return {Recipe}
     */
    async doLoadRecipe(recipeType, recipeScope, recipeName, recipeVersionNumber) {
        const recipeFilePath = PathUtil.resolveRecipeFilePath(this.recipesDir, recipeType, recipeScope, recipeName, recipeVersionNumber);
        const recipeFile = await this.recipeFileStore.loadRecipeFile(recipeFilePath);
        if (!recipeFile) {
            throw Throwables.exception('RecipeDoesNotExist');
        }
        return new Recipe(recipeFile);
    }
});


//-------------------------------------------------------------------------------
// Exports
//-------------------------------------------------------------------------------

export default RecipeStore;
