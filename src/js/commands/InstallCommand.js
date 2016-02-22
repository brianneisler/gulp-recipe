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
const InstallCommand = Class.extend(Command, {

    _name: 'recipe.InstallCommand',


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
    run(recipeQuery, options) {
        return Promises.try(() => {
            options = this.refineTargetOption(options, 'project');
            return GulpRecipe.install(recipeQuery, options)
                .then((recipeInstall) => {
                    console.log('Recipe installed ' + recipeInstall.name + '@' + recipeInstall.version);
                })
                .catch((error) => {
                    console.log('Install failed.');
                    console.log(error);
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
