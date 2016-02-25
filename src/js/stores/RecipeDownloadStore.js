//-------------------------------------------------------------------------------
// Imports
//-------------------------------------------------------------------------------

import {
    Class,
    Obj,
    Throwables
} from 'bugcore';
import { RecipeDownloadCache } from '../caches';
import { RecipeDownload, RecipePackage } from '../core';
import fs from 'fs-promise';
import path from 'path';


//-------------------------------------------------------------------------------
// Declare Class
//-------------------------------------------------------------------------------

/**
 * @class
 * @extends {Obj}
 */
const RecipeDownloadStore = Class.extend(Obj, {

    _name: 'recipe.RecipeDownloadStore',


    //-------------------------------------------------------------------------------
    // Constructor
    //-------------------------------------------------------------------------------

    /**
     * @constructs
     * @param {string} cacheDir
     */
    _constructor(cacheDir) {

        this._super();


        //-------------------------------------------------------------------------------
        // Private Properties
        //-------------------------------------------------------------------------------

        //TODO BRN: Add watchers for when recipeDownloads change. On change, delete cache entry (or reload file and update cache)

        /**
         * @private
         * @type {string}
         */
        this.cacheDir                   = cacheDir;

        /**
         * @private
         * @type {RecipeDownloadCache}
         */
        this.recipeDownloadCache        = new RecipeDownloadCache();
    },


    //-------------------------------------------------------------------------------
    // Getters and Setters
    //-------------------------------------------------------------------------------

    /**
     * @return {string}
     */
    getCacheDir() {
        return this.cacheDir;
    },

    /**
     * @return {RecipeDownloadCache}
     */
    getRecipeDownloadCache() {
        return this.recipeDownloadCache;
    },


    //-------------------------------------------------------------------------------
    // Public Methods
    //-------------------------------------------------------------------------------

    /**
     * @param {string} recipeUrl
     * @return {RecipeDownload}
     */
    async download(recipeUrl) {
        let recipeDownload = this.recipeDownloadCache.get(recipeUrl);
        if (!recipeDownload) {
            recipeDownload = await this.loadFromRecipeCacheDir(recipeUrl);
            if (!recipeDownload) {
                recipeDownload = this.downloadRecipe(recipeUrl);
            }
            this.recipeDownloadCache.set(recipeUrl, recipeDownload);
        }
        return recipeDownload;
    },


    //-------------------------------------------------------------------------------
    // Private Methods
    //-------------------------------------------------------------------------------

    /**
     * @private
     * @param {string} recipeUrl
     * @returns {RecipeDownload}
     */
    async downloadRecipe(recipeUrl) {
        const cacheFilePath     = this.makeCachePath(recipeUrl);
        const recipePackage     = await RecipePackage.fromUrl(recipeUrl);
        await recipePackage.saveToFile(cacheFilePath);
        return new RecipeDownload(recipeUrl, recipePackage);
    },

    /**
     * @private
     * @param {string} recipeUrl
     * @return {RecipeDownload}
     */
    async loadFromRecipeCacheDir(recipeUrl) {
        const cacheFilePath     = this.makeCachePath(recipeUrl);
        try {
            await this.validateCacheFilePath(cacheFilePath);
            const recipePackage = await RecipePackage.fromTarball(cacheFilePath);
            return new RecipeDownload(recipeUrl, recipePackage);
        } catch(throwable) {
            if (throwable.code !== 'ENOENT') {
                throw throwable;
            }
        }
    },

    /**
     * @private
     * @param {string} recipeUrl
     * @return {string}
     */
    makeCachePath(recipeUrl) {
        return path.resolve(this.cacheDir, recipeUrl
            .replace(/^(http(s)?):\/\//, ''));

    },

    /**
     * @private
     * @param {string} cacheFilePath
     */
    async validateCacheFilePath(cacheFilePath) {
        const stats     = await fs.stat(cacheFilePath);
        if (!stats.isFile()) {
            throw Throwables.exception('CacheNotAFile', {}, 'The cache file path "' + cacheFilePath + '" is not a file');
        }
    }
});


//-------------------------------------------------------------------------------
// Exports
//-------------------------------------------------------------------------------

export default RecipeDownloadStore;
