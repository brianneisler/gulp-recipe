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
const PublishKeyData = Class.extend(Obj, {

    _name: 'recipe.PublishKeyData',


    //-------------------------------------------------------------------------------
    // Constructor
    //-------------------------------------------------------------------------------

    /**
     * @constructs
     * @param {{
     *      createdAt: number,
     *      key: string,
     *      recipeHash: string,
     *      recipeName: string,
     *      recipeScope: string,
     *      recipeType: string,
     *      recipeVersionNumber: string,
     *      updatedAt: number
     *      usedAt: ?number
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
         * @type {string}
         */
        this.key                    = data.key;

        /**
         * @private
         * @type {string}
         */
        this.recipeHash             = data.recipeHash;

        /**
         * @private
         * @type {string}
         */
        this.recipeName             = data.recipeName;

        /**
         * @private
         * @type {string}
         */
        this.recipeScope            = data.recipeScope;

          /**
         * @private
         * @type {string}
         */
        this.recipeType             = data.recipeType;

        /**
         * @private
         * @type {string}
         */
        this.recipeVersionNumber    = data.recipeVersionNumber;

        /**
         * @private
         * @type {number}
         */
        this.updatedAt              = data.updatedAt;

        /**
         * @private
         * @type {?number}
         */
        this.usedAt                 = data.usedAt;
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
     * @return {string}
     */
    getKey() {
        return this.key;
    },

    /**
     * @return {string}
     */
    getRecipeHash() {
        return this.recipeHash;
    },

    /**
     * @return {string}
     */
    getRecipeName() {
        return this.recipeName;
    },

    /**
     * @return {string}
     */
    getRecipeScope() {
        return this.recipeScope;
    },

    /**
     * @return {string}
     */
    getRecipeType() {
        return this.recipeType;
    },

    /**
     * @return {string}
     */
    getRecipeVersionNumber() {
        return this.recipeVersionNumber;
    },

    /**
     * @return {number}
     */
    getUpdatedAt() {
        return this.updatedAt;
    },

    /**
     * @returns {?number}
     */
    getUsedAt() {
        return this.usedAt;
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
            key: this.key,
            recipeHash: this.recipeHash,
            recipeName: this.recipeName,
            recipeScope: this.recipeScope,
            recipeType: this.recipeType,
            recipeVersionNumber: this.recipeVersionNumber,
            updatedAt: this.updatedAt,
            usedAt: this.usedAt
        };
    }
});


//-------------------------------------------------------------------------------
// Interfaces
//-------------------------------------------------------------------------------

Class.implement(PublishKeyData, IObjectable);


//-------------------------------------------------------------------------------
// Exports
//-------------------------------------------------------------------------------

export default PublishKeyData;
