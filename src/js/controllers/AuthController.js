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
        this.recipeContextToCurrentUserMap      = new Map();
    },


    //-------------------------------------------------------------------------------
    // Getters and Setters
    //-------------------------------------------------------------------------------

    /**
     * @return {Map.<RecipeContext, CurrentUser>}
     */
    getRecipeContextToCurrentUserMap() {
        return this.recipeContextToCurrentUserMap;
    },


    //-------------------------------------------------------------------------------
    // Public Methods
    //-------------------------------------------------------------------------------

    /**
     * @return {Promise<CurrentUser>}
     */
    auth() {
        //TODO BRN: Add AuthMonitor to handle cases where user becomes unauthenticated
        return Promises.try(() => {
            return this.getCurrentUser();
        }).then((currentUser) => {
            if (!currentUser) {
                currentUser = this.establishAnonymousCurrentUser();
                return this.loadCurrentUser()
                    .then((loadedCurrentUser) => {
                        return this.authWithToken(loadedCurrentUser.getAuthToken())
                            .then((authData) => {
                                return this.buildCurrentUserWithAuthData(authData);
                            })
                            .then((authedCurrentUser) => {
                                return this.establishCurrentUser(authedCurrentUser);
                            });
                    })
                    .catch((throwable) => {
                        if (throwable.type === 'NoAuthFound') {
                            return currentUser;
                        } else if (throwable.type === 'UserDoesNotExist') {
                            return this.deleteAuthData()
                                .then(() => {
                                    return currentUser;
                                });
                        }
                        throw throwable;
                    });
            }
            return this.establishCurrentUser(currentUser);
        });
    },

    /**
     * @returns {CurrentUser}
     */
    getCurrentUser() {
        const recipeContext = ContextController.getCurrentRecipeContext();
        return this.recipeContextToCurrentUserMap.get(recipeContext);
    },

    /**
     * @param {string} email
     * @param {string} password
     * @return {Promise<CurrentUser>}
     */
    login(email, password) {
        return this.authWithPassword(email, password)
            .then((authData) => {
                return this.buildCurrentUserWithAuthData(authData);
            })
            .then((currentUser) => {
                return this.saveAuthData(currentUser.getAuthData());
            })
            .then(() => {
                return this.loadCurrentUser();
            })
            .then((loadedCurrentUser) => {
                return this.establishCurrentUser(loadedCurrentUser);
            });
    },

    /**
     * @return {Promise<CurrentUser>}
     */
    logout() {
        //NOTE BRN: Auth first so that we can establish connection with firebase and radio in the unauth
        return this.auth()
            .then(() => {
                return this.unauth();
            })
            .then(() => {
                return this.deleteCurrentUser();
            })
            .then(() => {
                //NOTE BRN: Reauth to establish an anonymous current user
                return this.auth();
            });
    },

    /**
     * @param {string} username
     * @param {string} email
     * @param {string} password
     * @return {Promise<CurrentUser>}
     */
    signUp(username, email, password) {
        // TODO BRN: Validate username, password
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
            return this.saveAuthData(currentUser.getAuthData())
                .then(() => {
                    return this.loadCurrentUser();
                })
                .then((loadedCurrentUser) => {
                    return this.establishCurrentUser(loadedCurrentUser);
                });
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
     * @return {Promise<AuthData>}
     */
    authWithPassword(email, password) {
        return Firebase.authWithPassword({
            email: email,
            password: password
        }).then((data) => {
            return new AuthData(data);
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
     * @return {Promise<AuthData>}
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
                return new AuthData(data);
            });
    },

    /**
     * @private
     * @return {Promise<CurrentUser>}
     */
    buildAnonymousCurrentUser() {
        const userData = new UserData({
            anonymous: true,
            id: 'anonymous'
        });
        const authData = new AuthData({});
        return new CurrentUser(userData, authData);
    },

    /**
     * @private
     * @param {AuthData} authData
     * @return {Promise<CurrentUser>}
     */
    buildCurrentUserWithAuthData(authData) {
        return UserManager.get({ userId: authData.getUid() })
            .then((userEntity) => {
                if (!userEntity) {
                    throw Throwables.exception('UserDoesNotExist', {}, 'User with uid "' + authData.getUid() + '" does not exist');
                }
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
        const recipeContext = ContextController.getCurrentRecipeContext();
        return this.deleteAuthData()
            .then(() => {
                this.recipeContextToCurrentUserMap.remove(recipeContext);
            });
    },

    /**
     * @private
     * @return {CurrentUser}
     */
    establishAnonymousCurrentUser() {
        const currentUser = this.buildAnonymousCurrentUser();
        return this.establishCurrentUser(currentUser);
    },

    /**
     * @private
     * @param {CurrentUser} currentUser
     * @return {CurrentUser}
     */
    establishCurrentUser(currentUser) {
        this.establishUserContext(currentUser);
        return this.setCurrentUser(currentUser);
    },

    /**
     * @param {CurrentUser} currentUser
     * @return {UserContext}
     */
    establishUserContext(currentUser) {
        return ContextController.establishUserContext({ userId: currentUser.getUserId() });
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
     * @returns {Promise.<CurrentUser>}
     */
    loadCurrentUser() {
        return this.loadAuthData()
            .then((authData) => {
                return this.buildCurrentUserWithAuthData(authData);
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
     * @return {CurrentUser}
     */
    setCurrentUser(currentUser) {
        const recipeContext = ContextController.getCurrentRecipeContext();
        this.recipeContextToCurrentUserMap.put(recipeContext, currentUser);
        return currentUser;
    },

    /**
     * @private
     * @return {Promise}
     */
    unauth() {
        return Promises.try(() => {
            Firebase.unauth();
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
