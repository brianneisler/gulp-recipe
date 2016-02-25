//-------------------------------------------------------------------------------
// Imports
//-------------------------------------------------------------------------------

import {
    Class,
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
    _constructor() {

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
    async run(options) {
        try {
            options = this.refineTargetOption(options, 'user');
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

            const result = await this.prompt(schema);
            await this.doLogin(result.email, result.password, options);
            console.log('Success! Thanks for logging in.');
        } catch(error) {
            console.log('Login failed.');
            console.log(error);
            throw error;
        }
    },


    //-------------------------------------------------------------------------------
    // Private Methods
    //-------------------------------------------------------------------------------

    /**
     * @private
     * @param {string} email
     * @param {string} password
     * @param {{}} options
     */
    async doLogin(email, password, options) {
        try {
            await GulpRecipe.login(email, password, options);
        } catch(error) {
            //TODO BRN: Handle recoverable login errors
            console.log(error);
            throw error;
        }
    }
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
