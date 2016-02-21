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
const PublishKeyEntity = Class.extend(Entity, {

    _name: 'recipe.PublishKeyEntity',


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
    getKey() {
        return this.rawData.key;
    },

    /**
     * @return {string}
     */
    getRecipeHash() {
        return this.rawData.recipeHash;
    },

    /**
     * @return {string}
     */
    getRecipeName() {
        return this.rawData.recipeName;
    },

    /**
     * @return {string}
     */
    getRecipeScope() {
        return this.rawData.recipeScope;
    },

    /**
     * @return {string}
     */
    getRecipeType() {
        return this.rawData.recipeType;
    },

    /**
     * @return {string}
     */
    getRecipeVersionNumber() {
        return this.rawData.recipeVersionNumber;
    },

    /**
     * @return {number}
     */
    getUpdatedAt() {
        return this.rawData.updatedAt;
    },

    /**
     * @returns {?number}
     */
    getUsedAt() {
        return this.rawData.usedAt;
    }
});


//-------------------------------------------------------------------------------
// Exports
//-------------------------------------------------------------------------------

export default PublishKeyEntity;
