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
const User = Class.extend(Entity, {
    _name: 'recipe.User'
});


//-------------------------------------------------------------------------------
// Static Methods
//-------------------------------------------------------------------------------

/**
 * @static
 * @param {string} userId
 * @return {Fireproof}
 */
User.get = function(userId) {
    return (new User(['users', userId]))
        .proof();
};

/**
 * @static
 * @param {{
 *      id: string,
 *      username: string
 * }} user
 * @returns {Promise}
 */
User.push = function(user) {
    return (new User(['users', user.id]))
        .proof()
        .push(user);
};

/**
 * @static
 * @param {{
 *  id: string,
 *  username: string
 * }} user
 * @returns {Promise}
 */
User.set = function(user) {
    return (new User(['users', user.id]))
        .proof()
        .set(user);
};

/**
 * @static
 * @param {string} userId
 * @param {{
 *      username: string=
 * }} updates
 * @return {Promise}
 */
User.update = function(userId, updates) {
    return (new User(['users', userId]))
        .proof()
        .update(updates);
};


//-------------------------------------------------------------------------------
// Exports
//-------------------------------------------------------------------------------

export default User;
