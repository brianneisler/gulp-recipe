//-------------------------------------------------------------------------------
// Imports
//-------------------------------------------------------------------------------

import {
    Class,
    ObjectUtil
} from 'bugcore';
import Entity from './Entity';
import KeyUtil from '../util/KeyUtil';


//-------------------------------------------------------------------------------
// Declare Class
//-------------------------------------------------------------------------------

/**
 * @class
 * @extends {Entity}
 */
const PublishKey = Class.extend(Entity, {
    _name: 'recipe.PublishKey'
});


//-------------------------------------------------------------------------------
// Static Methods
//-------------------------------------------------------------------------------

/**
 * @static
 * @param {{
 *  recipeHash: string,
 *  recipeName: string,
 *  recipeVersionNumber: string
 * }} data
 * @return {Fireproof}
 */
PublishKey.create = function(data) {
    ObjectUtil.assign(data, {
        key: KeyUtil.generate(),
        recipeScope: 'public',
        recipeType: 'gulp'
    });
    return PublishKey.set(data)
        .then(() => {
            return data;
        });
};

/**
 * @static
 * @param {string} key
 * @return {Fireproof}
 */
PublishKey.get = function(key) {
    return (new PublishKey(['publishKey', key]))
        .proof();
};

/**
 * @static
 * @param {{
 *  key: string,
 *  recipeHash: string,
 *  recipeName: string,
 *  recipeScope: string,
 *  recipeType: string,
 *  recipeVersionNumber: string
 * }} data
 * @returns {Promise}
 */
PublishKey.set = function(data) {
    return (new PublishKey(['publishKey', data.key]))
        .proof()
        .set(data);
};

/**
 * @static
 * @param {string} key
 * @param {{
 *      usedAt: number
 * }} updates
 * @return {Promise}
 */
PublishKey.update = function(key, updates) {
    return (new PublishKey(['publishKey', key]))
        .proof()
        .update(updates);
};


//-------------------------------------------------------------------------------
// Exports
//-------------------------------------------------------------------------------

export default PublishKey;
