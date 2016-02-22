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
const RecipeInstall = Class.extend(Obj, {

    _name: 'recipe.RecipeInstall',


    //-------------------------------------------------------------------------------
    // Constructor
    //-------------------------------------------------------------------------------

    /**
     * @constructs
     * @param {string} installPath
     * @param {RecipeFile} recipeFile
     */
    _constructor(installPath, recipeFile) {

        this._super();


        //-------------------------------------------------------------------------------
        // Public Properties
        //-------------------------------------------------------------------------------

        /**
         * @private
         * @type {string}
         */
        this.installPath    = installPath;

        /**
         * @private
         * @type {RecipeFile}
         */
        this.recipeFile     = recipeFile;
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
     * @return {RecipeFile}
     */
    getRecipeFile() {
        return this.recipeFile;
    },


    //-------------------------------------------------------------------------------
    // IObjectable Implementation
    //-------------------------------------------------------------------------------

    /**
     * @return {Object}
     */
    toObject() {
        return {
            installPath: this.installPath
        };
    }
});


//-------------------------------------------------------------------------------
// Interfaces
//-------------------------------------------------------------------------------

Class.implement(RecipeInstall, IObjectable);


//-------------------------------------------------------------------------------
// Static Methods
//-------------------------------------------------------------------------------

/**
 * @static
 * @param {string} filePath
 * @return {Promise}
 */
RecipeInstall.loadFromFile = function(filePath) {
    return fs.readFile(filePath, 'utf8')
        .catch((error) => {
            if (error.code === 'ENOENT') {
                throw Throwables.exception('NoRecipeInstallFound', {}, 'Could not find recipe file at "' + filePath + '"');
            }
            throw error;
        })
        .then((data) => {
            const fileData = JSON.parse(data);
            return new RecipeInstall(filePath, fileData);
        });
};


//-------------------------------------------------------------------------------
// Exports
//-------------------------------------------------------------------------------

export default RecipeInstall;
