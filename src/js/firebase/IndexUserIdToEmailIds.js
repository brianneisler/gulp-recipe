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
const IndexUserIdToEmailIds = Class.extend(Firebase, {
    _name: 'recipe.IndexUserIdToEmailIds'
});


//-------------------------------------------------------------------------------
// Static Methods
//-------------------------------------------------------------------------------

/**
 * @static
 * @param {string} userId
 * @return {Fireproof}
 */
IndexUserIdToEmailIds.getEmailIdsForUserId = function(userId) {
    return (new IndexUserIdToEmailIds(['indexUserIdToEmailIds', userId]))
        .proof();
};

/**
 * @static
 * @param {string} userId
 * @param {string} emailId
 * @return {Promise}
 */
IndexUserIdToEmailIds.removeEmailIdForUserId = function(userId, emailId) {
    return (new IndexUserIdToEmailIds(['indexUserIdToEmailIds', userId, emailId]))
        .proof()
        .remove();
};

/**
 * @static
 * @param {string} userId
 * @param {string} emailId
 * @returns {Promise}
 */
IndexUserIdToEmailIds.setEmailIdForUserId = function(userId, emailId) {
    return (new IndexUserIdToEmailIds(['indexUserIdToEmailIds', userId, emailId]))
        .proof()
        .set(emailId);
};


//-------------------------------------------------------------------------------
// Exports
//-------------------------------------------------------------------------------

export default IndexUserIdToEmailIds;
