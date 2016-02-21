//-------------------------------------------------------------------------------
// Imports
//-------------------------------------------------------------------------------

import {
    Class,
    Map,
    Proxy
} from 'bugcore';
import { EntityManager } from './';
import { RecipeVersionsInfoEntity } from '../entities';
import { Firebase } from '../util';


//-------------------------------------------------------------------------------
// Declare Class
//-------------------------------------------------------------------------------

/**
 * @class
 * @extends {EntityManager}
 */
const RecipeVersionsInfoManager = Class.extend(EntityManager, {

    _name: 'recipe.RecipeVersionsInfoManager',


    //-------------------------------------------------------------------------------
    // Constructor
    //-------------------------------------------------------------------------------

    /**
     * @constructs
     */
    _constructor() {

        this._super(RecipeVersionsInfoEntity);


        //-------------------------------------------------------------------------------
        // Private Properties
        //-------------------------------------------------------------------------------

        /**
         * @private
         * @type {Map.<string, RecipeVersionsInfoWatcher>}
         */
        this.recipeNameToWatcher  = new Map();
    },


    //-------------------------------------------------------------------------------
    // Getters and Setters
    //-------------------------------------------------------------------------------

    /**
     * @return {Map.<string, RecipeVersionsInfoWatcher>}
     */
    getRecipeNameToWatcherMap() {
        return this.recipeNameToWatcher;
    },


    //-------------------------------------------------------------------------------
    // Public Methods
    //-------------------------------------------------------------------------------





    //-------------------------------------------------------------------------------
    // EntityManager Methods
    //-------------------------------------------------------------------------------

    /**
     * @protected
     * @param {{
     *      recipeName: string,
     *      recipeScope: string,
     *      recipeType: string
     * }} pathData
     * @return {string}
     */
    generatePath(pathData) {
        return Firebase.path(['recipes', pathData.recipeType, pathData.recipeScope, pathData.recipeName, 'versionsInfo']);
    }
});



//-------------------------------------------------------------------------------
// Private Static Properties
//-------------------------------------------------------------------------------

/**
 * @static
 * @private
 * @type {RecipeVersionsInfoManager}
 */
RecipeVersionsInfoManager.instance        = null;


//-------------------------------------------------------------------------------
// Static Methods
//-------------------------------------------------------------------------------

/**
 * @static
 * @return {RecipeVersionsInfoManager}
 */
RecipeVersionsInfoManager.getInstance = function() {
    if (RecipeVersionsInfoManager.instance === null) {
        RecipeVersionsInfoManager.instance = new RecipeVersionsInfoManager();
    }
    return RecipeVersionsInfoManager.instance;
};


//-------------------------------------------------------------------------------
// Static Proxy
//-------------------------------------------------------------------------------

Proxy.proxy(RecipeVersionsInfoManager, Proxy.method(RecipeVersionsInfoManager.getInstance), [
    'disableCache',
    'enableCache',
    'get',
    'remove',
    'set',
    'update'
]);


//-------------------------------------------------------------------------------
// Exports
//-------------------------------------------------------------------------------

export default RecipeVersionsInfoManager;
