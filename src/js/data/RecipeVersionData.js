//-------------------------------------------------------------------------------
// Imports
//-------------------------------------------------------------------------------

import {
    Class,
    IObjectable,
    Obj
} from 'bugcore';


//-------------------------------------------------------------------------------
// Declare Class
//-------------------------------------------------------------------------------

/**
 * @class
 * @extends {Obj}
 */
const RecipeVersionData = Class.extend(Obj, {

    _name: 'recipe.RecipeVersionData',


    //-------------------------------------------------------------------------------
    // Constructor
    //-------------------------------------------------------------------------------

    /**
     * @constructs
     * @param {{
     *  createdAt: number,
     *  published: boolean,
     *  recipeUrl: string,
     *  updatedAt: number,
     *  versionNumber: string,
     *  versionParts: {
     *      major: number,
     *      minor: number,
     *      patch: number,
     *      preRelease: string,
     *      metadata: string
     * }
     * }} data
     */
    _constructor(data) {

        this._super();


        //-------------------------------------------------------------------------------
        // Public Properties
        //-------------------------------------------------------------------------------

        /**
         * @private
         * @type {number}
         */
        this.createdAt              = data.createdAt;

        /**
         * @private
         * @type {boolean}
         */
        this.published              = data.published;

        /**
         * @private
         * @type {string}
         */
        this.recipeUrl              = data.recipeUrl;

        /**
         * @private
         * @type {number}
         */
        this.updatedAt              = data.updatedAt;

        /**
         * @private
         * @type {string}
         */
        this.versionNumber          = data.versionNumber;

        /**
         * @private
         * @type {{
         *      major: number,
         *      minor: number,
         *      patch: number,
         *      preRelease: string,
         *      metadata: string
         * }}
         */
        this.versionParts           = data.versionParts;
    },


    //-------------------------------------------------------------------------------
    // Getters and Setters
    //-------------------------------------------------------------------------------

    /**
     * @return {number}
     */
    getCreatedAt() {
        return this.createdAt;
    },

    /**
     * @return {boolean}
     */
    getPublished() {
        return this.published;
    },

    /**
     * @return {string}
     */
    getRecipeUrl() {
        return this.recipeUrl;
    },

    /**
     * @return {number}
     */
    getUpdatedAt() {
        return this.updatedAt;
    },

    /**
     * @return {string}
     */
    getVersionNumber() {
        return this.versionNumber;
    },

    /**
     * @return {{
     *      major: number,
     *      minor: number,
     *      patch: number,
     *      preRelease: string,
     *      metadata: string
     * }}
     */
    getVersionParts() {
        return this.versionParts;
    },


    //-------------------------------------------------------------------------------
    // IObjectable Implementation
    //-------------------------------------------------------------------------------

    /**
     * @return {Object}
     */
    toObject() {
        return {
            createdAt: this.createdAt,
            published: this.published,
            recipeUrl: this.recipeUrl,
            updatedAt: this.updatedAt,
            versionNumber: this.versionNumber,
            versionParts: this.versionParts
        };
    }
});


//-------------------------------------------------------------------------------
// Interfaces
//-------------------------------------------------------------------------------

Class.implement(RecipeVersionData, IObjectable);


//-------------------------------------------------------------------------------
// Exports
//-------------------------------------------------------------------------------

export default RecipeVersionData;
