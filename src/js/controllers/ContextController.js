//-------------------------------------------------------------------------------
// Imports
//-------------------------------------------------------------------------------

import {
    Class,
    Obj,
    Proxy,
    Throwables
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
    // Constructor
    //-------------------------------------------------------------------------------

    /**
     * @constructs
     */
    _constructor: function() {

        this._super();


        //-------------------------------------------------------------------------------
        // Public Properties
        //-------------------------------------------------------------------------------

        /**
         * @private
         * @type {RecipeContext}
         */
        this.currentContext = null;
    },


    //-------------------------------------------------------------------------------
    // Public Methods
    //-------------------------------------------------------------------------------

    /**
     * @return {RecipeContext}
     */
    getCurrentContext: function() {
        if (!this.currentContext) {
            throw Throwables.exception('NoCurrentContext', {}, 'Must first establishContext before getting current context');
        }
        return this.currentContext;
    },

    /**
     * @param {{
     *      execPath: string=,
     *      target: string=
     * }=} options
     * @return {RecipeContext}
     */
    establishContext: function(options) {
        if (!this.currentContext) {
            this.currentContext = new RecipeContext(options);
        } else {
            const newContext = new RecipeContext(options);
            if (!Obj.equals(newContext, this.currentContext)) {
                this.currentContext = newContext;
            }
        }
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
    'getCurrentContext',
    'establishContext'
]);


//-------------------------------------------------------------------------------
// Exports
//-------------------------------------------------------------------------------

export default ContextController;
