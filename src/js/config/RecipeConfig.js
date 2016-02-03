//-------------------------------------------------------------------------------
// Imports
//-------------------------------------------------------------------------------

import {
    Class,
    Config,
    Promises
} from 'bugcore';
import fs from 'fs-promise';


//-------------------------------------------------------------------------------
// Declare Class
//-------------------------------------------------------------------------------

/**
 * @class
 * @extends {Config}
 */
const RecipeConfig = Class.extend(Config, {

    _name: 'recipe.RecipeConfig',


    //-------------------------------------------------------------------------------
    // Constructor
    //-------------------------------------------------------------------------------

    /**
     * @constructs
     * @param {string} filePath
     * @param {boolean} exists
     */
    _constructor(filePath, exists) {

        this._super();


        //-------------------------------------------------------------------------------
        // Public Properties
        //-------------------------------------------------------------------------------

        /**
         * @private
         * @type {boolean}
         */
        this.exists     = exists;

        /**
         * @private
         * @type {string}
         */
        this.filePath   = filePath;
    },


    //-------------------------------------------------------------------------------
    // Getters and Setters
    //-------------------------------------------------------------------------------

    /**
     * @return {boolean}
     */
    getExists() {
        return this.exists;
    },

    /**
     * @return {string}
     */
    getFilePath() {
        return this.filePath;
    },


    //-------------------------------------------------------------------------------
    // Public Methods
    //-------------------------------------------------------------------------------

    /**
     * @return {Promise}
     */
    saveToFile() {
        return Promises.try(() => {
            const json = this.toJson();
            const options = {
                encoding: 'utf8',
                mode: 0o600,
                flag: 'w'
            };
            console.log('Writing to file ', this.filePath);
            return fs.writeFile(this.filePath, json, options);
        });
    }
});


//-------------------------------------------------------------------------------
// Static Methods
//-------------------------------------------------------------------------------

/**
 * @static
 * @param {string} filePath
 * @return {Promise}
 */
RecipeConfig.loadFromFile = function(filePath) {
    let exists = false;
    return fs.readFile(filePath, 'utf8')
        .then((data) => {
            exists = true;
            return data;
        })
        .catch((error) => {
            if (error.code !== 'ENOENT') {
                throw error;
            }
            return '{}';
        })
        .then((data) => {
            if (!data) {
                data = '{}';
            }
            const propertyData = JSON.parse(data);
            const recipeConfig = new RecipeConfig(filePath, exists);
            recipeConfig.updateProperties(propertyData);
            return recipeConfig;
        });
};


//-------------------------------------------------------------------------------
// Exports
//-------------------------------------------------------------------------------

export default RecipeConfig;
