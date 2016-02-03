//-------------------------------------------------------------------------------
// Imports
//-------------------------------------------------------------------------------

import {
    Class,
    ObjectUtil,
    StringUtil
} from 'bugcore';
import Entity from './Entity';


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
 * @param {string} versionNumber
 * @return {Fireproof}
 */
RecipeVersion.get = function(recipeName, versionNumber) {
    return (new RecipeVersion(['recipes', 'gulp', 'public', recipeName, 'versions', StringUtil.replaceAll(versionNumber, '.', '-')]))
        .proof();
};

/**
 * @static
 * @param {string} recipeName
 * @param {string} versionNumber
 * @returns {Promise}
 */
RecipeVersion.remove = function(recipeName, versionNumber) {
    return (new RecipeVersion(['recipes', 'gulp', 'public', recipeName, 'versions', StringUtil.replaceAll(versionNumber, '.', '-')]))
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
    return (new RecipeVersion(['recipes', 'gulp', 'public', recipeName, 'versions', StringUtil.replaceAll(data.versionNumber, '.', '-')]))
        .proof()
        .set(data);
};


//-------------------------------------------------------------------------------
// Exports
//-------------------------------------------------------------------------------

export default RecipeVersion;
