//-------------------------------------------------------------------------------
// Imports
//-------------------------------------------------------------------------------

import {
    Class
} from 'bugcore';
import { Firebase } from '../util';


//-------------------------------------------------------------------------------
// Declare Class
//-------------------------------------------------------------------------------

/**
 * @class
 * @extends {Firebase}
 */
const UsernameToUserIdIndex = Class.extend(Firebase, {
    _name: 'recipe.UsernameToUserIdIndex'
});


//-------------------------------------------------------------------------------
// Static Methods
//-------------------------------------------------------------------------------

/**
 * @static
 * @param {string} username
 * @return {Fireproof}
 */
UsernameToUserIdIndex.getUserIdForUsername = function(username) {
    return (new UsernameToUserIdIndex(['indexes', 'usernameToUserId', username]))
        .proof();
};

/**
 * @static
 * @param {string} username
 * @return {Promise}
 */
UsernameToUserIdIndex.removeUserIdForUsername = function(username) {
    return (new UsernameToUserIdIndex(['indexes', 'usernameToUserId', username]))
        .proof()
        .remove();
};

/**
 * @static
 * @param {string} username
 * @param {string} userId
 * @returns {Promise}
 */
UsernameToUserIdIndex.setUserIdForUsername = function(username, userId) {
    return (new UsernameToUserIdIndex(['indexes', 'usernameToUserId', username]))
        .proof()
        .set(userId);
};


//-------------------------------------------------------------------------------
// Exports
//-------------------------------------------------------------------------------

export default UsernameToUserIdIndex;
