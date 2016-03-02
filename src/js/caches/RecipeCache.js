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
const RecipeCache = Class.extend(Obj, {

    _name: 'gulprecipe.RecipeCache',


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
         * @type {Map.<string, Recipe>}
         */
        this.cacheKeyToRecipeMap  = new Map();
    },


    //-------------------------------------------------------------------------------
    // Getters and Setters
    //-------------------------------------------------------------------------------

    /**
     * @return {Map.<string, Recipe>}
     */
    getCacheKeyToRecipeMap() {
        return this.cacheKeyToRecipeMap;
    },


    //-------------------------------------------------------------------------------
    // Public Methods
    //-------------------------------------------------------------------------------

    /**
     * @param {Pack} pack
     * @return {boolean}
     */
    delete(pack) {
        const cacheKey = this.makeCacheKey(pack);
        return this.cacheKeyToRecipeMap.delete(cacheKey);
    },

    /**
     * @param {Pack} pack
     * @return {Recipe}
     */
    get(pack) {
        const cacheKey = this.makeCacheKey(pack);
        return this.cacheKeyToRecipeMap.get(cacheKey);
    },

    /**
     * @param {Pack} pack
     * @return {boolean}
     */
    has(pack) {
        const cacheKey = this.makeCacheKey(pack);
        return this.cacheKeyToRecipeMap.containsKey(cacheKey);
    },

    /**
     * @param {Pack} pack
     * @param {Recipe} recipe
     * @return {Recipe}
     */
    set(pack, recipe) {
        const cacheKey = this.makeCacheKey(pack);
        return this.cacheKeyToRecipeMap.put(cacheKey, recipe);
    },


    //-------------------------------------------------------------------------------
    // Private Methods
    //-------------------------------------------------------------------------------

    /**
     * @private
     * @param {Pack} pack
     * @return {string}
     */
    makeCacheKey(pack) {
        return pack.toCacheKey();
    }
});


//-------------------------------------------------------------------------------
// Exports
//-------------------------------------------------------------------------------

export default RecipeCache;
