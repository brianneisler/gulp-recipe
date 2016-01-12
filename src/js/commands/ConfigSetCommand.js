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
const ConfigSetCommand = Class.extend(Command, {

    _name: 'recipe.ConfigSetCommand',


    //-------------------------------------------------------------------------------
    // Public Methods
    //-------------------------------------------------------------------------------

    /**
     * @param {string} key
     * @param {string} value
     * @param {{
     *  global: boolean,
     *  project: boolean,
     *  user: boolean,
     *  bool: boolean,
     *  int: boolean
     * }} options
     * @return {Promise}
     */
    run: function(key, value, options) {
        return Promises.try(() => {
            const targets = [];
            if (options.global) {
                targets.push('global');
            }
            if (options.user) {
                targets.push('user');
            }
            if (options.project || targets.length === 0) {
                targets.push('project');
            }
            if (options.bool) {
                if (value === 'false') {
                    value = false;
                } else {
                    value = !!value;
                }
            }
            if (options.int) {
                value = parseInt(value);
            }
            return ConfigController.setConfigProperty(key, value, targets);
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
 * @type {ConfigSetCommand}
 */
ConfigSetCommand.instance        = null;


//-------------------------------------------------------------------------------
// Static Methods
//-------------------------------------------------------------------------------

/**
 * @static
 * @return {ConfigSetCommand}
 */
ConfigSetCommand.getInstance = function() {
    if (ConfigSetCommand.instance === null) {
        ConfigSetCommand.instance = new ConfigSetCommand();
    }
    return ConfigSetCommand.instance;
};


//-------------------------------------------------------------------------------
// Static Proxy
//-------------------------------------------------------------------------------

Proxy.proxy(ConfigSetCommand, Proxy.method(ConfigSetCommand.getInstance), [
    'run'
]);


//-------------------------------------------------------------------------------
// Exports
//-------------------------------------------------------------------------------

export default ConfigSetCommand;
