//-------------------------------------------------------------------------------
// Imports
//-------------------------------------------------------------------------------

import {
    Class,
    ObjectUtil,
    Proxy
} from 'bugcore';
import { EntityManager } from './';
import { PublishKeyEntity } from '../entities';
import {
    Firebase,
    KeyUtil
} from '../util';


//-------------------------------------------------------------------------------
// Declare Class
//-------------------------------------------------------------------------------

/**
 * @class
 * @extends {EntityManager}
 */
const PublishKeyManager = Class.extend(EntityManager, {

    _name: 'recipe.PublishKeyManager',


    //-------------------------------------------------------------------------------
    // Constructor
    //-------------------------------------------------------------------------------

    /**
     * @constructs
     */
    _constructor() {
        this._super(PublishKeyEntity);
    },


    //-------------------------------------------------------------------------------
    // Public Methods
    //-------------------------------------------------------------------------------

    /**
     * @param {{
     *  recipeHash: string,
     *  recipeName: string,
     *  recipeVersionNumber: string
     * }} rawData
     * @return {Promise<PublishKeyEntity>}
     */
    create(rawData) {
        ObjectUtil.assign(rawData, {
            key: KeyUtil.generate(),
            recipeScope: 'public',
            recipeType: 'gulp'
        });
        return this.set({ key: rawData.key }, rawData);
    },


    //-------------------------------------------------------------------------------
    // EntityManager Methods
    //-------------------------------------------------------------------------------

    /**
     * @protected
     * @param {{
     *      key: string
     * }} pathData
     * @return {string}
     */
    generatePath(pathData) {
        return Firebase.path(['publishKeys', pathData.key]);
    }
});


//-------------------------------------------------------------------------------
// Private Static Properties
//-------------------------------------------------------------------------------

/**
 * @static
 * @private
 * @type {PublishKeyManager}
 */
PublishKeyManager.instance        = null;


//-------------------------------------------------------------------------------
// Static Methods
//-------------------------------------------------------------------------------

/**
 * @static
 * @return {PublishKeyManager}
 */
PublishKeyManager.getInstance = function() {
    if (PublishKeyManager.instance === null) {
        PublishKeyManager.instance = new PublishKeyManager();
    }
    return PublishKeyManager.instance;
};


//-------------------------------------------------------------------------------
// Static Proxy
//-------------------------------------------------------------------------------

Proxy.proxy(PublishKeyManager, Proxy.method(PublishKeyManager.getInstance), [
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

export default PublishKeyManager;
