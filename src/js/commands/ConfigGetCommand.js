//-------------------------------------------------------------------------------
// Imports
//-------------------------------------------------------------------------------

import {
    Class,
    Promises,
    Proxy
} from 'bugcore';
import Command from './Command';
import ConfigController from '../controllers/ConfigController';


//-------------------------------------------------------------------------------
// Declare Class
//-------------------------------------------------------------------------------

/**
 * @class
 * @extends {Command}
 */
const ConfigGetCommand = Class.extend(Command, {

    _name: 'recipe.ConfigGetCommand',


    //-------------------------------------------------------------------------------
    // Public Methods
    //-------------------------------------------------------------------------------

    /**
     * @param {string} key
     * @param {{
     *  global: boolean,
     *  project: boolean,
     *  user: boolean,
     *  bool: boolean,
     *  int: boolean
     * }} options
     * @return {Promise}
     */
    run: function(key, options) {
        return Promises.try(() => {
            let target = '';
            if (options.global) {
                target = 'global';
            }
            if (options.user) {
                target = 'user';
            }
            if (options.project) {
                target = 'project';
            }
            return ConfigController.getConfigProperty(key, target);
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
 * @type {ConfigGetCommand}
 */
ConfigGetCommand.instance        = null;


//-------------------------------------------------------------------------------
// Static Methods
//-------------------------------------------------------------------------------

/**
 * @static
 * @return {ConfigGetCommand}
 */
ConfigGetCommand.getInstance = function() {
    if (ConfigGetCommand.instance === null) {
        ConfigGetCommand.instance = new ConfigGetCommand();
    }
    return ConfigGetCommand.instance;
};


//-------------------------------------------------------------------------------
// Static Proxy
//-------------------------------------------------------------------------------

Proxy.proxy(ConfigGetCommand, Proxy.method(ConfigGetCommand.getInstance), [
    'run'
]);


//-------------------------------------------------------------------------------
// Exports
//-------------------------------------------------------------------------------

export default ConfigGetCommand;
