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
import IndexUsernameToUserId from '../IndexUsernameToUserId';
import User from '../User';


//-------------------------------------------------------------------------------
// Declare Class
//-------------------------------------------------------------------------------

/**
 * @class
 * @extends {Obj}
 */
const Username = Class.extend(Obj, {
    _name: 'recipe.Username'
});


//-------------------------------------------------------------------------------
// Static Properties
//-------------------------------------------------------------------------------

/**
 * @const {RegExp}
 */
Username.USERNAME_REGEX = /^[a-z]+(?:[a-z0-9-][a-z0-9]+)*$/;


//-------------------------------------------------------------------------------
// Static Methods
//-------------------------------------------------------------------------------

/**
 * @static
 * @param {{}} user
 * @param {string} inputUsername
 * @return {Promise}
 */
Username.changeUsersUsername = function(user, inputUsername) {
    const username = TypeUtil.isString(inputUsername) ? inputUsername.toLowerCase() : inputUsername;
    return this.validateUsername(user, username)
        .then(() => {
            if (user.username) {
                return IndexUsernameToUserId.removeUserIdForUsername(user.username);
            }
        })
        .then(() => {
            return IndexUsernameToUserId.setUserIdForUsername(username, user.id);
        }).then(() => {
            return User.update(user.id, {
                username: username
            });
        });
};

/**
 * @static
 * @param {{}} user
 * @param {string} username
 * @returns {Promise}
 */
Username.validateUsername = function(user, username) {
    return Promises.try(() => {
        if (!TypeUtil.isString(username) || !username.match(Username.USERNAME_REGEX)) {
            throw Throwables.exception('BadUsername');
        }
        return IndexUsernameToUserId.getUserIdForUsername(username);
    }).then((snapshot) => {
        if (!snapshot.exists()) {
            return true;
        } else {
            const userId = snapshot.val();
            if (userId !== user.id) {
                throw Throwables.exception('UsernameInUse');
            } else {
                throw Throwables.exception('UsernameUnchanged');
            }
        }
    });
};


//-------------------------------------------------------------------------------
// Exports
//-------------------------------------------------------------------------------

export default Username;
