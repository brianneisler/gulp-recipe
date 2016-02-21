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
import { UsernameToUserIdIndex } from '../indexes';
import { Firebase } from '../util';


//-------------------------------------------------------------------------------
// Declare Class
//-------------------------------------------------------------------------------

/**
 * @class
 * @extends {Obj}
 */
const UsernameField = Class.extend(Obj, {
    _name: 'recipe.UsernameField'
});


//-------------------------------------------------------------------------------
// Static Properties
//-------------------------------------------------------------------------------

/**
 * @static
 * @const {RegExp}
 */
UsernameField.USERNAME_REGEX = /^[a-z]+(?:[a-z0-9-][a-z0-9]+)*$/;


//-------------------------------------------------------------------------------
// Static Methods
//-------------------------------------------------------------------------------

/**
 * @static
 * @param {UserEntity} userEntity
 * @param {string} inputUsername
 * @return {Promise}
 */
UsernameField.changeUsersUsername = function(userEntity, inputUsername) {
    const username = TypeUtil.isString(inputUsername) ? inputUsername.toLowerCase() : inputUsername;
    return UsernameField.validateUsername(userEntity, username)
        .then(() => {
            const updates = {
                ['users/' + userEntity.getId() + '/username']: username,
                ['indexes/usernameToUserId/' + username]: userEntity.getId()
            };
            if (userEntity.getUsername()) {
                updates['indexes/usernameToUserId/' + userEntity.getUsername()] = null;
            }
            return Firebase
                .proof([])
                .update(updates);
        });
};

/**
 * @static
 * @param {UserEntity} userEntity
 * @param {string} username
 * @returns {Promise}
 */
UsernameField.validateUsername = function(userEntity, username) {
    return Promises.try(() => {
        if (!TypeUtil.isString(username) || !username.match(UsernameField.USERNAME_REGEX)) {
            throw Throwables.exception('BadUsername');
        }
        return UsernameToUserIdIndex.getUserIdForUsername(username);
    }).then((snapshot) => {
        if (!snapshot.exists()) {
            return true;
        }
        const userId = snapshot.val();
        if (userId !== userEntity.getId()) {
            throw Throwables.exception('UsernameInUse');
        } else {
            throw Throwables.exception('UsernameUnchanged');
        }
    });
};


//-------------------------------------------------------------------------------
// Exports
//-------------------------------------------------------------------------------

export default UsernameField;
