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
const RecipeCollaborator = Class.extend(Entity, {
    _name: 'recipe.RecipeCollaborator'
});


//-------------------------------------------------------------------------------
// Static Methods
//-------------------------------------------------------------------------------

/**
 * @static
 * @param {string} recipeName
 * @param {string} userId
 * @return {Fireproof}
 */
RecipeCollaborator.get = function(recipeName, userId) {
    return (new RecipeCollaborator(['recipes', 'gulp', 'public', recipeName, 'collaborators', userId]))
        .proof();
};

/**
 * @static
 * @param {string} recipeName
 * @param {string} userId
 * @returns {Promise}
 */
RecipeCollaborator.remove = function(recipeName, userId) {
    return (new RecipeCollaborator(['recipes', 'gulp', 'public', recipeName, 'collaborators', userId]))
        .proof()
        .remove();
};

/**
 * @static
 * @param {string} recipeName
 * @param {{
 *      owner: boolean,
 *      userId: string
 * }} recipeCollaborator
 * @returns {Promise}
 */
RecipeCollaborator.set = function(recipeName, recipeCollaborator) {
    return (new RecipeCollaborator(['recipes', 'gulp', 'public', recipeName, 'collaborators', recipeCollaborator.userId]))
        .proof()
        .set(recipeCollaborator);
};

/**
 * @static
 * @param {string} recipeName
 * @param {string} userId
 * @param {{
 *      owner: string=
 * }} updates
 * @return {Promise}
 */
RecipeCollaborator.update = function(recipeName, userId, updates) {
    return (new RecipeCollaborator(['recipes', 'gulp', 'public', recipeName, 'collaborators', userId]))
        .proof()
        .update(updates);
};


//-------------------------------------------------------------------------------
// Exports
//-------------------------------------------------------------------------------

export default RecipeCollaborator;
