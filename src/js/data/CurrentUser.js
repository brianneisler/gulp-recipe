//-------------------------------------------------------------------------------
// Imports
//-------------------------------------------------------------------------------

import {
    Class,
    IJsonable,
    IObjectable,
    Obj
} from 'bugcore';


//-------------------------------------------------------------------------------
// Declare Class
//-------------------------------------------------------------------------------

/**
 * @class
 * @extends {Obj}
 */
const CurrentUser = Class.extend(Obj, {

    _name: 'recipe.CurrentUser',


    //-------------------------------------------------------------------------------
    // Constructor
    //-------------------------------------------------------------------------------

    /**
     * @constructs
     * @param {UserData} userData
     * @param {AuthData} authData
     */
    _constructor: function(userData, authData) {

        this._super();


        //-------------------------------------------------------------------------------
        // Public Properties
        //-------------------------------------------------------------------------------

        /**
         * @private
         * @type {AuthData}
         */
        this.authData = authData;

        /**
         * @private
         * @type {UserData}
         */
        this.userData = userData;
    },


    //-------------------------------------------------------------------------------
    // Getters and Setters
    //-------------------------------------------------------------------------------

    /**
     * @return {AuthData}
     */
    getAuthData: function() {
        return this.authData;
    },

    /**
     * @return {UserData}
     */
    getUserData: function() {
        return this.userData;
    },


    //-------------------------------------------------------------------------------
    // IObjectable Implementation
    //-------------------------------------------------------------------------------

    /**
     * @return {Object}
     */
    toObject: function() {
        return {
            auth: this.authData.toObject(),
            user: this.userData.toObject()
        };
    },


    //-------------------------------------------------------------------------------
    // IJsonable Implementation
    //-------------------------------------------------------------------------------

    /**
     * @return {string}
     */
    toJson: function() {
        return JSON.stringify(this.toObject());
    }
});


//-------------------------------------------------------------------------------
// Interfaces
//-------------------------------------------------------------------------------

Class.implement(CurrentUser, IJsonable);
Class.implement(CurrentUser, IObjectable);


//-------------------------------------------------------------------------------
// Exports
//-------------------------------------------------------------------------------

export default CurrentUser;
