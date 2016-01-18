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
const IndexUsernameToUserId = Class.extend(Firebase, {
    _name: 'recipe.IndexUsernameToUserId'
});


//-------------------------------------------------------------------------------
// Static Methods
//-------------------------------------------------------------------------------

/**
 * @static
 * @param {string} username
 * @return {Fireproof}
 */
IndexUsernameToUserId.getUserIdForUsername = function(username) {
    return (new IndexUsernameToUserId(['indexUsernameToUserId', username]))
        .proof();
};

/**
 * @static
 * @param {string} username
 * @return {Promise}
 */
IndexUsernameToUserId.removeUserIdForUsername = function(username) {
    return (new IndexUsernameToUserId(['indexUsernameToUserId', username]))
        .proof()
        .remove();
};

/**
 * @static
 * @param {string} username
 * @param {string} userId
 * @returns {Promise}
 */
IndexUsernameToUserId.setUserIdForUsername = function(username, userId) {
    return (new IndexUsernameToUserId(['indexUsernameToUserId', username]))
        .proof()
        .set(userId);
};


//-------------------------------------------------------------------------------
// Exports
//-------------------------------------------------------------------------------

export default IndexUsernameToUserId;
