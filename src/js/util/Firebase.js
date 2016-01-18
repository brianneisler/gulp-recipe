//-------------------------------------------------------------------------------
// Imports
//-------------------------------------------------------------------------------

import {
    Class,
    Obj,
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
    _constructor: function(value) {

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
    getRef: function() {
        return this._ref;
    },


    //-------------------------------------------------------------------------------
    // Public Methods
    //-------------------------------------------------------------------------------

    /**
     * @param {{
     *      email: string,
     *      password: string
     * }} credentials
     * @param {function=} onComplete
     */
    authWithPassword: function(credentials, onComplete) {
        this._ref.authWithPassword(credentials, onComplete);
    },

    /**
     * @param {{
     *      email: string,
     *      password: string
     * }} credentials
     * @param {function=} onComplete
     */
    createUser: function(credentials, onComplete) {
        this._ref.createUser(credentials, onComplete);
    },

    /**
     * @return {*}
     */
    key: function() {
        return this._ref.key();
    },

    /**
     * @param eventType
     * @param successCallback
     * @param failureCallback
     * @param context
     */
    once: function(eventType, successCallback, failureCallback, context) {
        this._ref.once(eventType, successCallback, failureCallback, context);
    },

    /**
     * @method Firebase#proof
     * @return {Promise}
     */
    proof: function() {
        return new Fireproof(this);
    },

    /**
     * @method Firebase#push
     * @param {*} value
     * @param {function=} onComplete
     * @return {Firebase}
     */
    push: function(value, onComplete) {
        const ref = this._ref.push(value, onComplete);
        return new Firebase(ref);
    },

    /**
     * @method Firebase#ref
     * @return {firebase}
     */
    ref: function() {
        return this._ref;
    },

    /**
     * @method Firebase#remove
     * @param {function=} onComplete
     */
    remove: function(onComplete) {
        this._ref.remove(onComplete);
    },

    /**
     * @method Firebase#set
     * @param {*} value
     * @param {function=} onComplete
     */
    set: function(value, onComplete) {
        this._ref.set(value, onComplete);
    },

    /**
     * @method Firebase#transaction
     * @param {function} updateFunction
     * @param {function=} onComplete
     * @param {boolean=} applyLocally
     */
    transaction: function(updateFunction, onComplete, applyLocally) {
        this._ref.transaction(updateFunction, onComplete, applyLocally);
    },

    /**
     * @return {*}
     */
    unauth: function() {
        return this._ref.unauth();
    },

    /**
     * @method Firebase#update
     * @param {Object} value
     * @param {function=} onComplete
     */
    update: function(value, onComplete) {
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
 */
Firebase.unauth = function() {
    return (new Firebase([]))
        .unauth();
};


//-------------------------------------------------------------------------------
// Exports
//-------------------------------------------------------------------------------

export default Firebase;
