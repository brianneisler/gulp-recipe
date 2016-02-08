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
const EmailToUserId = Class.extend(Firebase, {
    _name: 'recipe.EmailToUserId'
});


//-------------------------------------------------------------------------------
// Static Methods
//-------------------------------------------------------------------------------

/**
 * @static
 * @param {string} email
 * @return {Fireproof}
 */
EmailToUserId.getUserIdForEmail = function(email) {
    return (new EmailToUserId(['indexes', 'emailToUserId', Firebase.escapePathPart(email)]))
        .proof();
};

/**
 * @static
 * @param {string} email
 * @return {Promise}
 */
EmailToUserId.removeUserIdForEmail = function(email) {
    return (new EmailToUserId(['indexes', 'emailToUserId', Firebase.escapePathPart(email)]))
        .proof()
        .remove();
};

/**
 * @static
 * @param {string} email
 * @param {string} userId
 * @returns {Promise}
 */
EmailToUserId.setUserIdForEmail = function(email, userId) {
    return (new EmailToUserId(['indexes', 'emailToUserId', Firebase.escapePathPart(email)]))
        .proof()
        .set(userId);
};


//-------------------------------------------------------------------------------
// Exports
//-------------------------------------------------------------------------------

export default EmailToUserId;
