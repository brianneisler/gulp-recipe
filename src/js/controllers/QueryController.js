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
    AuthController
} from './';
import {
    RecipeQueryStore
} from '../stores';


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
         * @type {Map.<CurrentUser, RecipeQueryStore>}
         */
        this.currentUserToRecipeQueryStoreMap = new Map();
    },


    //-------------------------------------------------------------------------------
    // Getters and Setters
    //-------------------------------------------------------------------------------

    /**
     * @return {Map.<CurrentUser, RecipeQueryStore>}
     */
    getCurrentUserToRecipeQueryStoreMap() {
        return this.currentUserToRecipeQueryStoreMap;
    },


    //-------------------------------------------------------------------------------
    // Public Methods
    //-------------------------------------------------------------------------------

    /**
     * @param {string} recipeQuery
     * @return {Promise<QueryResultData>}
     */
    query(recipeQuery) {
        return Promises.try(() => {
            return AuthController.getCurrentUser();
        }).then((currentUser) => {
            const recipeQueryStore = this.generateRecipeQueryStore(currentUser);
            return recipeQueryStore.query(recipeQuery);
        });
    },


    //-------------------------------------------------------------------------------
    // Private Methods
    //-------------------------------------------------------------------------------

    /**
     * @private
     * @param {CurrentUser} currentUser
     * @return {RecipeQueryStore}
     */
    generateRecipeQueryStore(currentUser) {
        let recipeQueryStore    = this.currentUserToRecipeQueryStoreMap.get(currentUser);
        if (!recipeQueryStore) {
            recipeQueryStore        = new RecipeQueryStore();
            this.currentUserToRecipeQueryStoreMap.put(currentUser, recipeQueryStore);
        }
        return recipeQueryStore;
    }
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
    'query'
]);


//-------------------------------------------------------------------------------
// Exports
//-------------------------------------------------------------------------------

export default QueryController;
