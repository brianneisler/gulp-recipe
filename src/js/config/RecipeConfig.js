//-------------------------------------------------------------------------------
// Imports
//-------------------------------------------------------------------------------

import {
    Class,
    Config,
    Promises
} from 'bugcore';
import fs from 'fs';


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
    _constructor: function(filePath, exists) {

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
    getExists: function() {
        return this.exists;
    },

    /**
     * @return {string}
     */
    getFilePath: function() {
        return this.filePath;
    },


    //-------------------------------------------------------------------------------
    // Public Methods
    //-------------------------------------------------------------------------------

    /**
     * @return {Promise}
     */
    saveToFile: function() {
        return Promises.promise((resolve, reject) => {
            let json = null;
            try {
                json = this.toJson();
            } catch(error) {
                return reject(error);
            }
            const options = {
                encoding: 'utf8',
                mode: 0o600,
                flag: 'w'
            };
            console.log('Writing to file ', this.filePath);
            fs.writeFile(this.filePath, json, options, (error) => {
                if (error) {
                    reject(error);
                } else {
                    resolve();
                }
            });
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
    return Promises.promise(function(resolve, reject) {
        let exists = false;
        fs.readFile(filePath, 'utf8', function(readError, data) {
            if (readError) {
                if (readError.code !== 'ENOENT') {
                    return reject(readError);
                }
                data = '{}';
            } else {
                exists = true;
            }
            try {
                const propertyData = JSON.parse(data);
                const recipeConfig = new RecipeConfig(filePath, exists);
                recipeConfig.updateProperties(propertyData);
                resolve(recipeConfig);
            } catch(error) {
                reject(error);
            }
        });
    });
};


//-------------------------------------------------------------------------------
// Exports
//-------------------------------------------------------------------------------

export default RecipeConfig;
