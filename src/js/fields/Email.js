//-------------------------------------------------------------------------------
// Imports
//-------------------------------------------------------------------------------

import {
    Class,
    Obj,
    Promises,
    StringBuilder,
    Throwables,
    TypeUtil
} from 'bugcore';
import EmailValidator from 'email-validator';
import Firebase from '../util/Firebase';
import EmailToUserId from '../indexes/EmailToUserId';


//-------------------------------------------------------------------------------
// Declare Class
//-------------------------------------------------------------------------------

/**
 * @class
 * @extends {Obj}
 */
const Email = Class.extend(Obj, {
    _name: 'recipe.Email'
});


//-------------------------------------------------------------------------------
// Static Methods
//-------------------------------------------------------------------------------

/**
 * @static
 * @param {{}} user
 * @param {string} inputEmail
 * @return {Promise}
 */
Email.changeUsersEmail = function(user, inputEmail) {
    const email = TypeUtil.isString(inputEmail) ? inputEmail.toLowerCase() : inputEmail;
    return this.validateEmail(user, email)
        .then(() => {
            const updates = {
                ['users/' + user.id + '/email']: inputEmail,
                ['indexes/emailToUserId/' + Firebase.escapePathPart(inputEmail)]: user.id
            };
            if (user.email) {
                updates['indexes/emailToUserId/' + Firebase.escapePathPart(user.email)] = null;
            }
            return Firebase
                .proof([])
                .update(updates);
        });
};

/**
 * @static
 * @param {{}} user
 * @param {string} email
 * @returns {Promise}
 */
Email.validateEmail = function(user, email) {
    return Promises.try(() => {
        if (!TypeUtil.isString(email) || !EmailValidator.validate(email)) {
            throw Throwables.exception('BadEmail');
        }
        return EmailToUserId.getUserIdForEmail(email);
    }).then((snapshot) => {
        if (!snapshot.exists()) {
            return true;
        } else {
            const userId = snapshot.val();
            if (userId !== user.id) {
                throw Throwables.exception('EmailInUse');
            } else {
                throw Throwables.exception('EmailUnchanged');
            }
        }
    });
};


//-------------------------------------------------------------------------------
// Exports
//-------------------------------------------------------------------------------

export default Email;
