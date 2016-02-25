//-------------------------------------------------------------------------------
// Imports
//-------------------------------------------------------------------------------

import {
    Class
} from 'bugcore';
import { Data } from './';


//-------------------------------------------------------------------------------
// Declare Class
//-------------------------------------------------------------------------------

/**
 * @class
 * @extends {Data}
 */
const RecipeData = Class.extend(Data, {

    _name: 'recipe.RecipeData',


    //-------------------------------------------------------------------------------
    // Getters and Setters
    //-------------------------------------------------------------------------------

    /**
     * @return {string}
     */
    getMain() {
        return this.getRawData().main;
    },

    /**
     * @return {string}
     */
    getName() {
        return this.getRawData().name;
    },

    /**
     * @return {Object.<string, string>}
     */
    getNpmDependencies() {
        return this.getRawData().npmDependencies || {};
    },

    /**
     * @return {string}
     */
    getScope() {
        return this.getRawData().scope || 'public';
    },

    /**
     * @return {string}
     */
    getType() {
        return this.getRawData().type || 'gulp';
    },

    /**
     * @return {string}
     */
    getVersion() {
        return this.getRawData().version;
    },


    //-------------------------------------------------------------------------------
    // Data Methods
    //-------------------------------------------------------------------------------

    /**
     * @return {string}
     */
    toCacheKey() {
        return this.getName() + '-' + this.getVersion();
    }
});


//-------------------------------------------------------------------------------
// Exports
//-------------------------------------------------------------------------------

export default RecipeData;
