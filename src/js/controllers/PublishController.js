//-------------------------------------------------------------------------------
// Imports
//-------------------------------------------------------------------------------

import {
    Class,
    Obj,
    Proxy,
    Throwables
} from 'bugcore';
import AuthController from './AuthController';
import RecipeController from './RecipeController';


//-------------------------------------------------------------------------------
// Declare Class
//-------------------------------------------------------------------------------

/**
 * @class
 * @extends {Obj}
 */
const PublishController = Class.extend(Obj, {

    _name: 'recipe.PublishController',


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


    },


    //-------------------------------------------------------------------------------
    // Public Methods
    //-------------------------------------------------------------------------------

    /**
     * @param {string} recipePath
     * @return {Promise}
     */
    publishRecipe: function(recipePath) {
        return AuthController.auth()
            .then(() => {
                return RecipeController.loadRecipeFile(recipePath);
            })
            .then((recipeFile) => {
                return RecipeController.validateNewRecipe(recipeFile);
            })
            .then((recipeFile) => {
                return RecipeController.packageRecipe(recipeFile);
            })
            .then((recipePackage) => {

            });

        // TODO
        // Ensure recipe entry exists in firebase
        // - if not, add recipe and add currentUser as recipe collaborator
        // Create new recipeVersion with published flag equal to false
        // Generate publish key for recipe version
        // - has recipeName
        // - has recipeVersionNumber
        // - has tarball hash
        // Upload recipe tarball to recipe server using publish key and tarball hash

        //TODO RecipeServer
        // retrieve recipeVersion based on publish key
        // validate tarball hash
        // validate recipe name
        // validate recipe version
        // validate recipeVersion has not already been published
        // name of file is [recipeName]-[recipeVersion].tgz
        // upload tarball to S3 at path [S3]/[recipeName]/[recipeVersion]/[recipeName]-[recipeVersion].tgz
        //
    }
});


//-------------------------------------------------------------------------------
// Private Static Properties
//-------------------------------------------------------------------------------

/**
 * @static
 * @private
 * @type {PublishController}
 */
PublishController.instance        = null;


//-------------------------------------------------------------------------------
// Static Methods
//-------------------------------------------------------------------------------

/**
 * @static
 * @return {PublishController}
 */
PublishController.getInstance = function() {
    if (PublishController.instance === null) {
        PublishController.instance = new PublishController();
    }
    return PublishController.instance;
};


//-------------------------------------------------------------------------------
// Static Proxy
//-------------------------------------------------------------------------------

Proxy.proxy(PublishController, Proxy.method(PublishController.getInstance), [
    'publishRecipe'
]);


//-------------------------------------------------------------------------------
// Exports
//-------------------------------------------------------------------------------

export default PublishController;
