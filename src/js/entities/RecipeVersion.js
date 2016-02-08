//-------------------------------------------------------------------------------
// Imports
//-------------------------------------------------------------------------------

import {
    Class,
    ObjectUtil,
    StringUtil
} from 'bugcore';
import Entity from './Entity';
import Firebase from '../util/Firebase';
import VersionNumber from '../fields/VersionNumber';


//-------------------------------------------------------------------------------
// Declare Class
//-------------------------------------------------------------------------------

/**
 * @class
 * @extends {Entity}
 */
const RecipeVersion = Class.extend(Entity, {
    _name: 'recipe.RecipeVersion'
});


//-------------------------------------------------------------------------------
// Static Methods
//-------------------------------------------------------------------------------

/**
 * @static
 * @param {string} recipeName
 * @param {{
 *   versionNumber: string
 * }} data
 * @return {Fireproof}
 */
RecipeVersion.create = function(recipeName, data) {
    ObjectUtil.assign(data, {
        published: false,
        recipeHash: '',
        recipeUrl: ''
    });
    return RecipeVersion.set(recipeName, data)
        .then(() => {
            return data;
        });
};

/**
 * @static
 * @param {string} recipeName
 * @param {string} versionQuery
 * @return {Fireproof<Array.<{}>>}
 */
RecipeVersion.find = function(recipeName, versionQuery) {

};

/**
 * @static
 * @param {string} recipeName
 * @param {string} versionNumber
 * @return {Fireproof}
 */
RecipeVersion.get = function(recipeName, versionNumber) {
    return (new RecipeVersion(['recipes', 'gulp', 'public', recipeName, 'versions', Firebase.escapePathPart(versionNumber)]))
        .proof();
};

/**
 * @static
 * @param {string} recipeName
 * @param {string} versionNumber
 * @returns {Promise}
 */
RecipeVersion.remove = function(recipeName, versionNumber) {
    return (new RecipeVersion(['recipes', 'gulp', 'public', recipeName, 'versions', Firebase.escapePathPart(versionNumber)]))
        .proof()
        .remove();
};

/**
 * @static
 * @param {string} recipeName
 * @param {{
 *      recipeUrl: string,
 *      versionNumber: string
 * }} data
 * @returns {Promise}
 */
RecipeVersion.set = function(recipeName, data) {
    data.versionParts = VersionNumber.parseParts(data.versionNumber);
    return (new RecipeVersion(['recipes', 'gulp', 'public', recipeName, 'versions', Firebase.escapePathPart(data.versionNumber)]))
        .proof()
        .set(data);
};

/**
 * @static
 * @param {string} recipeName
 * @param {string} versionNumber
 * @param {{
 *      published: boolean,
 *      recipeUrl: string
 * }} updates
 * @return {Promise}
 */
RecipeVersion.update = function(recipeName, versionNumber, updates) {
    return (new RecipeVersion(['recipes', 'gulp', 'public', recipeName, 'versions', Firebase.escapePathPart(versionNumber)]))
        .proof()
        .update(updates);
};


//-------------------------------------------------------------------------------
// Exports
//-------------------------------------------------------------------------------

export default RecipeVersion;
