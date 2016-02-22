//-------------------------------------------------------------------------------
// Imports
//-------------------------------------------------------------------------------

import {
    Class,
    DataUtil,
    Obj,
    Promises,
    Throwables
} from 'bugcore';
import semver from 'semver';
import { RecipeQueryCache } from '../caches';
import { QueryResultData } from '../data';
import {
    RecipeVersionsInfoManager
} from '../managers';


//-------------------------------------------------------------------------------
// Declare Class
//-------------------------------------------------------------------------------

/**
 * @class
 * @extends {Obj}
 */
const RecipeQueryStore = Class.extend(Obj, {

    _name: 'recipe.RecipeQueryStore',


    //-------------------------------------------------------------------------------
    // Constructor
    //-------------------------------------------------------------------------------

    /**
     * @constructs
     */
    _constructor() {

        this._super();


        //-------------------------------------------------------------------------------
        // Private Properties
        //-------------------------------------------------------------------------------

        //TODO BRN: Add watchers for when recipeQuerys change. On change, delete cache entry (or reload file and update cache)
        /**
         * @private
         * @type {RecipeQueryCache}
         */
        this.recipeQueryCache        = new RecipeQueryCache();
    },


    //-------------------------------------------------------------------------------
    // Getters and Setters
    //-------------------------------------------------------------------------------

    /**
     * @return {RecipeQueryCache}
     */
    getRecipeQueryCache() {
        return this.recipeQueryCache;
    },


    //-------------------------------------------------------------------------------
    // Public Methods
    //-------------------------------------------------------------------------------

    /**
     * @param {string} recipeQuery
     * @return {Promise<QueryResultData>}
     */
    query(recipeQuery) {
        const queryResultData = this.recipeQueryCache.get(recipeQuery);
        if (!queryResultData) {
            return this.doQuery(recipeQuery)
                .then((newQueryResultData) => {
                    this.recipeQueryCache.set(recipeQuery, newQueryResultData);
                    return newQueryResultData;
                });
        }
        return Promises.resolve(queryResultData);
    },


    //-------------------------------------------------------------------------------
    // Private Methods
    //-------------------------------------------------------------------------------

    /**
     * @private
     * @param {string} recipeQuery
     * @returns {Promise.<QueryResultData>}
     */
    doQuery(recipeQuery) {
        return Promises.try(() => {
            const recipeQueryData = this.parseRecipeQuery(recipeQuery);
            return this.loadRecipeVersionsInfoEntity(recipeQueryData.name)
                .then((recipeVersionsInfoEntity) => {
                    if (!recipeVersionsInfoEntity) {
                        throw Throwables.exception('RecipeDoesNotExist', {}, 'A recipe by the name "' + recipeQueryData.name + '" does not exist.');
                    }
                    return [recipeQueryData, recipeVersionsInfoEntity];
                });
        }).then((results) => {
            const [recipeQueryData, recipeVersionsInfoEntity] = results;
            const versionNumber = this.resolveRecipeVersionNumber(recipeQueryData, recipeVersionsInfoEntity);
            console.log('recipeQueryData.name:', recipeQueryData.name, ' versionNumber:', versionNumber);

            if (!versionNumber) {
                throw Throwables.exception('NoVersionMatch', {}, 'Cannot find a version match for "' + recipeQuery + '"');
            }
            return new QueryResultData({
                name: recipeQueryData.name,
                versionNumber
            });
        });
    },

    /**
     * @private
     * @param {string} recipeName
     * @return {Promise<RecipeVersionsInfoEntity>}
     */
    loadRecipeVersionsInfoEntity(recipeName) {
        return RecipeVersionsInfoManager.get({
            recipeName,
            recipeScope: 'public',
            recipeType: 'gulp'
        });
    },

    /**
     * @private
     * @param {string} recipeQuery
     * @return {{
     *      name: string,
     *      versionQuery: string
     * }}
     */
    parseRecipeQuery(recipeQuery) {
        if (recipeQuery.indexOf('@') > -1) {
            const parts = recipeQuery.split('@');
            return {
                name: parts[0],
                versionQuery: parts[1]
            };
        }
        return {
            name: recipeQuery,
            versionQuery: ''
        };
    },

    /**
     * @private
     * @param {RecipeVersionsInfoEntity} recipeVersionsInfoEntity
     * @return {string}
     */
    resolveLastPublishedRecipe(recipeVersionsInfoEntity) {
        return recipeVersionsInfoEntity.getLast();
    },

    /**
     * @private
     * @param {{
     *      name: string,
     *      versionQuery: string
     * }} recipeQueryData
     * @param {RecipeVersionsInfoEntity} recipeVersionsInfoEntity
     * @return {string}
     */
    resolveRecipeVersionNumber(recipeQueryData, recipeVersionsInfoEntity) {
        if (recipeQueryData.versionQuery) {
            return this.resolveRecipeVersionQuery(recipeQueryData.versionQuery, recipeVersionsInfoEntity);
        }
        return this.resolveLastPublishedRecipe(recipeVersionsInfoEntity);
    },

    /**
     * @private
     * @param {string} versionQuery
     * @param {RecipeVersionsInfoEntity} recipeVersionsInfoEntity
     * @return {string}
     */
    resolveRecipeVersionQuery(versionQuery, recipeVersionsInfoEntity) {
        const allVersions = DataUtil.map(recipeVersionsInfoEntity.getAll() || {}, version => version);
        return semver.maxSatisfying(allVersions, versionQuery);
    }
});


//-------------------------------------------------------------------------------
// Exports
//-------------------------------------------------------------------------------

export default RecipeQueryStore;
