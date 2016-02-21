//-------------------------------------------------------------------------------
// Imports
//-------------------------------------------------------------------------------

import {
    Class,
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
const RecipeDownload = Class.extend(Obj, {

    _name: 'recipe.RecipeDownload',


    //-------------------------------------------------------------------------------
    // Constructor
    //-------------------------------------------------------------------------------

    /**
     * @constructs
     * @param {string} filePath
     * @param {{
     *      name: string,
     *      version: string
     * }} data
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
     * @param {string} path
     * @return {Promise}
     */
    extractToPath(path) {
        return Promises.try(() => {
            //TODO BRN: Extract tarball to given path
        });
    }
});


//-------------------------------------------------------------------------------
// Interfaces
//-------------------------------------------------------------------------------

Class.implement(RecipeDownload, IObjectable);


//-------------------------------------------------------------------------------
// Static Methods
//-------------------------------------------------------------------------------

/**
 * @static
 * @param {string} filePath
 * @return {Promise}
 */
RecipeDownload.loadFromFile = function(filePath) {
    return fs.readFile(filePath, 'utf8')
        .catch((error) => {
            if (error.code === 'ENOENT') {
                throw Throwables.exception('NoRecipeDownloadFound', {}, 'Could not find recipe file at "' + filePath + '"');
            }
            throw error;
        })
        .then((data) => {
            const fileData = JSON.parse(data);
            return new RecipeDownload(filePath, fileData);
        });
};


//-------------------------------------------------------------------------------
// Exports
//-------------------------------------------------------------------------------

export default RecipeDownload;
