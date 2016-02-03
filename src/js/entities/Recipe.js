//-------------------------------------------------------------------------------
// Imports
//-------------------------------------------------------------------------------

import {
    Class,
    ObjectUtil
} from 'bugcore';
import Firebase from '../util/Firebase';
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
 * @param {{
 *  lastPublishedVersion: string=,
 *  name: string
 * }} recipeData
 * @param {UserData} userData
 * @return {Fireproof}
 */
Recipe.create = function(recipeData, userData) {
    const userId = userData.getId();
    ObjectUtil.assign(recipeData, {
        collaborators: {
            [userId]: {
                createdAt: Firebase.timestamp(),
                owner: true,
                updatedAt: Firebase.timestamp(),
                userId: userId
            }
        },
        lastPublishedVersion: '',
        scope: 'public',
        type: 'gulp'
    });
    return Recipe.set(recipeData)
        .then(() => {
            return recipeData;
        });
};

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
 *  name: string,
 *  scope: string,
 *  type: string
 * }} recipe
 * @returns {Promise}
 */
Recipe.set = function(recipe) {
    return (new Recipe(['recipes', recipe.type, recipe.scope, recipe.name]))
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
