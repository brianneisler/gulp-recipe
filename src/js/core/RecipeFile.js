//-------------------------------------------------------------------------------
// Imports
//-------------------------------------------------------------------------------

import {
    Class,
    IJsonable,
    IObjectable,
    Obj,
    Throwables
} from 'bugcore';
import {
    RecipeData
} from '../data';
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
     * @param {RecipeData} recipeData
     */
    _constructor(filePath, recipeData) {

        this._super();


        //-------------------------------------------------------------------------------
        // Public Properties
        //-------------------------------------------------------------------------------

        /**
         * @private
         * @type {string}
         */
        this.filePath       = filePath;

        /**
         * @private
         * @type {RecipeData}
         */
        this.recipeData     = recipeData;
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
    getMain() {
        return this.recipeData.getMain();
    },

    /**
     * @return {string}
     */
    getName() {
        return this.recipeData.getName();
    },

    /**
     * @return {Object.<string, string>}
     */
    getNpmDependencies() {
        return this.recipeData.getNpmDependencies();
    },

    /**
     * @return {RecipeData}
     */
    getRecipeData() {
        return this.recipeData;
    },

    /**
     * @return {string}
     */
    getScope() {
        return this.recipeData.getScope();
    },

    /**
     * @return {string}
     */
    getType() {
        return this.recipeData.getType();
    },

    /**
     * @return {string}
     */
    getVersion() {
        return this.recipeData.getVersion();
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
        return this.recipeData.toObject();
    },


     //-------------------------------------------------------------------------------
    // Public Methods
    //-------------------------------------------------------------------------------

    /**
     *
     */
    async saveToFile() {
        const json = this.toJson();
        const options = {
            encoding: 'utf8',
            mode: 0o644,
            flag: 'w'
        };
        console.log('Writing to file ', this.filePath);
        return await fs.writeFile(this.filePath, json, options);
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
 * @return {RecipeFile}
 */
RecipeFile.loadFromFile = async function(filePath) {
    try {
        const data      = await fs.readFile(filePath, 'utf8');
        const fileData  = JSON.parse(data);
        return new RecipeFile(filePath, new RecipeData(fileData));
    } catch(error) {
        if (error.code === 'ENOENT') {
            throw Throwables.exception('NoRecipeFileFound', {}, 'Could not find recipe file at "' + filePath + '"');
        }
        throw error;
    }
};


//-------------------------------------------------------------------------------
// Exports
//-------------------------------------------------------------------------------

export default RecipeFile;
