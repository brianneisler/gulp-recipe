//-------------------------------------------------------------------------------
// Imports
//-------------------------------------------------------------------------------

import {
    Class,
    Proxy
} from 'bugcore';
import { EntityManager } from './';
import { RecipeVersionEntity } from '../entities';
import { SemanticVersionField } from '../fields';
import { Firebase } from '../util';


//-------------------------------------------------------------------------------
// Declare Class
//-------------------------------------------------------------------------------

/**
 * @class
 * @extends {EntityManager}
 */
const RecipeVersionManager = Class.extend(EntityManager, {

    _name: 'recipe.RecipeVersionManager',


    //-------------------------------------------------------------------------------
    // Constructor
    //-------------------------------------------------------------------------------

    /**
     * @constructs
     */
    _constructor() {
        this._super(RecipeVersionEntity);
    },


    //-------------------------------------------------------------------------------
    // Public Methods
    //-------------------------------------------------------------------------------

    /**
     * @param {string} recipeType
     * @param {string} recipeScope
     * @param {string} recipeName
     * @param {string} recipeVersion
     * @return {Promise<RecipeVersionEntity>}
     */
    create(recipeType, recipeScope, recipeName, recipeVersion) {
        const semanticVersion = SemanticVersionField.parse(recipeVersion);
        const data = {
            published: false,
            recipeHash: '',
            recipeUrl: '',
            semanticVersion: semanticVersion,
            versionNumber: semanticVersion.version
        };
        const pathData = {
            recipeName,
            recipeScope,
            recipeType,
            versionNumber: semanticVersion.version
        };
        return this.set(pathData, data);
    },

    /**
     * @param {string} recipeName
     * @param {string} versionNumber
     * @param {{
     *      published: boolean,
     *      recipeHash: string,
     *      recipeUrl: string
     * }} data
     * @return {Promise}
     */
    updatePublished(recipeName, versionNumber, data) {
        const updates = {
            ['recipes/gulp/public/' + recipeName + '/versions/' + Firebase.escapePathPart(versionNumber)]: data,
            ['recipes/gulp/public/' + recipeName + '/versionsInfo/last']: versionNumber,
            ['recipes/gulp/public/' + recipeName + '/versionsInfo/all/' + Firebase.escapePathPart(versionNumber)]: versionNumber
        };
        return Firebase
            .proof([])
            .update(updates);
    },


    //-------------------------------------------------------------------------------
    // EntityManager Methods
    //-------------------------------------------------------------------------------

    /**
     * @protected
     * @param {{
     *      recipeName: string,
     *      recipeScope: string,
     *      recipeType: string,
     *      versionNumber: string
     * }} pathData
     * @return {string}
     */
    generatePath(pathData) {
        return Firebase.path(['recipes', pathData.recipeType, pathData.recipeScope, pathData.recipeName, 'versions', pathData.versionNumber]);
    }
});


//-------------------------------------------------------------------------------
// Private Static Properties
//-------------------------------------------------------------------------------

/**
 * @static
 * @private
 * @type {RecipeVersionManager}
 */
RecipeVersionManager.instance        = null;


//-------------------------------------------------------------------------------
// Static Methods
//-------------------------------------------------------------------------------

/**
 * @static
 * @return {RecipeVersionManager}
 */
RecipeVersionManager.getInstance = function() {
    if (RecipeVersionManager.instance === null) {
        RecipeVersionManager.instance = new RecipeVersionManager();
    }
    return RecipeVersionManager.instance;
};


//-------------------------------------------------------------------------------
// Static Proxy
//-------------------------------------------------------------------------------

Proxy.proxy(RecipeVersionManager, Proxy.method(RecipeVersionManager.getInstance), [
    'create',
    'disableCache',
    'enableCache',
    'get',
    'remove',
    'set',
    'update',
    'updatePublished'
]);


//-------------------------------------------------------------------------------
// Exports
//-------------------------------------------------------------------------------

export default RecipeVersionManager;
