//-------------------------------------------------------------------------------
// Imports
//-------------------------------------------------------------------------------

import {
    Class,
    Obj,
    Promises,
    Throwables,
    TypeUtil
} from 'bugcore';
import EmailValidator from 'email-validator';
import { EmailToUserIdIndex } from '../indexes';
import { Firebase } from '../util';


//-------------------------------------------------------------------------------
// Declare Class
//-------------------------------------------------------------------------------

/**
 * @class
 * @extends {Obj}
 */
const EmailField = Class.extend(Obj, {
    _name: 'recipe.EmailField'
});


//-------------------------------------------------------------------------------
// Static Methods
//-------------------------------------------------------------------------------

/**
 * @static
 * @param {UserEntity} userEntity
 * @param {string} inputEmail
 * @return {Promise}
 */
EmailField.changeUsersEmail = function(userEntity, inputEmail) {
    const email = TypeUtil.isString(inputEmail) ? inputEmail.toLowerCase() : inputEmail;
    return this.validateEmail(userEntity, email)
        .then(() => {
            const updates = {
                ['users/' + userEntity.getId() + '/email']: inputEmail,
                ['indexes/emailToUserId/' + Firebase.escapePathPart(inputEmail)]: userEntity.getId()
            };
            if (userEntity.getEmail()) {
                updates['indexes/emailToUserId/' + Firebase.escapePathPart(userEntity.getEmail())] = null;
            }
            return Firebase
                .proof([])
                .update(updates);
        });
};

/**
 * @static
 * @param {UserEntity} userEntity
 * @param {string} email
 * @returns {Promise}
 */
EmailField.validateEmail = function(userEntity, email) {
    return Promises.try(() => {
        if (!TypeUtil.isString(email) || !EmailValidator.validate(email)) {
            throw Throwables.exception('BadEmail');
        }
        return EmailToUserIdIndex.getUserIdForEmail(email);
    }).then((snapshot) => {
        if (!snapshot.exists()) {
            return true;
        }
        const userId = snapshot.val();
        if (userId !== userEntity.getId()) {
            throw Throwables.exception('EmailInUse');
        }
        throw Throwables.exception('EmailUnchanged');
    });
};


//-------------------------------------------------------------------------------
// Exports
//-------------------------------------------------------------------------------

export default EmailField;
