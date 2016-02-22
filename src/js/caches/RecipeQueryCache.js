//-------------------------------------------------------------------------------
// Imports
//-------------------------------------------------------------------------------

import {
    Class,
    Map,
    Obj
} from 'bugcore';


//-------------------------------------------------------------------------------
// Declare Class
//-------------------------------------------------------------------------------

/**
 * @class
 * @extends {Obj}
 */
const RecipeQueryCache = Class.extend(Obj, {

    _name: 'recipe.RecipeQueryCache',


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
         * @type {Map.<string, QueryResultData>}
         */
        this.recipeQueryToQueryResultDataMap = new Map();
    },


    //-------------------------------------------------------------------------------
    // Getters and Setters
    //-------------------------------------------------------------------------------

    /**
     * @return {Map.<string, QueryResultData>}
     */
    getRecipeQueryToQueryResultDataMap() {
        return this.recipeQueryToQueryResultDataMap;
    },


    //-------------------------------------------------------------------------------
    // Public Methods
    //-------------------------------------------------------------------------------

    /**
     * @param {string} recipeQuery
     * @returns {Recipe}
     */
    get(recipeQuery) {
        return this.recipeQueryToQueryResultDataMap.get(recipeQuery);
    },

    /**
     * @param {string} recipeQuery
     * @returns {boolean}
     */
    has(recipeQuery) {
        return this.recipeQueryToQueryResultDataMap.containsKey(recipeQuery);
    },

    /**
     * @param {string} recipeQuery
     * @param {QueryResultData} queryResultData
     */
    set(recipeQuery, queryResultData) {
        this.recipeQueryToQueryResultDataMap.put(recipeQuery, queryResultData);
    }
});


//-------------------------------------------------------------------------------
// Exports
//-------------------------------------------------------------------------------

export default RecipeQueryCache;
