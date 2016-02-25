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
const LogoutCommand = Class.extend(Command, {

    _name: 'recipe.LogoutCommand',


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
            await GulpRecipe.logout(options);
            console.log('You are now logged out.');
        } catch(error) {
            console.log('Logout failed.');
            console.log(error);
            console.log(error.stack);
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
 * @type {LogoutCommand}
 */
LogoutCommand.instance        = null;


//-------------------------------------------------------------------------------
// Static Methods
//-------------------------------------------------------------------------------

/**
 * @static
 * @return {LogoutCommand}
 */
LogoutCommand.getInstance = function() {
    if (LogoutCommand.instance === null) {
        LogoutCommand.instance = new LogoutCommand();
    }
    return LogoutCommand.instance;
};


//-------------------------------------------------------------------------------
// Static Proxy
//-------------------------------------------------------------------------------

Proxy.proxy(LogoutCommand, Proxy.method(LogoutCommand.getInstance), [
    'run'
]);


//-------------------------------------------------------------------------------
// Exports
//-------------------------------------------------------------------------------

export default LogoutCommand;
