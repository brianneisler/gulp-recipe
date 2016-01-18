//-------------------------------------------------------------------------------
// Imports
//-------------------------------------------------------------------------------

import {
    Class,
    Promises,
    Proxy
} from 'bugcore';
import Command from './Command';
import GulpRecipe from '../GulpRecipe';


//-------------------------------------------------------------------------------
// Declare Class
//-------------------------------------------------------------------------------

/**
 * @class
 * @extends {Command}
 */
const LoginCommand = Class.extend(Command, {

    _name: 'recipe.LoginCommand',


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
     *      global: ?boolean,
     *      project: ?boolean,
     *      user: ?boolean
     * }} options
     * @return {Promise}
     */
    run: function(options) {
        return Promises.try(() => {
            options = this.refineTargetOption(options, 'user');
            console.log('options:', options);
            const schema = {
                properties: {
                    email: {
                        description: 'Please enter your email',
                        required: true
                    },
                    password: {
                        description: 'Please enter your password',
                        hidden: true,
                        required: true
                    }
                }
            };

            return this.prompt(schema)
                .then((result) => {
                    return GulpRecipe.login(result.email, result.password, options)
                        .catch((error) => {
                            //TODO BRN: Handle recoverable login errors
                            throw error;
                        });
                })
                .then(() => {
                    console.log('Success! Thanks for logging in.');
                })
                .catch((error) => {
                    console.log('Login failed.');
                    console.log(error);
                    throw error;
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
 * @type {LoginCommand}
 */
LoginCommand.instance        = null;


//-------------------------------------------------------------------------------
// Static Methods
//-------------------------------------------------------------------------------

/**
 * @static
 * @return {LoginCommand}
 */
LoginCommand.getInstance = function() {
    if (LoginCommand.instance === null) {
        LoginCommand.instance = new LoginCommand();
    }
    return LoginCommand.instance;
};


//-------------------------------------------------------------------------------
// Static Proxy
//-------------------------------------------------------------------------------

Proxy.proxy(LoginCommand, Proxy.method(LoginCommand.getInstance), [
    'run'
]);


//-------------------------------------------------------------------------------
// Exports
//-------------------------------------------------------------------------------

export default LoginCommand;
