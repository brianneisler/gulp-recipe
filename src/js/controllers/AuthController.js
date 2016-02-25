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
     * @return {CurrentUser}
     */
    async auth() {
        //TODO BRN: Add AuthMonitor to handle cases where user becomes unauthenticated
        let currentUser = this.getCurrentUser();
        if (!currentUser) {
            //NOTE BRN: Must establish anonymous user first so that we can load the current user from db
            currentUser = this.establishAnonymousCurrentUser();
            const loadedCurrentUser = await this.tryLoadCurrentUser();
            if (loadedCurrentUser) {
                currentUser = loadedCurrentUser;
            }
        }
        return this.establishCurrentUser(currentUser);
    },

    /**
     * @return {CurrentUser}
     */
    getCurrentUser() {
        const recipeContext = ContextController.getCurrentRecipeContext();
        return this.recipeContextToCurrentUserMap.get(recipeContext);
    },

    /**
     * @param {string} email
     * @param {string} password
     * @return {CurrentUser}
     */
    async login(email, password) {
        const authData              = await this.authWithPassword(email, password);
        const currentUser           = await this.buildCurrentUserWithAuthData(authData);
        await this.saveAuthData(currentUser.getAuthData());
        const loadedCurrentUser     = this.loadCurrentUser();
        return this.establishCurrentUser(loadedCurrentUser);
    },

    /**
     * @return {CurrentUser}
     */
    async logout() {
        //NOTE BRN: Auth first so that we can establish connection with firebase and radio in the unauth
        await this.auth();
        this.unauth();
        await this.deleteCurrentUser();
        return await this.auth();
    },

    /**
     * @param {string} username
     * @param {string} email
     * @param {string} password
     * @return {CurrentUser}
     */
    async signUp(username, email, password) {
        // TODO BRN: Validate username, password
        email       = email.toLowerCase();
        username    = username.toLowerCase();
        await EmailField.validateEmail({
            id: null
        }, email);
        const firebaseUser = await Firebase.createUser({
            email: email,
            password: password
        });
        const authData = await this.authWithPassword(email, password);
        const userData = {
            email: '',
            id: firebaseUser.uid,
            signedUp: false,
            username: ''
        };
        const userEntity = await UserManager.set({ userId: firebaseUser.uid },  userData);
        await this.completeSignupWithUsernameAndEmail(userEntity, username, email);
        const currentUser = await this.buildCurrentUserWithAuthDataAndUserEntity(authData, userEntity);
        await this.saveAuthData(currentUser.getAuthData());
        const loadedCurrentUser = await this.loadCurrentUser();
        return this.establishCurrentUser(loadedCurrentUser);
    },

    /**
     * @param {UserEntity} userEntity
     * @param {string} username
     * @param {string} email
     */
    async completeSignupWithUsernameAndEmail(userEntity, username, email) {
        await Promises.all([
            EmailField.changeUsersEmail(userEntity, email),
            UsernameField.changeUsersUsername(userEntity, username)
        ]);
        return await UserManager.update({ userId: userEntity.getId() }, {
            signedUp: true
        });
    },


    //-------------------------------------------------------------------------------
    // Private Methods
    //-------------------------------------------------------------------------------

    /**
     * @private
     * @param {string} email
     * @param {string} password
     * @return {AuthData}
     */
    async authWithPassword(email, password) {
        const data = await Firebase.authWithPassword({
            email: email,
            password: password
        });
        return new AuthData(data);
    },

    /**
     * @private
     * @param {{
     *      expires: number,
     *      uid: string
     * }} data
     */
    async authDebugWithAuthData(data) {
        const debugToken = FirebaseTokenGenerator.generateDebugTokenWithAuthData(data);
        return await Firebase.authWithCustomToken(debugToken);
    },

    /**
     * @private
     * @param {string} token
     * @return {AuthData}
     */
    async authWithToken(token) {
        const data = await Firebase.authWithCustomToken(token);
        if (ConfigController.getProperty('debug')) {
            await this.authDebugWithAuthData(data);
        }
        return new AuthData(data);
    },

    /**
     * @private
     * @return {CurrentUser}
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
     * @return {CurrentUser}
     */
    async buildCurrentUserWithAuthData(authData) {
        const userEntity = await UserManager.get({ userId: authData.getUid() });
        if (!userEntity) {
            throw Throwables.exception('UserDoesNotExist', {}, 'User with uid "' + authData.getUid() + '" does not exist');
        }
        return this.buildCurrentUserWithAuthDataAndUserEntity(authData, userEntity);
    },

    /**
     * @private
     * @param {AuthData} authData
     * @param {UserEntity} userEntity
     * @return {CurrentUser}
     */
    buildCurrentUserWithAuthDataAndUserEntity(authData, userEntity) {
        //NOTE: Change to static UserData to prevent data from being lost if we need to reauth during a context switch.
        const userData = new UserData(userEntity.getRawData());
        return new CurrentUser(userData, authData);
    },

    /**
     * @private
     * @returns {{deleted: boolean, exists: boolean, key: *, value: *}}
     */
    async deleteAuthData() {
        return ConfigController.deleteConfigProperty('auth');
    },

    /**
     * @private
     */
    async deleteCurrentUser() {
        const recipeContext = ContextController.getCurrentRecipeContext();
        await this.deleteAuthData();
        this.recipeContextToCurrentUserMap.remove(recipeContext);
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
     * @return {AuthData}
     */
    async loadAuthData() {
        const data = await ConfigController.getConfigProperty('auth');
        if (!data) {
            throw Throwables.exception('NoAuthFound');
        }
        return new AuthData(data);
    },

    /**
     * @private
     * @return {CurrentUser}
     */
    async loadCurrentUser() {
        const authData = await this.loadAuthData();
        return this.buildCurrentUserWithAuthData(authData);
    },

    /**
     * @private
     * @param {AuthData} authData
     */
    async saveAuthData(authData) {
        await ConfigController.setConfigProperty('auth', authData.toObject());
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
     * @return {CurrentUser}
     */
    async tryLoadCurrentUser() {
        try {
            const loadedCurrentUser     = await this.loadCurrentUser();
            const authData              = await this.authWithToken(loadedCurrentUser.getAuthToken());
            return this.buildCurrentUserWithAuthData(authData);
        } catch(throwable) {
            if (throwable.type === 'NoAuthFound') {
                return null;
            } else if (throwable.type === 'UserDoesNotExist') {
                await this.deleteAuthData();
                return null;
            }
            throw throwable;
        }
    },

    /**
     * @private
     */
    unauth() {
        Firebase.unauth();
        // TODO BRN: Move to custom auth strategy. Store auth tokens in firebase. When user logs out, mark token as
        // invalid to prevent reuse of auth token.
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
