//-------------------------------------------------------------------------------
// Imports
//-------------------------------------------------------------------------------

import {
    Class,
    Map,
    Obj,
    Promises,
    Proxy,
    Throwables
} from 'bugcore';
import AuthData from '../data/AuthData';
import ConfigController from './ConfigController';
import ContextController from './ContextController';
import CurrentUser from '../data/CurrentUser';
import Firebase from '../util/Firebase';
import User from '../firebase/User';
import UserData from '../data/UserData';
import Username from '../firebase/fields/Username';


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

        /**
         * @private
         * @type {Map.<RecipeContext, CurrentUser>}
         */
        this.contextToCurrentUserMap = new Map();
    },


    //-------------------------------------------------------------------------------
    // Getters and Setters
    //-------------------------------------------------------------------------------

    /**
     * @return {Map.<RecipeContext, CurrentUser>}
     */
    getContextToCurrentUserMap: function() {
        return this.contextToCurrentUserMap;
    },


    //-------------------------------------------------------------------------------
    // Public Methods
    //-------------------------------------------------------------------------------

    /**
     * @return {Promise}
     */
    auth: function() {
        return this.getCurrentUser()
            .then((currentUser) => {
                return this.authWithToken(currentUser.getAuthData().getToken());
            });
    },

    /**
     * @returns {Promise<CurrentUser>}
     */
    getCurrentUser: function() {
        const context = ContextController.getCurrentContext();
        const currentUser = this.contextToCurrentUserMap.get(context);
        if (!currentUser) {
            return this.getAuthData()
                .then((authData) => {
                    return this.buildCurrentUserWithAuthData(authData);
                });
        }
        return Promises.resolve(currentUser);
    },

    /**
     * @param {string} email
     * @param {string} password
     * @return {Promise}
     */
    login: function(email, password) {
        return this.authWithPassword(email, password)
            .then((authData) => {
                return this.buildCurrentUserWithAuthData(authData);
            })
            .then((currentUser) => {
                return this.setCurrentUser(currentUser);
            });
    },

    /**
     * @return {Promise}
     */
    logout: function() {
        return this.unauth()
            .then(() => {
                return this.deleteCurrentUser();
            });
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
        }).then((firebaseUser) => {
            return this.authWithPassword(email, password)
                .then((authData) => {
                    return [firebaseUser, authData];
                });
        }).then((results) => {
            const [firebaseUser, authData] = results;
            const user = {
                id: firebaseUser.uid,
                signedUp: false,
                username: ''
            };
            return User.set(user)
                .then(() => {
                    return [user, authData];
                });
        }).then((results) => {
            const [user, authData] = results;
            return this.completeSignupWithUsername(user, username)
                .then(() => {
                    return this.buildCurrentUserWithAuthData(authData);
                });
        }).then((currentUser) => {
            return this.setCurrentUser(currentUser);
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
        }).then((data) => {
            return new AuthData(data);
        });
    },

    /**
     * @private
     * @param {string} token
     * @return {Promise}
     */
    authWithToken: function(token) {
        return Firebase.authWithCustomToken(token)
            .then((data) => {
                return new AuthData(data);
            });
    },

    /**
     * @private
     * @param {AuthData} authData
     * @return {Promise}
     */
    buildCurrentUserWithAuthData: function(authData) {
        return User.get(authData.getUid())
            .then((snapshot) => {
                const userData = new UserData(snapshot.val());
                return new CurrentUser(userData, authData);
            });
    },

    /**
     * @private
     * @return {Promise}
     */
    deleteAuthData: function() {
        return ConfigController.deleteConfigProperty('auth');
    },

    /**
     * @private
     * @return {Promise}
     */
    deleteCurrentUser: function() {
        const context = ContextController.getCurrentContext();
        return this.deleteAuthData()
            .then(() => {
                this.contextToCurrentUserMap.remove(context);
            });
    },

    /**
     * @private
     */
    getAuthData: function() {
        return ConfigController.getConfigProperty('auth')
            .then((data) => {
                if (!data) {
                    throw Throwables.exception('NoAuthFound');
                }
                return new AuthData(data);
            });
    },

    /**
     * @private
     * @param {AuthData} authData
     * @returns {Promise}
     */
    setAuthData: function(authData) {
        return ConfigController.setConfigProperty('auth', authData.toObject());
    },

    /**
     * @private
     * @param {CurrentUser} currentUser
     * @returns {Promise}
     */
    setCurrentUser: function(currentUser) {
        const context = ContextController.getCurrentContext();
        return this.setAuthData(currentUser.getAuthData())
            .then(() => {
                this.contextToCurrentUserMap.put(context, currentUser);
                return currentUser;
            });
    },

    /**
     * @private
     * @return {Promise}
     */
    unauth: function() {
        return Promises.try(() => {
            return Firebase.unauth();
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
    'auth',
    'login',
    'getCurrentUser',
    'logout',
    'signUp'
]);


//-------------------------------------------------------------------------------
// Exports
//-------------------------------------------------------------------------------

export default AuthController;
