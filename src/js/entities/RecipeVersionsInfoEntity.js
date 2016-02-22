//-------------------------------------------------------------------------------
// Imports
//-------------------------------------------------------------------------------

import {
    Class,
    Obj
} from 'bugcore';
import { Entity } from './';


//-------------------------------------------------------------------------------
// Declare Class
//-------------------------------------------------------------------------------

/**
 * @class
 * @extends {Entity}
 */
const RecipeVersionsInfoEntity = Class.extend(Entity, {

    _name: 'recipe.RecipeVersionsInfoEntity',


    //-------------------------------------------------------------------------------
    // Constructor
    //-------------------------------------------------------------------------------

    /**
     * @constructs
     * @param {*} pathData
     * @param {{
     *  all: Object<string, string>,
     *  createdAt: number,
     *  last: string,
     *  updatedAt: number
     * }} rawData
     */
    _constructor(pathData, rawData) {

        this._super(pathData, rawData);


        //-------------------------------------------------------------------------------
        // Public Properties
        //-------------------------------------------------------------------------------

        /**
         * @private
         * @type {string}
         */
        this._allHash                = null;
    },


    //-------------------------------------------------------------------------------
    // Getters and Setters
    //-------------------------------------------------------------------------------

    /**
     * @return {Object.<string, string>}
     */
    getAll() {
        return this.rawData.all;
    },

    /**
     * @return {number}
     */
    getCreatedAt() {
        return this.rawData.createdAt;
    },

    /**
     * @return {string}
     */
    getLast() {
        return this.rawData.last;
    },

    /**
     * @return {number}
     */
    getUpdatedAt() {
        return this.rawData.updatedAt;
    }
});


//-------------------------------------------------------------------------------
// Exports
//-------------------------------------------------------------------------------

export default RecipeVersionsInfoEntity;
