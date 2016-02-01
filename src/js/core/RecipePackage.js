//-------------------------------------------------------------------------------
// Imports
//-------------------------------------------------------------------------------

import {
    Class,
    Obj,
    Promises
} from 'bugcore';
import fs from 'fs-promise';
import stream from 'stream';


//-------------------------------------------------------------------------------
// Declare Class
//-------------------------------------------------------------------------------

/**
 * @class
 * @extends {Obj}
 */
const RecipePackage = Class.extend(Obj, {

    _name: 'recipe.RecipePackage',


    //-------------------------------------------------------------------------------
    // Constructor
    //-------------------------------------------------------------------------------

    /**
     * @constructs
     * @param {RecipeFile} recipeFile
     * @param {Buffer} recipeStream
     * @param {string} recipeHash
     */
    _constructor: function(recipeFile, recipeStream, recipeHash) {

        this._super();


        //-------------------------------------------------------------------------------
        // Public Properties
        //-------------------------------------------------------------------------------

        /**
         * @private
         * @type {RecipeFile}
         */
        this.recipeFile     = recipeFile;

        /**
         * @private
         * @type {string}
         */
        this.recipeHash     = recipeHash;

        /**
         * @private
         * @type {Buffer}
         */
        this.recipeStream   = recipeStream;
    },


    //-------------------------------------------------------------------------------
    // Getters and Setters
    //-------------------------------------------------------------------------------

    /**
     * @return {RecipeFile}
     */
    getRecipeFile: function() {
        return this.recipeFile;
    },

    /**
     * @return {string}
     */
    getRecipeHash: function() {
        return this.recipeHash;
    },

    /**
     * @return {Buffer}
     */
    getRecipeStream: function() {
        return this.recipeStream;
    },


    //-------------------------------------------------------------------------------
    // Public Methods
    //-------------------------------------------------------------------------------

    /**
     * @param {outputPath} outputPath
     * @return {Promise}
     */
    saveToFile: function(outputPath) {
        return fs.ensureFile(outputPath)
            .then(() => {
                return Promises.promise((resolve, reject) => {
                    let caughtError = null;
                    const ws = fs.createWriteStream(outputPath);
                    const pass = new stream.PassThrough();
                    this.recipeStream.pipe(ws)
                        .on('error', (error) => {
                            caughtError = error;
                        })
                        .on('finish', () => {
                            if (caughtError) {
                                return reject(caughtError);
                            }
                            this.recipeStream = pass;
                            return resolve();
                        });
                    this.recipeStream.pipe(pass);
                });
            });
    }
});


//-------------------------------------------------------------------------------
// Exports
//-------------------------------------------------------------------------------

export default RecipePackage;
