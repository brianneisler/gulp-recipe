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
const PublishCommand = Class.extend(Command, {

    _name: 'recipe.PublishCommand',


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
     * @param {string} recipePath
     * @param {{
     *      global: ?boolean,
     *      project: ?boolean,
     *      user: ?boolean
     * }} options
     * @return {Promise}
     */
    async run(recipePath, options) {
        try {
            options = this.refineTargetOption(options, 'project');
            const publishKeyData = await GulpRecipe.publish(recipePath, options);
            console.log('Recipe published ' + publishKeyData.getRecipeName() + '@' + publishKeyData.getRecipeVersionNumber());
        } catch(error) {
            console.log('Publish failed.');
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
 * @type {PublishCommand}
 */
PublishCommand.instance        = null;


//-------------------------------------------------------------------------------
// Static Methods
//-------------------------------------------------------------------------------

/**
 * @static
 * @return {PublishCommand}
 */
PublishCommand.getInstance = function() {
    if (PublishCommand.instance === null) {
        PublishCommand.instance = new PublishCommand();
    }
    return PublishCommand.instance;
};


//-------------------------------------------------------------------------------
// Static Proxy
//-------------------------------------------------------------------------------

Proxy.proxy(PublishCommand, Proxy.method(PublishCommand.getInstance), [
    'run'
]);


//-------------------------------------------------------------------------------
// Exports
//-------------------------------------------------------------------------------

export default PublishCommand;
