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
const ConfigDeleteCommand = Class.extend(Command, {

    _name: 'gulprecipe.ConfigDeleteCommand',


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
    async run(key, options) {
        try {
            options = this.refineTargetOption(options, 'project');
            const results = await GulpRecipe.configDelete(key, options);
            results.forEach((result) => {
                if (!result.exists) {
                    console.log('config: no config found for context "' + result.context + '"');
                    return;
                }
                if (result.deleted) {
                    console.log('config: value deleted for key:\'' + result.key + '\' value:\'' + result.value + '\'');
                } else {
                    console.log('config: no value found for key:\'' + result.key + '\'');
                }
            });
        } catch(error) {
            console.log('Config delete failed');
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
 * @type {ConfigDeleteCommand}
 */
ConfigDeleteCommand.instance        = null;


//-------------------------------------------------------------------------------
// Static Methods
//-------------------------------------------------------------------------------

/**
 * @static
 * @return {ConfigDeleteCommand}
 */
ConfigDeleteCommand.getInstance = function() {
    if (ConfigDeleteCommand.instance === null) {
        ConfigDeleteCommand.instance = new ConfigDeleteCommand();
    }
    return ConfigDeleteCommand.instance;
};


//-------------------------------------------------------------------------------
// Static Proxy
//-------------------------------------------------------------------------------

Proxy.proxy(ConfigDeleteCommand, Proxy.method(ConfigDeleteCommand.getInstance), [
    'run'
]);


//-------------------------------------------------------------------------------
// Exports
//-------------------------------------------------------------------------------

export default ConfigDeleteCommand;
