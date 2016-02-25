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
     * @return {QueryResultData}
     */
    async query(recipeQuery) {
        let queryResultData = this.recipeQueryCache.get(recipeQuery);
        if (!queryResultData) {
            queryResultData = await this.doQuery(recipeQuery);
            this.recipeQueryCache.set(recipeQuery, queryResultData);
        }
        return queryResultData;
    },


    //-------------------------------------------------------------------------------
    // Private Methods
    //-------------------------------------------------------------------------------

    /**
     * @private
     * @param {string} recipeQuery
     * @return {QueryResultData}
     */
    async doQuery(recipeQuery) {
        const recipeQueryData = this.parseRecipeQuery(recipeQuery);
        const recipeVersionsInfoEntity = await this.loadRecipeVersionsInfoEntity(recipeQueryData.name);
        if (!recipeVersionsInfoEntity) {
            throw Throwables.exception('RecipeDoesNotExist', {}, 'A recipe by the name "' + recipeQueryData.name + '" does not exist.');
        }
        const versionNumber = this.resolveRecipeVersionNumber(recipeQueryData, recipeVersionsInfoEntity);
        if (!versionNumber) {
            throw Throwables.exception('NoVersionMatch', {}, 'Cannot find a version match for "' + recipeQuery + '"');
        }
        return new QueryResultData({
            name: recipeQueryData.name,
            scope: recipeQueryData.scope,
            type: recipeQueryData.type,
            versionNumber
        });
    },

    /**
     * @private
     * @param {string} recipeName
     * @return {RecipeVersionsInfoEntity}
     */
    async loadRecipeVersionsInfoEntity(recipeName) {
        return await RecipeVersionsInfoManager.get({
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
     *      scope: string,
     *      type: string,
     *      versionQuery: string
     * }}
     */
    parseRecipeQuery(recipeQuery) {
        if (recipeQuery.indexOf('@') > -1) {
            const parts = recipeQuery.split('@');
            return {
                name: parts[0],
                scope: 'public',
                type: 'gulp',
                versionQuery: parts[1]
            };
        }
        return {
            scope: 'public',
            type: 'gulp',
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
