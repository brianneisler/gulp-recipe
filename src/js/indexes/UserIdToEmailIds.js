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
const UserIdToEmailIds = Class.extend(Firebase, {
    _name: 'recipe.UserIdToEmailIds'
});


//-------------------------------------------------------------------------------
// Static Methods
//-------------------------------------------------------------------------------

/**
 * @static
 * @param {string} userId
 * @return {Fireproof}
 */
UserIdToEmailIds.getEmailIdsForUserId = function(userId) {
    return (new UserIdToEmailIds(['indexes', 'userIdToEmailIds', userId]))
        .proof();
};

/**
 * @static
 * @param {string} userId
 * @param {string} emailId
 * @return {Promise}
 */
UserIdToEmailIds.removeEmailIdForUserId = function(userId, emailId) {
    return (new UserIdToEmailIds(['indexes', 'userIdToEmailIds', userId, emailId]))
        .proof()
        .remove();
};

/**
 * @static
 * @param {string} userId
 * @param {string} emailId
 * @returns {Promise}
 */
UserIdToEmailIds.setEmailIdForUserId = function(userId, emailId) {
    return (new UserIdToEmailIds(['indexes', 'userIdToEmailIds', userId, emailId]))
        .proof()
        .set(emailId);
};


//-------------------------------------------------------------------------------
// Exports
//-------------------------------------------------------------------------------

export default UserIdToEmailIds;
