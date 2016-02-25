//-------------------------------------------------------------------------------
// Imports
//-------------------------------------------------------------------------------

import {
    Class,
    Proxy
} from 'bugcore';
import { EntityManager } from './';
import { RecipeCollaboratorEntity } from '../entities';
import {
    Firebase
} from '../util';


//-------------------------------------------------------------------------------
// Declare Class
//-------------------------------------------------------------------------------

/**
 * @class
 * @extends {EntityManager}
 */
const RecipeCollaboratorManager = Class.extend(EntityManager, {

    _name: 'recipe.RecipeCollaboratorManager',


    //-------------------------------------------------------------------------------
    // Constructor
    //-------------------------------------------------------------------------------

    /**
     * @constructs
     */
    _constructor() {
        this._super(RecipeCollaboratorEntity);
    },


    //-------------------------------------------------------------------------------
    // EntityManager Methods
    //-------------------------------------------------------------------------------

    /**
     * @protected
     * @param {{
     *      recipeType: string,
     *      recipeScope: string,
     *      recipeName: string,
     *      userId: string
     * }} pathData
     * @return {string}
     */
    generatePath(pathData) {
        return Firebase.path(['recipes', pathData.recipeType, pathData.recipeScope, pathData.recipeName, 'collaborators', pathData.userId]);
    }
});


//-------------------------------------------------------------------------------
// Private Static Properties
//-------------------------------------------------------------------------------

/**
 * @static
 * @private
 * @type {RecipeCollaboratorManager}
 */
RecipeCollaboratorManager.instance        = null;


//-------------------------------------------------------------------------------
// Static Methods
//-------------------------------------------------------------------------------

/**
 * @static
 * @return {RecipeCollaboratorManager}
 */
RecipeCollaboratorManager.getInstance = function() {
    if (RecipeCollaboratorManager.instance === null) {
        RecipeCollaboratorManager.instance = new RecipeCollaboratorManager();
    }
    return RecipeCollaboratorManager.instance;
};


//-------------------------------------------------------------------------------
// Static Proxy
//-------------------------------------------------------------------------------

Proxy.proxy(RecipeCollaboratorManager, Proxy.method(RecipeCollaboratorManager.getInstance), [
    'create',
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

export default RecipeCollaboratorManager;
