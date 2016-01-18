//-------------------------------------------------------------------------------
// Imports
//-------------------------------------------------------------------------------

import {
    Class
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
 * @param {string} versionNumber
 * @return {Fireproof}
 */
RecipeVersion.get = function(recipeName, versionNumber) {
    return (new RecipeVersion(['recipes', 'public', recipeName, 'versions', versionNumber]))
        .proof();
};

/**
 * @static
 * @param {string} recipeName
 * @param {string} versionNumber
 * @returns {Promise}
 */
RecipeVersion.remove = function(recipeName, versionNumber) {
    return (new RecipeVersion(['recipes', 'public', recipeName, 'versions', versionNumber]))
        .proof()
        .remove();
};

/**
 * @static
 * @param {string} recipeName
 * @param {{
 *      recipeUrl: string,
 *      versionNumber: string
 * }} recipeVersion
 * @returns {Promise}
 */
RecipeVersion.set = function(recipeName, recipeVersion) {
    return (new RecipeVersion(['recipes', 'public', recipeName, 'versions', recipeVersion.versionNumber]))
        .proof()
        .set(recipeVersion);
};


//-------------------------------------------------------------------------------
// Exports
//-------------------------------------------------------------------------------

export default RecipeVersion;
