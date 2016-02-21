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
const RecipeCollaboratorEntity = Class.extend(Entity, {

    _name: 'recipe.RecipeCollaboratorEntity',


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
     * @return {boolean}
     */
    getOwner() {
        return this.rawData.owner;
    },

    /**
     * @return {string}
     */
    getUserId() {
        return this.rawData.userId;
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

export default RecipeCollaboratorEntity;
