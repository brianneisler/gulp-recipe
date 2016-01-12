//-------------------------------------------------------------------------------
// Imports
//-------------------------------------------------------------------------------

import {
    Class,
    Obj,
    Proxy
} from 'bugcore';
import RecipeContext from '../context/RecipeContext';


//-------------------------------------------------------------------------------
// Declare Class
//-------------------------------------------------------------------------------

/**
 * @class
 * @extends {Obj}
 */
const ContextController = Class.extend(Obj, {

    _name: 'recipe.ContextController',


    //-------------------------------------------------------------------------------
    // Public Methods
    //-------------------------------------------------------------------------------

    /**
     * @param {string=} execPath
     * @return {RecipeContext}
     */
    generateContext: function(execPath) {
        return new RecipeContext(execPath);
    }
});


//-------------------------------------------------------------------------------
// Private Static Properties
//-------------------------------------------------------------------------------

/**
 * @static
 * @private
 * @type {ContextController}
 */
ContextController.instance        = null;


//-------------------------------------------------------------------------------
// Static Methods
//-------------------------------------------------------------------------------

/**
 * @static
 * @return {ContextController}
 */
ContextController.getInstance = function() {
    if (ContextController.instance === null) {
        ContextController.instance = new ContextController();
    }
    return ContextController.instance;
};


//-------------------------------------------------------------------------------
// Static Proxy
//-------------------------------------------------------------------------------

Proxy.proxy(ContextController, Proxy.method(ContextController.getInstance), [
    'generateContext'
]);


//-------------------------------------------------------------------------------
// Exports
//-------------------------------------------------------------------------------

export default ContextController;
