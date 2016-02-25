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
    async run(key, value, options) {
        try {
            options = this.refineTargetOption(options, 'project');
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
            await GulpRecipe.configSet(key, value, options);
            console.log('Config value set');
        } catch(error) {
            console.log('Config set failed');
            console.log(error);
            throw error;
        }
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
