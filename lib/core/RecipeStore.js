//-------------------------------------------------------------------------------
// Imports
//-------------------------------------------------------------------------------

var bugcore         = require('bugcore');


//-------------------------------------------------------------------------------
// Simplify References
//-------------------------------------------------------------------------------

var Class           = bugcore.Class;
var Map             = bugcore.Map;
var Obj             = bugcore.Obj;


//-------------------------------------------------------------------------------
// Declare Class
//-------------------------------------------------------------------------------

/**
 * @class
 * @extends {Obj}
 */
var RecipeStore = Class.extend(Obj, {

    _name: 'gulprecipe.RecipeStore',


    //-------------------------------------------------------------------------------
    // Constructor
    //-------------------------------------------------------------------------------

    /**
     * @constructs
     */
    _constructor: function() {

        this._super();


        //-------------------------------------------------------------------------------
        // Private Properties
        //-------------------------------------------------------------------------------

        /**
         * @private
         * @type {Map.<string, Recipe>}
         */
        this.recipeNameToRecipeMap   = new Map();
    },


    //-------------------------------------------------------------------------------
    // Getters and Setters
    //-------------------------------------------------------------------------------

    /**
     * @return {Map.<string, Recipe>}
     */
    getRecipeNameToRecipeMap: function() {
        return this.recipeNameToRecipeMap;
    },
    

    //-------------------------------------------------------------------------------
    // Public Methods
    //-------------------------------------------------------------------------------

    /**
     * @param {string} recipeName
     * @returns {Recipe}
     */
    getRecipe: function(recipeName) {
        return this.recipeNameToRecipeMap.get(recipeName);
    },

    /**
     * @param {string} recipeName
     * @returns {boolean}
     */
    hasRecipe: function(recipeName) {
        return this.recipeNameToRecipeMap.containsKey(recipeName);
    },

    /**
     * @param {string} recipeName
     * @param {Recipe} elfRecipe
     */
    setRecipe: function(recipeName, elfRecipe) {
        this.recipeNameToRecipeMap.put(recipeName, elfRecipe);
    }
});


//-------------------------------------------------------------------------------
// Exports
//-------------------------------------------------------------------------------

module.exports = RecipeStore;
