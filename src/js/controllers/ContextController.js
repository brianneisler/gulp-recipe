//-------------------------------------------------------------------------------
// Imports
//-------------------------------------------------------------------------------

import {
    Class,
    Obj,
    Proxy,
    Throwables
} from 'bugcore';
import {
    RecipeContext,
    UserContext
} from '../context';


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
    _constructor() {

        this._super();


        //-------------------------------------------------------------------------------
        // Public Properties
        //-------------------------------------------------------------------------------

        /**
         * @private
         * @type {RecipeContext}
         */
        this.currentRecipeContext   = null;

        /**
         * @private
         * @type {UserContext}
         */
        this.currentUserContext     = null;
    },


    //-------------------------------------------------------------------------------
    // Public Methods
    //-------------------------------------------------------------------------------

    /**
     * @return {RecipeContext}
     */
    getCurrentRecipeContext() {
        if (!this.currentRecipeContext) {
            throw Throwables.exception('NoCurrentContext', {}, 'Must first establishRecipeContext before getting current context');
        }
        return this.currentRecipeContext;
    },

    /**
     * @return {UserContext}
     */
    getCurrentUserContext() {
        if (!this.currentUserContext) {
            throw Throwables.exception('NoCurrentContext', {}, 'Must first establishUserContext before getting current context');
        }
        return this.currentUserContext;
    },

    /**
     * @param {{
     *      execPath: string=,
     *      target: string=
     * }=} options
     * @return {RecipeContext}
     */
    establishRecipeContext(options) {
        if (!this.currentRecipeContext) {
            this.currentRecipeContext = new RecipeContext(options);
        } else {
            const newContext = new RecipeContext(options);
            if (!Obj.equals(newContext, this.currentRecipeContext)) {
                this.currentRecipeContext = newContext;
            }
        }
        return this.currentRecipeContext;
    },

    /**
     * @param {{
     *      userId: string=
     * }=} options
     * @return {UserContext}
     */
    establishUserContext(options) {
        if (!this.currentUserContext) {
            this.currentUserContext = new UserContext(options);
        } else {
            const newContext = new UserContext(options);
            if (!Obj.equals(newContext, this.currentUserContext)) {
                this.currentUserContext = newContext;
            }
        }
        return this.currentUserContext;
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
    'getCurrentRecipeContext',
    'getCurrentUserContext',
    'establishRecipeContext',
    'establishUserContext'
]);


//-------------------------------------------------------------------------------
// Exports
//-------------------------------------------------------------------------------

export default ContextController;
