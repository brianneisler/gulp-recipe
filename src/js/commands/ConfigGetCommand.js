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
     *  user: boolean
     * }} options
     * @return {Promise}
     */
    run(key, options) {
        return Promises.try(() => {
            options = this.refineTargetOption(options, 'project');
            return GulpRecipe.configGet(key, options)
                .then((returnedValue) => {
                    if (returnedValue !== undefined) {
                        console.log('config - key:\'' + key + '\' value:' + '\'' + returnedValue + '\'');
                    } else {
                        console.log('No config value found for key \'' + key + '\'');
                    }
                })
                .catch((error) => {
                    console.log('Config get failed');
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
