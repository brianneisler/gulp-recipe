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
import {
    ConfigController,
    ContextController
} from './';
import {
    AuthData,
    CurrentUser,
    UserData
} from '../data';
import {
    EmailField,
    UsernameField
} from '../fields';
import {
    UserManager
} from '../managers';
import {
    Firebase,
    FirebaseTokenGenerator
} from '../util';


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
    _constructor() {

        this._super();


        //-------------------------------------------------------------------------------
        // Public Properties
        //-------------------------------------------------------------------------------

        /**
         * @private
         * @type {Map.<RecipeContext, CurrentUser>}
         */
        this.contextToCurrentUserMap    = new Map();

        /**
         * @private
         * @type {AuthData}
         */
        this.currentAuthData            = null;
    },


    //-------------------------------------------------------------------------------
    // Getters and Setters
    //-------------------------------------------------------------------------------

    /**
     * @return {Map.<RecipeContext, CurrentUser>}
     */
    getContextToCurrentUserMap() {
        return this.contextToCurrentUserMap;
    },

    /**
     * @return {AuthData}
     */
    getCurrentAuthData() {
        return this.currentAuthData;
    },

    /**
     * @param {AuthData} authData
     */
    setCurrentAuthData(authData) {
        this.currentAuthData = authData;
    },


    //-------------------------------------------------------------------------------
    // Public Methods
    //-------------------------------------------------------------------------------

    /**
     * @return {Promise}
     */
    auth() {

        //TODO BRN: Add caching to auth to prevent multiple reauths when user is already authenticated. Add AuthMonitor to handle cases where user becomes unauthenticated
        return this.getCurrentUser()
            .then((currentUser) => {
                return this.authWithToken(currentUser.getAuthData().getToken());
            });
    },

    /**
     * @returns {Promise<CurrentUser>}
     */
    getCurrentUser() {
        const context = ContextController.getCurrentContext();
        const currentUser = this.contextToCurrentUserMap.get(context);
        if (!currentUser) {
            return this.loadAuthData()
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
    login(email, password) {
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
    logout() {
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
    signUp(username, email, password) {
        // TODO BRN: Validate username, email, password
        email       = email.toLowerCase();
        username    = username.toLowerCase();
        return EmailField.validateEmail({
            id: null
        }, email).then(() => {
            return Firebase.createUser({
                email: email,
                password: password
            });
        }).then((firebaseUser) => {
            return this.authWithPassword(email, password)
                .then((authData) => {
                    return [firebaseUser, authData];
                });
        }).then((results) => {
            const [firebaseUser, authData] = results;
            const userData = {
                email: '',
                id: firebaseUser.uid,
                signedUp: false,
                username: ''
            };
            return UserManager.set({ userId: firebaseUser.uid },  userData)
                .then((userEntity) => {
                    return [userEntity, authData];
                });
        }).then((results) => {
            const [userEntity, authData] = results;
            return this.completeSignupWithUsernameAndEmail(userEntity, username, email)
                .then(() => {
                    return this.buildCurrentUserWithAuthData(authData);
                });
        }).then((currentUser) => {
            return this.setCurrentUser(currentUser);
        });
    },

    /**
     * @param {UserEntity} userEntity
     * @param {string} username
     * @param {string} email
     * @return {Promise}
     */
    completeSignupWithUsernameAndEmail(userEntity, username, email) {
        return Promises.all([
            EmailField.changeUsersEmail(userEntity, email),
            UsernameField.changeUsersUsername(userEntity, username)
        ]).then(() => {
            return UserManager.update({ userId: userEntity.getId() }, {
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
    authWithPassword(email, password) {
        return Firebase.authWithPassword({
            email: email,
            password: password
        }).then((data) => {
            const authData = new AuthData(data);
            this.setCurrentAuthData(authData);
            return authData;
        });
    },

    /**
     * @private
     * @param {{
     *      expires: number,
     *      uid: string
     * }} data
     * @returns {Promise}
     */
    authDebugWithAuthData(data) {
        const debugToken = FirebaseTokenGenerator.generateDebugTokenWithAuthData(data);
        return Firebase.authWithCustomToken(debugToken);
    },

    /**
     * @private
     * @param {string} token
     * @return {Promise}
     */
    authWithToken(token) {
        return Firebase.authWithCustomToken(token)
            .then((data) => {
                if (ConfigController.getProperty('debug')) {
                    return this.authDebugWithAuthData(data)
                        .then(() => {
                            return data;
                        });
                }
                return data;
            })
            .then((data) => {
                const authData = new AuthData(data);
                this.setCurrentAuthData(authData);
                return authData;
            });
    },

    /**
     * @private
     * @param {AuthData} authData
     * @return {Promise}
     */
    buildCurrentUserWithAuthData(authData) {
        return UserManager.get({ userId: authData.getUid() })
            .then((userEntity) => {

                //NOTE: Change to static UserData to prevent data from being lost if we need to reauth during a context switch.
                const userData = new UserData(userEntity.getRawData());
                return new CurrentUser(userData, authData);
            });
    },

    /**
     * @private
     * @return {Promise}
     */
    deleteAuthData() {
        return ConfigController.deleteConfigProperty('auth');
    },

    /**
     * @private
     * @return {Promise}
     */
    deleteCurrentUser() {
        const context = ContextController.getCurrentContext();
        return this.deleteAuthData()
            .then(() => {
                this.contextToCurrentUserMap.remove(context);
            });
    },

    /**
     * @private
     */
    loadAuthData() {
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
    saveAuthData(authData) {
        return ConfigController.setConfigProperty('auth', authData.toObject());
    },

    /**
     * @private
     * @param {CurrentUser} currentUser
     * @returns {Promise}
     */
    setCurrentUser(currentUser) {
        const context = ContextController.getCurrentContext();
        return this.saveAuthData(currentUser.getAuthData())
            .then(() => {
                this.contextToCurrentUserMap.put(context, currentUser);
                return currentUser;
            });
    },

    /**
     * @private
     * @return {Promise}
     */
    unauth() {
        return this.getCurrentUser()
            .then((currentUser) => {
                if (Obj.equals(currentUser.getAuthData(), this.currentAuthData)) {
                    this.setCurrentAuthData(null);
                    Firebase.unauth();
                }
                // TODO BRN: Move to custom auth strategy. Store auth tokens in firebase. When user logs out, mark token as
                // invalid to prevent reuse of auth token.
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
