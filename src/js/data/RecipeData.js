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
const RecipeData = Class.extend(Obj, {

    _name: 'recipe.RecipeData',


    //-------------------------------------------------------------------------------
    // Constructor
    //-------------------------------------------------------------------------------

    /**
     * @constructs
     * @param {{
     *      collaborators: {},
     *      createdAt: number,
     *      lastPublishedVersion: string,
     *      name: string,
     *      updatedAt: number
     * }} data
     */
    _constructor: function(data) {

        this._super();


        //-------------------------------------------------------------------------------
        // Public Properties
        //-------------------------------------------------------------------------------

        /**
         * @private
         * @type {{}}
         */
        this.collaborators          = data.collaborators;

        /**
         * @private
         * @type {number}
         */
        this.createdAt              = data.createdAt;

        /**
         * @private
         * @type {string}
         */
        this.lastPublishedVersion   = data.lastPublishedVersion;

        /**
         * @private
         * @type {string}
         */
        this.name                   = data.name;

        /**
         * @private
         * @type {number}
         */
        this.updatedAt              = data.updatedAt;
    },


    //-------------------------------------------------------------------------------
    // Getters and Setters
    //-------------------------------------------------------------------------------

    /**
     * @return {{}}
     */
    getCollaborators: function() {
        return this.collaborators;
    },

    /**
     * @return {number}
     */
    getCreatedAt: function() {
        return this.createdAt;
    },

    /**
     * @return {string}
     */
    getLastPublishedVersion: function() {
        return this.lastPublishedVersion;
    },

    /**
     * @return {string}
     */
    getName: function() {
        return this.name;
    },

    /**
     * @return {number}
     */
    getUpdatedAt: function() {
        return this.updatedAt;
    },


    //-------------------------------------------------------------------------------
    // IObjectable Implementation
    //-------------------------------------------------------------------------------

    /**
     * @return {Object}
     */
    toObject: function() {
        return {
            collaborators: this.collaborators,
            createdAt: this.createdAt,
            lastPublishedVersion: this.lastPublishedVersion,
            name: this.name,
            updatedAt: this.updatedAt
        };
    }
});


//-------------------------------------------------------------------------------
// Interfaces
//-------------------------------------------------------------------------------

Class.implement(RecipeData, IObjectable);


//-------------------------------------------------------------------------------
// Exports
//-------------------------------------------------------------------------------

export default RecipeData;
