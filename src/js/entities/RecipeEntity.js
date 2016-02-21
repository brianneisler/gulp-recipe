//-------------------------------------------------------------------------------
// Imports
//-------------------------------------------------------------------------------

import {
    Class
} from 'bugcore';
import { Entity } from './';


//-------------------------------------------------------------------------------
// Declare Class
//-------------------------------------------------------------------------------

/**
 * @class
 * @extends {Entity}
 */
const RecipeEntity = Class.extend(Entity, {

    _name: 'recipe.RecipeEntity',


    //-------------------------------------------------------------------------------
    // Getters and Setters
    //-------------------------------------------------------------------------------

    /**
     * @return {number}
     */
    getCreatedAt() {
        return this.rawData.createdAt;
    },

    /**
     * @return {string}
     */
    getName() {
        return this.rawData.name;
    },

    /**
     * @return {string}
     */
    getScope() {
        return this.rawData.scope;
    },

    /**
     * @return {string}
     */
    getType() {
        return this.rawData.type;
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

export default RecipeEntity;
