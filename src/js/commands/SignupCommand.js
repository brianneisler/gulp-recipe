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
const SignupCommand = Class.extend(Command, {

    _name: 'recipe.SignupCommand',


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
    run(options) {
        return Promises.try(() => {
            try {
                options = this.refineTargetOption(options, 'user');
            } catch(error) {
                console.log(error);
                console.log(error.stack);
            }
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
            return this.prompt(schema)
                .then((result) => {
                    return GulpRecipe
                        .signUp(result.username, result.email, result.password, options)
                        .catch((error) => {
                            console.log(error);
                            if (error.code === 'EMAIL_TAKEN') {
                                //TODO BRN: Handle this...
                            } else {
                                throw error;
                            }
                        });
                })
                .then(() => {
                    console.log('Success! Thanks for signing up.');
                })
                .catch((error) => {
                    console.log('Signup failed.');
                    console.log(error);
                    console.log(error.stack);
                    throw error;
                });
        });
    }
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
