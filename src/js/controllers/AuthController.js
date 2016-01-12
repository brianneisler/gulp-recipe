//-------------------------------------------------------------------------------
// Imports
//-------------------------------------------------------------------------------

import {
    Class,
    Obj,
    Proxy
} from 'bugcore';
import Firebase from '../util/Firebase';
import User from '../data/User';
import Username from '../data/fields/Username';


//-------------------------------------------------------------------------------
// Declare Class
//-------------------------------------------------------------------------------

/**
 * @class
 * @extends {Obj}
 */
const AuthController = Class.extend(Obj, {

    _name: 'recipe.AuthController',


    //-------------------------------------------------------------------------------
    // Constructor
    //-------------------------------------------------------------------------------

    /**
     * @constructs
     */
    _constructor: function() {

        this._super();


        //-------------------------------------------------------------------------------
        // Public Properties
        //-------------------------------------------------------------------------------


    },


    //-------------------------------------------------------------------------------
    // Getters and Setters
    //-------------------------------------------------------------------------------


    //-------------------------------------------------------------------------------
    // Public Methods
    //-------------------------------------------------------------------------------

    /**
     * @return {Promise}
     */
    hasAuth: function() {

    },

    login: function(email, password) {

    },

    logout: function() {

    },

    /**
     * @param {string} username
     * @param {string} email
     * @param {string} password
     * @return {Promise}
     */
    signUp: function(username, email, password) {
        // TODO BRN: Validate username, email, password
        email       = email.toLowerCase();
        username    = username.toLowerCase();
        return Firebase.createUser({
            email: email,
            password: password
        }).then((userData) => {
            return this.authWithPassword(email, password)
                .then((authData) => {
                    return [userData, authData];
                });
        }).then((results) => {
            const [userData, authData] = results;
            return User.set({
                id: userData.uid,
                signedUp: false,
                username: ''
            }).then((user) => {
                return [user.val(), authData];
            });
        }).then((results) => {
            const [user, authData] = results;
            return this.completeSignupWithUsername(user, username)
                .then(() => {
                    return [user, authData];
                });
        });

        // TODO BRN: Save email address
    },

    /**
     * @param {{}} user
     * @param {string} username
     * @return {Promise}
     */
    completeSignupWithUsername: function(user, username) {
        return Username.changeUsersUsername(user, username)
            .then(() => {
                return User.update(user.id, {
                    signedUp: true
                });
            });
    },


    //-------------------------------------------------------------------------------
    // Private Methods
    //-------------------------------------------------------------------------------

    /**
     * @private
     * @param {string} email
     * @param {string} password
     * @return {Promise}
     */
    authWithPassword: function(email, password) {
        return Firebase.authWithPassword({
            email: email,
            password: password
        }).then((authData) => {
            console.log('authData:', authData);
            return authData;
        });
    }
});


//-------------------------------------------------------------------------------
// Private Static Properties
//-------------------------------------------------------------------------------

/**
 * @static
 * @private
 * @type {AuthController}
 */
AuthController.instance        = null;


//-------------------------------------------------------------------------------
// Static Methods
//-------------------------------------------------------------------------------

/**
 * @static
 * @return {AuthController}
 */
AuthController.getInstance = function() {
    if (AuthController.instance === null) {
        AuthController.instance = new AuthController();
    }
    return AuthController.instance;
};


//-------------------------------------------------------------------------------
// Static Proxy
//-------------------------------------------------------------------------------

Proxy.proxy(AuthController, Proxy.method(AuthController.getInstance), [
    'login',
    'logout',
    'signUp'
]);


//-------------------------------------------------------------------------------
// Exports
//-------------------------------------------------------------------------------

export default AuthController;
