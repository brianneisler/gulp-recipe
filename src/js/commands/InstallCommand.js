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
const InstallCommand = Class.extend(Command, {

    _name: 'gulprecipe.InstallCommand',


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
    // Public Methods
    //-------------------------------------------------------------------------------

    /**
     * @param {string} recipeQuery
     * @param {{
     *      global: ?boolean,
     *      project: ?boolean,
     *      user: ?boolean
     * }} options
     * @return {Promise}
     */
    async run(recipeQuery, options) {
        try {
            options = this.refineTargetOption(options, 'project');
            const installedRecipe = await GulpRecipe.install(recipeQuery, options);
            console.log(installedRecipe.getScope() + ' ' + installedRecipe.getType() +  ' recipe installed ' + installedRecipe.getName() + '@' + installedRecipe.getVersion());
        } catch(error) {
            console.log('Install failed.');
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
 * @type {InstallCommand}
 */
InstallCommand.instance        = null;


//-------------------------------------------------------------------------------
// Static Methods
//-------------------------------------------------------------------------------

/**
 * @static
 * @return {InstallCommand}
 */
InstallCommand.getInstance = function() {
    if (InstallCommand.instance === null) {
        InstallCommand.instance = new InstallCommand();
    }
    return InstallCommand.instance;
};


//-------------------------------------------------------------------------------
// Static Proxy
//-------------------------------------------------------------------------------

Proxy.proxy(InstallCommand, Proxy.method(InstallCommand.getInstance), [
    'run'
]);


//-------------------------------------------------------------------------------
// Exports
//-------------------------------------------------------------------------------

export default InstallCommand;
