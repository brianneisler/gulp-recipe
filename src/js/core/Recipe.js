//-------------------------------------------------------------------------------
// Imports
//-------------------------------------------------------------------------------

import {
    Class,
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
const Recipe = Class.extend(Obj, {

    _name: 'recipe.Recipe',


    //-------------------------------------------------------------------------------
    // Constructor
    //-------------------------------------------------------------------------------

    /**
     * @constructs
     * @param {RecipeFile} recipeFile
     */
    _constructor(recipeFile) {

        this._super();


        //-------------------------------------------------------------------------------
        // Private Properties
        //-------------------------------------------------------------------------------

        /**
         * @private
         * @type {RecipeFile}
         */
        this.recipeFile     = recipeFile;

        /**
         * @private
         * @type {function(function(Error), *)}
         */
        this.recipeMethod       = null;
    },


    //-------------------------------------------------------------------------------
    // Getters and Setters
    //-------------------------------------------------------------------------------

    /**
     * @return {string}
     */
    getMain() {
        return this.recipeFile.getMain();
    },

    /**
     * @return {string}
     */
    getName() {
        return this.recipeFile.getName();
    },

    /**
     * @return {Object.<string, string>}
     */
    getNpmDependencies() {
        return this.recipeFile.getNpmDependencies();
    },

    /**
     * @return {function(function(Error), *)}
     */
    getRecipeMethod() {
        return this.recipeMethod;
    },

    /**
     * @return {string}
     */
    getRecipePath() {
        return path.dirname(this.recipeFile.getFilePath());
    },

    /**
     * @return {string}
     */
    getScope() {
        return this.recipeFile.getScope();
    },

    /**
     * @return {string}
     */
    getType() {
        return this.recipeFile.getType();
    },
    /**
     * @return {string}
     */
    getVersion() {
        return this.recipeFile.getVersion();
    },


    //-------------------------------------------------------------------------------
    // Public Methods
    //-------------------------------------------------------------------------------

    /**
     * @param {Array.<*>} recipeArgs
     */
    runRecipe(recipeArgs) {
        if (!this.recipeMethod) {
            this.recipeMethod = require(path.resolve(this.getRecipePath(), this.main));
        }
        return this.recipeMethod.apply(null, recipeArgs);
    }
});


//-------------------------------------------------------------------------------
// Exports
//-------------------------------------------------------------------------------

export default Recipe;
