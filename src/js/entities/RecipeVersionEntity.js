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
const RecipeVersionEntity = Class.extend(Entity, {

    _name: 'recipe.RecipeVersionEntity',


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
    getPublished() {
        return this.rawData.published;
    },

    /**
     * @return {string}
     */
    getRecipeUrl() {
        return this.rawData.recipeUrl;
    },

    /**
     * @return {{
     *      build: Array<string>,
     *      major: number,
     *      minor: number,
     *      patch: number,
     *      prerelease: Array<string>,
     *      raw: string,
     *      version: string
     * }}
     */
    getSemanticVersion() {
        return this.rawData.semanticVersion;
    },

    /**
     * @return {number}
     */
    getUpdatedAt() {
        return this.rawData.updatedAt;
    },

    /**
     * @return {string}
     */
    getVersionNumber() {
        return this.rawData.versionNumber;
    }
});

//-------------------------------------------------------------------------------
// Exports
//-------------------------------------------------------------------------------

export default RecipeVersionEntity;
