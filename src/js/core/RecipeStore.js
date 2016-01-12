//-------------------------------------------------------------------------------
// Imports
//-------------------------------------------------------------------------------

import {
    Class,
    Obj
} from 'bugcore';
import RecipeStoreCache from './RecipeStoreCache';


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
    _constructor: function(recipesDir) {

        this._super();


        //-------------------------------------------------------------------------------
        // Private Properties
        //-------------------------------------------------------------------------------

        /**
         * @private
         * @type {RecipeStoreCache}
         */
        this.recipeStoreCache       = new RecipeStoreCache();

        /**
         * @private
         * @type {string}
         */
        this.recipesDir             = recipesDir;
    },


    //-------------------------------------------------------------------------------
    // Getters and Setters
    //-------------------------------------------------------------------------------

    /**
     * @return {RecipeStoreCache}
     */
    getRecipeStoreCache: function() {
        return this.recipeStoreCache;
    },

    /**
     * @return {string}
     */
    getRecipesDir: function() {
        return this.recipesDir;
    },


    //-------------------------------------------------------------------------------
    // Public Methods
    //-------------------------------------------------------------------------------

    loadRecipe: function(recipeName, recipeVersion) {

    }
});


//-------------------------------------------------------------------------------
// Exports
//-------------------------------------------------------------------------------

export default RecipeStore;
