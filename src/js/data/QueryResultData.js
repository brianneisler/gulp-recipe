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
const QueryResultData = Class.extend(Data, {

    _name: 'recipe.QueryResultData',


    //-------------------------------------------------------------------------------
    // Getters and Setters
    //-------------------------------------------------------------------------------

    /**
     * @return {string}
     */
    getName() {
        return this.getRawData().name;
    },

    /**
     * @return {string}
     */
    getScope() {
        return this.getRawData().scope;
    },

    /**
     * @return {string}
     */
    getType() {
        return this.getRawData().type;
    },

    /**
     * @return {string}
     */
    getVersionNumber() {
        return this.getRawData().versionNumber;
    },


    //-------------------------------------------------------------------------------
    // Data Methods
    //-------------------------------------------------------------------------------

    /**
     * @return {string}
     */
    toCacheKey() {
        return this.getType() + '-' + this.getScope() + '-' + this.getName() + '-' + this.getVersionNumber();
    }
});


//-------------------------------------------------------------------------------
// Exports
//-------------------------------------------------------------------------------

export default QueryResultData;
