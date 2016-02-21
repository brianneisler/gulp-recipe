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
const EmailToUserIdIndex = Class.extend(Firebase, {
    _name: 'recipe.EmailToUserIdIndex'
});


//-------------------------------------------------------------------------------
// Static Methods
//-------------------------------------------------------------------------------

/**
 * @static
 * @param {string} email
 * @return {Fireproof}
 */
EmailToUserIdIndex.getUserIdForEmail = function(email) {
    return (new EmailToUserIdIndex(['indexes', 'emailToUserId', email]))
        .proof();
};

/**
 * @static
 * @param {string} email
 * @return {Promise}
 */
EmailToUserIdIndex.removeUserIdForEmail = function(email) {
    return (new EmailToUserIdIndex(['indexes', 'emailToUserId', email]))
        .proof()
        .remove();
};

/**
 * @static
 * @param {string} email
 * @param {string} userId
 * @return {Promise}
 */
EmailToUserIdIndex.setUserIdForEmail = function(email, userId) {
    return (new EmailToUserIdIndex(['indexes', 'emailToUserId', email]))
        .proof()
        .set(userId);
};


//-------------------------------------------------------------------------------
// Exports
//-------------------------------------------------------------------------------

export default EmailToUserIdIndex;
