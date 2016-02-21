//-------------------------------------------------------------------------------
// Imports
//-------------------------------------------------------------------------------

import {
    Class,
    Map,
    Obj,
    Promises,
    Proxy,
    Throwables
} from 'bugcore';
import {
    ConfigController,
    ContextController
} from './';
import { Firebase } from '../util';


//-------------------------------------------------------------------------------
// Declare Class
//-------------------------------------------------------------------------------

/**
 * @class
 * @extends {Obj}
 */
const QueryController = Class.extend(Obj, {

    _name: 'recipe.QueryController',


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
         * @type {Map.<RecipeContext, RecipeQueryCache>}
         */
        this.contextToRecipeQueryCacheMap = new Map();
    },


    //-------------------------------------------------------------------------------
    // Getters and Setters
    //-------------------------------------------------------------------------------

    /**
     * @return {Map.<RecipeContext, RecipeQueryCache>}
     */
    getContextToRecipeQueryCacheMap() {
        return this.contextToRecipeQueryCacheMap;
    },


    //-------------------------------------------------------------------------------
    // Public Methods
    //-------------------------------------------------------------------------------

    /**
     * @param {string} recipeQuery
     * @return {Promise<QueryResultData>}
     */
    query(recipeQuery) {
        //- transfrom recipeQuery in to exact recipeName@recipeVersion result
        //--
        return this.getCurrentUser()
            .then((currentUser) => {
                return this.authWithToken(currentUser.getAuthData().getToken());
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
 * @type {QueryController}
 */
QueryController.instance        = null;


//-------------------------------------------------------------------------------
// Static Methods
//-------------------------------------------------------------------------------

/**
 * @static
 * @return {QueryController}
 */
QueryController.getInstance = function() {
    if (QueryController.instance === null) {
        QueryController.instance = new QueryController();
    }
    return QueryController.instance;
};


//-------------------------------------------------------------------------------
// Static Proxy
//-------------------------------------------------------------------------------

Proxy.proxy(QueryController, Proxy.method(QueryController.getInstance), [
    'auth',
    'login',
    'getCurrentUser',
    'logout',
    'signUp'
]);


//-------------------------------------------------------------------------------
// Exports
//-------------------------------------------------------------------------------

export default QueryController;
