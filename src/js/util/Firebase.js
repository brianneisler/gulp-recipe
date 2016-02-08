//-------------------------------------------------------------------------------
// Imports
//-------------------------------------------------------------------------------

import {
    Class,
    Obj,
    StringBuilder,
    TypeUtil
} from 'bugcore';
import firebase from 'Firebase';
import ConfigController from '../controllers/ConfigController';
import Fireproof from './Fireproof';


//-------------------------------------------------------------------------------
// Declare Class
//-------------------------------------------------------------------------------

/**
 * @class
 * @extends {Obj}
 */
const Firebase = Class.extend(Obj, {

    _name: 'recipe.Firebase',


    //-------------------------------------------------------------------------------
    // Constructor
    //-------------------------------------------------------------------------------

    /**
     * @constructs
     * @param {*} value
     */
    _constructor(value) {

        this._super();


        //-------------------------------------------------------------------------------
        // Public Properties
        //-------------------------------------------------------------------------------

        /**
         * @private
         * @type {firebase}
         */
        this._ref = null;

        if (value instanceof firebase) {
            this._ref = value;
        } else if (TypeUtil.isArray(value)) {
            this._ref = new firebase([ConfigController.getProperty('firebaseUrl')].concat(value).join('/'));
        } else {
            this._ref = new firebase(value);
        }
    },


    //-------------------------------------------------------------------------------
    // Getters and Setters
    //-------------------------------------------------------------------------------

    /**
     * @method Firebase#getRef
     * @return {firebase}
     */
    getRef() {
        return this._ref;
    },


    //-------------------------------------------------------------------------------
    // Public Methods
    //-------------------------------------------------------------------------------

    /**
     * @param {string} authToken
     * @param {function=} onComplete
     * @param {{}} options
     */
    authWithCustomToken(authToken, onComplete, options) {
        this._ref.authWithCustomToken(authToken, onComplete, options);
    },

    /**
     * @param {{
     *      email: string,
     *      password: string
     * }} credentials
     * @param {function=} onComplete
     */
    authWithPassword(credentials, onComplete) {
        this._ref.authWithPassword(credentials, onComplete);
    },

    /**
     * @param {{
     *      email: string,
     *      password: string
     * }} credentials
     * @param {function=} onComplete
     */
    createUser(credentials, onComplete) {
        this._ref.createUser(credentials, onComplete);
    },

    /**
     * @return {*}
     */
    key() {
        return this._ref.key();
    },

    /**
     * @param eventType
     * @param successCallback
     * @param failureCallback
     * @param context
     */
    once(eventType, successCallback, failureCallback, context) {
        this._ref.once(eventType, successCallback, failureCallback, context);
    },

    /**
     * @method Firebase#proof
     * @return {Promise}
     */
    proof() {
        return new Fireproof(this);
    },

    /**
     * @method Firebase#push
     * @param {*} value
     * @param {function=} onComplete
     * @return {Firebase}
     */
    push(value, onComplete) {
        const ref = this._ref.push(value, onComplete);
        return new Firebase(ref);
    },

    /**
     * @method Firebase#ref
     * @return {firebase}
     */
    ref() {
        return this._ref;
    },

    /**
     * @method Firebase#remove
     * @param {function=} onComplete
     */
    remove(onComplete) {
        this._ref.remove(onComplete);
    },

    /**
     * @method Firebase#set
     * @param {*} value
     * @param {function=} onComplete
     */
    set(value, onComplete) {
        this._ref.set(value, onComplete);
    },

    /**
     * @method Firebase#transaction
     * @param {function} updateFunction
     * @param {function=} onComplete
     * @param {boolean=} applyLocally
     */
    transaction(updateFunction, onComplete, applyLocally) {
        this._ref.transaction(updateFunction, onComplete, applyLocally);
    },

    /**
     * @return {*}
     */
    unauth() {
        return this._ref.unauth();
    },

    /**
     * @method Firebase#update
     * @param {Object} value
     * @param {function=} onComplete
     */
    update(value, onComplete) {
        this._ref.update(value, onComplete);
    }
});


//-------------------------------------------------------------------------------
// Static Methods
//-------------------------------------------------------------------------------

/**
 * @static
 * @param {string} token
 * @param {function=} onComplete
 * @return {Promise}
 */
Firebase.authWithCustomToken = function(token, onComplete) {
    return (new Firebase([]))
        .proof()
        .authWithCustomToken(token, onComplete);
};

/**
 * @static
 * @param {{
 *      email: string,
 *      password: string
 * }} credentials
 * @param {function=} onComplete
 * @return {Promise}
 */
Firebase.authWithPassword = function(credentials, onComplete) {
    return (new Firebase([]))
        .proof()
        .authWithPassword(credentials, onComplete);
};

/**
 * @static
 * @param {{
 *      email: string,
 *      password: string
 * }} credentials
 * @param {function=} onComplete
 * @return {Promise}
 */
Firebase.createUser = function(credentials, onComplete) {
    return (new Firebase([]))
        .proof()
        .createUser(credentials, onComplete);
};

/**
 * @static
 * @param {string} pathPart
 * @return {string}
 */
Firebase.escapePathPart = function(pathPart) {
    return new StringBuilder(pathPart)
        .replaceAll('.', '(P)')
        .replaceAll('@', '(A)')
        .replaceAll('!', '(B)')
        .replaceAll('#', '(H)')
        .replaceAll('$', '(D)')
        .replaceAll('%', '(PR)')
        .replaceAll('&', '(AN)')
        .replaceAll('\'', '(SQ)')
        .replaceAll('*', '(ST)')
        .replaceAll('+', '(PL)')
        .replaceAll('/', '(FS)')
        .replaceAll('=', '(E)')
        .replaceAll('?', '(Q)')
        .replaceAll('^', '(C)')
        .replaceAll('`', '(G)') //grave accent
        .replaceAll('{', '(OC)')
        .replaceAll('|', '(PI)')
        .replaceAll('}', '(CC)')
        .build();
};

/**
 * @static
 * @param {*} ref
 * @return {Firebase}
 */
Firebase.fire = function(ref) {
    return new Firebase(ref);
};

/**
 * @static
 * @param {*} ref
 * @return {Fireproof}
 */
Firebase.proof = function(ref) {
    return (new Firebase(ref)).proof();
};

/**
 * @static
 * @param {*} ref
 * @return {Firebase}
 */
Firebase.ref = function(ref) {
    return (new Firebase(ref)).ref();
};

/**
 * @static
 * @returns {number}
 */
Firebase.timestamp = function() {
    return firebase.ServerValue.TIMESTAMP;
};

/**
 * @static
 */
Firebase.unauth = function() {
    return (new Firebase([]))
        .unauth();
};

/**
 * @static
 * @param {string} pathPart
 * @return {string}
 */
Firebase.unescapePathPart = function(pathPart) {
    return new StringBuilder(pathPart)
        .replaceAll('(P)', '.')
        .replaceAll('(A)', '@')
        .replaceAll('(B)', '!')
        .replaceAll('(H)', '#')
        .replaceAll('(D)', '$')
        .replaceAll('(PR)', '%')
        .replaceAll('(AN)', '&')
        .replaceAll('(SQ)', '\'')
        .replaceAll('(ST)', '*')
        .replaceAll('(PL)', '+')
        .replaceAll('(FS)' ,'/')
        .replaceAll('(E)', '=')
        .replaceAll('(Q)', '?')
        .replaceAll('(C)', '^')
        .replaceAll('(G)', '`') //grave accent
        .replaceAll('(OC)', '{')
        .replaceAll('(PI)', '|')
        .replaceAll('(CC)', '}')
        .build();
};


//-------------------------------------------------------------------------------
// Exports
//-------------------------------------------------------------------------------

export default Firebase;
