//-------------------------------------------------------------------------------
// Imports
//-------------------------------------------------------------------------------

import {
    Class,
    Obj
} from 'bugcore';


//-------------------------------------------------------------------------------
// Declare Class
//-------------------------------------------------------------------------------

/**
 * @class
 * @extends {Obj}
 */
const RecipeDownload = Class.extend(Obj, {

    _name: 'recipe.RecipeDownload',


    //-------------------------------------------------------------------------------
    // Constructor
    //-------------------------------------------------------------------------------

    /**
     * @constructs
     * @param {string} recipeUrl
     * @param {RecipePackage} recipePackage
     */
    _constructor(recipeUrl, recipePackage) {

        this._super();


        //-------------------------------------------------------------------------------
        // Public Properties
        //-------------------------------------------------------------------------------

        /**
         * @private
         * @type {RecipePackage}
         */
        this.recipePackage  = recipePackage;

        /**
         * @private
         * @type {string}
         */
        this.recipeUrl      = recipeUrl;
    },


    //-------------------------------------------------------------------------------
    // Getters and Setters
    //-------------------------------------------------------------------------------

    /**
     * @return {RecipePackage}
     */
    getRecipePackage() {
        return this.recipePackage;
    },

    /**
     * @return {string}
     */
    getRecipeUrl() {
        return this.recipeUrl;
    }
});


//-------------------------------------------------------------------------------
// Exports
//-------------------------------------------------------------------------------

export default RecipeDownload;
