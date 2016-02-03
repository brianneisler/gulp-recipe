//-------------------------------------------------------------------------------
// Imports
//-------------------------------------------------------------------------------

import {
    Class,
    IJsonable,
    IObjectable,
    Obj,
    Promises,
    Throwables
} from 'bugcore';
import fs from 'fs-promise';


//-------------------------------------------------------------------------------
// Declare Class
//-------------------------------------------------------------------------------

/**
 * @class
 * @extends {Obj}
 */
const RecipeFile = Class.extend(Obj, {

    _name: 'recipe.RecipeFile',


    //-------------------------------------------------------------------------------
    // Constructor
    //-------------------------------------------------------------------------------

    /**
     * @constructs
     * @param {string} filePath
     * @param {{}} data
     */
    _constructor(filePath, data) {

        this._super();


        //-------------------------------------------------------------------------------
        // Public Properties
        //-------------------------------------------------------------------------------

        /**
         * @private
         * @type {string}
         */
        this.filePath   = filePath;

        /**
         * @private
         * @type {string}
         */
        this.name       = data.name;

        /**
         * @private
         * @type {string}
         */
        this.version    = data.version;
    },


    //-------------------------------------------------------------------------------
    // Getters and Setters
    //-------------------------------------------------------------------------------

    /**
     * @return {string}
     */
    getFilePath() {
        return this.filePath;
    },

    /**
     * @return {string}
     */
    getName() {
        return this.name;
    },

    /**
     * @return {string}
     */
    getVersion() {
        return this.version;
    },


    //-------------------------------------------------------------------------------
    // IJsonable Implementation
    //-------------------------------------------------------------------------------

    /**
     * @return {string}
     */
    toJson() {
        return JSON.stringify(this.toObject());
    },


    //-------------------------------------------------------------------------------
    // IObjectable Implementation
    //-------------------------------------------------------------------------------

    /**
     * @return {Object}
     */
    toObject() {
        return {
            name: this.name,
            version: this.version
        };
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
// Interfaces
//-------------------------------------------------------------------------------

Class.implement(RecipeFile, IJsonable);
Class.implement(RecipeFile, IObjectable);


//-------------------------------------------------------------------------------
// Static Methods
//-------------------------------------------------------------------------------

/**
 * @static
 * @param {string} filePath
 * @return {Promise}
 */
RecipeFile.loadFromFile = function(filePath) {
    return fs.readFile(filePath, 'utf8')
        .catch((error) => {
            if (error.code === 'ENOENT') {
                throw Throwables.exception('NoRecipeFileFound', {}, 'Could not find recipe file at "' + filePath + '"');
            }
            throw error;
        })
        .then((data) => {
            const fileData = JSON.parse(data);
            return new RecipeFile(filePath, fileData);
        });
};


//-------------------------------------------------------------------------------
// Exports
//-------------------------------------------------------------------------------

export default RecipeFile;
