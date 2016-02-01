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
const Recipe = Class.extend(Entity, {
    _name: 'recipe.Recipe'
});


//-------------------------------------------------------------------------------
// Static Methods
//-------------------------------------------------------------------------------

/**
 * @static
 * @param {string} recipeName
 * @return {Fireproof}
 */
Recipe.get = function(recipeName) {
    return (new Recipe(['recipes', 'gulp', 'public', recipeName]))
        .proof();
};

/**
 * @static
 * @param {{
 *  lastPublishedVersion: string,
 *  name: string
 * }} recipe
 * @returns {Promise}
 */
Recipe.set = function(recipe) {
    return (new Recipe(['recipes', 'gulp', 'public', recipe.name]))
        .proof()
        .set(recipe);
};

/**
 * @static
 * @param {string} recipeName
 * @param {{
 *  lastPublishedVersion: string
 * }} updates
 * @return {Promise}
 */
Recipe.update = function(recipeName, updates) {
    return (new Recipe(['recipes', 'gulp', 'public', recipeName]))
        .proof()
        .update(updates);
};


//-------------------------------------------------------------------------------
// Exports
//-------------------------------------------------------------------------------

export default Recipe;
