//-------------------------------------------------------------------------------
// Imports
//-------------------------------------------------------------------------------

import {
    Class,
    Obj
} from 'bugcore';
import {
    RECIPE_DIR_NAME,
    RECIPE_FILE_NAME
} from '../defines';
import path from 'path';


//-------------------------------------------------------------------------------
// Declare Class
//-------------------------------------------------------------------------------

/**
 * @class
 * @extends {Obj}
 */
const PathUtil = Class.extend(Obj, {
    _name: 'recipe.PathUtil'
});


//-------------------------------------------------------------------------------
// Static Methods
//-------------------------------------------------------------------------------

/**
 * @static
 * @param {RecipeContext} recipeContext
 * @return {string}
 */
PathUtil.resolveRecipesDirFromContext = function(recipeContext) {
    return path.resolve(recipeContext.getExecPath(), RECIPE_DIR_NAME);
};

/**
 * @static
 * @param {string} recipePath
 * @return {string}
 */
PathUtil.resolveRecipeFileFromRecipePath = function(recipePath) {
    return path.resolve(recipePath, RECIPE_FILE_NAME);
};

/**
 * @param {string} recipesDir
 * @param {string} recipeType
 * @param {string} recipeScope
 * @param {string} recipeName
 * @param {string} recipeVersionNumber
 * @return {string}
 */
PathUtil.resolveRecipePath = function(recipesDir, recipeType, recipeScope, recipeName, recipeVersionNumber) {
    return path.resolve(recipesDir, recipeType, recipeScope, recipeName, recipeVersionNumber);
};

/**
 * @param {string} recipesDir
 * @param {string} recipeType
 * @param {string} recipeScope
 * @param {string} recipeName
 * @param {string} recipeVersionNumber
 * @return {string}
 */
PathUtil.resolveRecipeFilePath = function(recipesDir, recipeType, recipeScope, recipeName, recipeVersionNumber) {
    return PathUtil.resolveRecipeFileFromRecipePath(
        PathUtil.resolveRecipePath(recipesDir, recipeType, recipeScope, recipeName, recipeVersionNumber)
    );
};


//-------------------------------------------------------------------------------
// Exports
//-------------------------------------------------------------------------------

export default PathUtil;
