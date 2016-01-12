//-------------------------------------------------------------------------------
// Imports
//-------------------------------------------------------------------------------

import {
    Class,
    Obj,
    Promise,
    Proxy
} from 'bugcore';
import prompt from 'prompt';
import AuthController from '../controllers/AuthController';


//-------------------------------------------------------------------------------
// Declare Class
//-------------------------------------------------------------------------------

/**
 * @class
 * @extends {Obj}
 */
const SignupCommand = Class.extend(Obj, {

    _name: 'recipe.SignupCommand',


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
     * @param {{
     *      global: boolean?,
     *      project: boolean?
     * }} options
     * @return {Promise}
     */
    run: function(options) {
        return new Promise((resolve, reject) => {
            const schema = {
                properties: {
                    username: {
                        pattern: /^[a-z]+(?:[a-z0-9-][a-z0-9]+)*$/,
                        description: 'Please choose a username',
                        message: 'username must start with a lowercase be only letters, numbers or dashes and must start with a letter.',
                        required: true
                    },
                    email: {
                        description: 'Please enter your email',
                        required: true
                    },
                    password: {
                        description: 'Please choose a password',
                        hidden: true,
                        required: true
                    }
                }
            };

            prompt.start();
            prompt.get(schema, function(error, result) {
                if (error) {
                    return reject(error);
                }
                AuthController
                    .signUp(result.username, result.email, result.password)
                    .then((user, authData) => {
                        // TODO BRN: Save current auth token to config
                        // if global save global, if local save local, if both save both, if none save global
                    })
                    .then(() => {
                        resolve();
                    })
                    .catch(function(error) {
                        console.log(error);
                        if (error.code === 'EMAIL_TAKEN') {
                            //TODO BRN: Handle this...
                        } else {
                            reject(error);
                        }
                    });
            });
        });
    }


    //-------------------------------------------------------------------------------
    // Private Methods
    //-------------------------------------------------------------------------------

});


//-------------------------------------------------------------------------------
// Private Static Properties
//-------------------------------------------------------------------------------

/**
 * @static
 * @private
 * @type {SignupCommand}
 */
SignupCommand.instance        = null;


//-------------------------------------------------------------------------------
// Static Methods
//-------------------------------------------------------------------------------

/**
 * @static
 * @return {SignupCommand}
 */
SignupCommand.getInstance = function() {
    if (SignupCommand.instance === null) {
        SignupCommand.instance = new SignupCommand();
    }
    return SignupCommand.instance;
};


//-------------------------------------------------------------------------------
// Static Proxy
//-------------------------------------------------------------------------------

Proxy.proxy(SignupCommand, Proxy.method(SignupCommand.getInstance), [
    'run'
]);


//-------------------------------------------------------------------------------
// Exports
//-------------------------------------------------------------------------------

export default SignupCommand;
