//-------------------------------------------------------------------------------
// Imports
//-------------------------------------------------------------------------------

var bugcore         = require('bugcore');


//-------------------------------------------------------------------------------
// Simplify References
//-------------------------------------------------------------------------------

var Class           = bugcore.Class;
var Obj             = bugcore.Obj;


//-------------------------------------------------------------------------------
// Declare Class
//-------------------------------------------------------------------------------

/**
 * @class
 * @extends {Obj}
 */
var Recipe = Class.extend(Obj, {

    _name: 'gulprecipe.Recipe',


    //-------------------------------------------------------------------------------
    // Constructor
    //-------------------------------------------------------------------------------

    /**
     * @constructs
     * @param {Array.<String>} dependencies
     * @param {function(function(Error), *...)} recipeMethod
     */
    _constructor: function(dependencies, recipeMethod) {

        this._super();


        //-------------------------------------------------------------------------------
        // Private Properties
        //-------------------------------------------------------------------------------

        /**
         * @private
         * @type {Array.<string>}
         */
        this.dependencies   = dependencies;

        /**
         * @private
         * @type {function(function(Error), *)}
         */
        this.recipeMethod   = recipeMethod;
    },


    //-------------------------------------------------------------------------------
    // Getters and Setters
    //-------------------------------------------------------------------------------

    /**
     * @return {Array.<string>}
     */
    getDependencies: function() {
        return this.dependencies;
    },

    /**
     * @return {function(function(Error), *)}
     */
    getRecipeMethod: function() {
        return this.recipeMethod;
    },


    //-------------------------------------------------------------------------------
    // Public Methods
    //-------------------------------------------------------------------------------

    /**
     * @param {Array.<*>} recipeArgs
     */
    runRecipe: function(recipeArgs) {
        return this.recipeMethod.apply(null, recipeArgs);
    }
});


//-------------------------------------------------------------------------------
// Exports
//-------------------------------------------------------------------------------

module.exports = Recipe;
