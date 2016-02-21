//-------------------------------------------------------------------------------
// Imports
//-------------------------------------------------------------------------------

import {
    Class,
    Proxy
} from 'bugcore';
import { EntityManager } from './';
import { RecipeEntity } from '../entities';
import { Firebase } from '../util';


//-------------------------------------------------------------------------------
// Declare Class
//-------------------------------------------------------------------------------

/**
 * @class
 * @extends {EntityManager}
 */
const RecipeManager = Class.extend(EntityManager, {

    _name: 'recipe.RecipeManager',


    //-------------------------------------------------------------------------------
    // Constructor
    //-------------------------------------------------------------------------------

    /**
     * @constructs
     */
    _constructor() {
        this._super(RecipeEntity);
    },


    //-------------------------------------------------------------------------------
    // Public Methods
    //-------------------------------------------------------------------------------

    /**
     * @param {{
     *      name: string,
     *      scope: string,
     *      type: string
     * }} rawData
     * @param {UserData} userData
     * @return {Promise<RecipeEntity>}
     */
    create(rawData, userData) {
        const userId = userData.getId();
        const data = {
            collaborators: {
                [userId]: {
                    createdAt: Firebase.timestamp(),
                    owner: true,
                    updatedAt: Firebase.timestamp(),
                    userId: userId
                }
            },
            info: {
                createdAt: Firebase.timestamp(),
                name: rawData.name,
                scope: rawData.scope,
                type: rawData.type,
                updatedAt: Firebase.timestamp()
            }
        };
        return Firebase
            .proof(['recipes', 'gulp', 'public', rawData.name])
            .set(data)
            .then(() => {
                const path      = this.generatePath({
                    recipeName: rawData.name,
                    recipeScope: rawData.scope,
                    recipeType: rawData.type
                });
                const entity    = this.generateEntity(path, data.info);
                return this.addCache(entity);
            });
    },


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
        return Firebase.path(['recipes', pathData.recipeType, pathData.recipeScope, pathData.recipeName, 'info']);
    }
});


//-------------------------------------------------------------------------------
// Private Static Properties
//-------------------------------------------------------------------------------

/**
 * @static
 * @private
 * @type {RecipeManager}
 */
RecipeManager.instance        = null;


//-------------------------------------------------------------------------------
// Static Methods
//-------------------------------------------------------------------------------

/**
 * @static
 * @return {RecipeManager}
 */
RecipeManager.getInstance = function() {
    if (RecipeManager.instance === null) {
        RecipeManager.instance = new RecipeManager();
    }
    return RecipeManager.instance;
};


//-------------------------------------------------------------------------------
// Static Proxy
//-------------------------------------------------------------------------------

Proxy.proxy(RecipeManager, Proxy.method(RecipeManager.getInstance), [
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

export default RecipeManager;
