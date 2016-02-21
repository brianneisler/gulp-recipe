//-------------------------------------------------------------------------------
// Imports
//-------------------------------------------------------------------------------

import {
    Class,
    Config,
    Promises,
    Throwables
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
 * @param {Object} defaults
 * @return {Promise}
 */
RecipeConfig.loadFromFile = function(filePath, defaults = {}) {
    let exists = false;
    return fs.stat(filePath)
        .then((stats) => {
            if (!stats.isFile()) {
                throw Throwables.exception('ConfigNotAFile', {}, 'The config path "' + filePath + '" is not a file');
            }
            const perms = stats.mode.toString(8);
            if (perms.substr(3) !== '600') {
                throw Throwables.exception('BadConfigSecurityPerms', {}, 'Cannot read a config file with perms "' + perms.substr(3) + '. Perms must be 600');
            }
            return fs.readFile(filePath, 'utf8')
                .then((data) => {
                    if (!data) {
                        return {};
                    }
                    return JSON.parse(data);
                });
        })
        .then((data) => {
            exists = true;
            return data;
        })
        .catch((throwable) => {
            if (throwable.code !== 'ENOENT') {
                throw throwable;
            }
            return defaults;
        })
        .then((data) => {
            const recipeConfig = new RecipeConfig(filePath, exists);
            recipeConfig.updateProperties(data);
            return recipeConfig;
        });
};


//-------------------------------------------------------------------------------
// Exports
//-------------------------------------------------------------------------------

export default RecipeConfig;
