//-------------------------------------------------------------------------------
// Imports
//-------------------------------------------------------------------------------

import {
    Class
} from 'bugcore';
import Firebase from '../util/Firebase';


//-------------------------------------------------------------------------------
// Declare Class
//-------------------------------------------------------------------------------

/**
 * @class
 * @extends {Firebase}
 */
const UsernameToUserId = Class.extend(Firebase, {
    _name: 'recipe.UsernameToUserId'
});


//-------------------------------------------------------------------------------
// Static Methods
//-------------------------------------------------------------------------------

/**
 * @static
 * @param {string} username
 * @return {Fireproof}
 */
UsernameToUserId.getUserIdForUsername = function(username) {
    return (new UsernameToUserId(['indexes', 'usernameToUserId', username]))
        .proof();
};

/**
 * @static
 * @param {string} username
 * @return {Promise}
 */
UsernameToUserId.removeUserIdForUsername = function(username) {
    return (new UsernameToUserId(['indexes', 'usernameToUserId', username]))
        .proof()
        .remove();
};

/**
 * @static
 * @param {string} username
 * @param {string} userId
 * @returns {Promise}
 */
UsernameToUserId.setUserIdForUsername = function(username, userId) {
    return (new UsernameToUserId(['indexes', 'usernameToUserId', username]))
        .proof()
        .set(userId);
};


//-------------------------------------------------------------------------------
// Exports
//-------------------------------------------------------------------------------

export default UsernameToUserId;
