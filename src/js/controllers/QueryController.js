//-------------------------------------------------------------------------------
// Imports
//-------------------------------------------------------------------------------

import {
    Class,
    Map,
    Obj,
    Proxy
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
     * @return {QueryResultData}
     */
    async query(recipeQuery) {
        const currentUser = await AuthController.getCurrentUser();
        const recipeQueryStore = this.generateRecipeQueryStore(currentUser);
        return await recipeQueryStore.query(recipeQuery);
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
