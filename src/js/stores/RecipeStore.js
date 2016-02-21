//-------------------------------------------------------------------------------
// Imports
//-------------------------------------------------------------------------------

import {
    Class,
    Obj,
    Promises
} from 'bugcore';
import { RecipeCache } from '../caches';


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
     */
    _constructor(recipesDir) {

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


    //-------------------------------------------------------------------------------
    // Public Methods
    //-------------------------------------------------------------------------------

    /**
     * @param {string} recipeName
     * @param {string} recipeVersion
     * @return {Promise<Recipe>}
     */
    loadRecipe(recipeName, recipeVersion) {
        return Promises.try(() => {
            const recipe = this.recipeCache.getRecipe(recipeName, recipeVersion);
            if (!recipe) {
                return this.doLoadRecipe(recipeName, recipeVersion)
                    .then((loadedRecipe) => {
                        this.currentRecipeStore
                    });
            }
            return recipe;
        });
        //- check in memory store to see if recipe has already been loaded in to memory
        //- if not in memory store
        //-- check if recipe is installed by checking if the recipe path exists [execPath]/.recipe/[recipeType]/[recipeScope]/[recipeName]/[recipeVersion]
        //-- if not installed
        //--- throw error
        //-- load recipe package data from [execPath]/.recipe/[recipeType]/[recipeScope]/[recipeName]/[recipeVersion]/recipe.json
        //-- require main file from recipe package data { "main": "path/to/main"}
        //-- add recipe to memory store
        //- return recipe from memory store

    }
});


//-------------------------------------------------------------------------------
// Exports
//-------------------------------------------------------------------------------

export default RecipeStore;
