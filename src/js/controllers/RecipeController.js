//-------------------------------------------------------------------------------
// Imports
//-------------------------------------------------------------------------------

import {
    Class,
    Map,
    Obj,
    Promises,
    Proxy,
    Throwables,
    TypeUtil
} from 'bugcore';
import _ from 'lodash';
import crypto from 'crypto';
import fs from 'fs-promise';
import fse from 'fs-extra';
import ignore from 'ignore';
import path from 'path';
import stream from 'stream';
import tar from 'tar-fs';
import zlib from 'zlib';
import RecipeFile from '../core/RecipeFile';
import RecipePackage from '../core/RecipePackage';
import RecipeVersion from '../firebase/RecipeVersion';


//-------------------------------------------------------------------------------
// Declare Class
//-------------------------------------------------------------------------------

/**
 * @class
 * @extends {Obj}
 */
const RecipeController = Class.extend(Obj, {

    _name: 'recipe.RecipeController',


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
         * @type {Map.<string, RecipeFile>}
         */
        this.recipeFileCache = new Map();
    },


    //-------------------------------------------------------------------------------
    // Public Methods
    //-------------------------------------------------------------------------------

    /**
     * @param {string} recipePath
     * @return {Promise<RecipeFile>}
     */
    loadRecipeFile: function(recipePath) {
        const recipeFilePath = path.resolve(recipePath, RecipeController.RECIPE_FILE_NAME);
        const recipeFile = this.recipeFileCache.get(recipeFilePath);
        if (!recipeFile) {
            return RecipeFile.loadFromFile(recipeFilePath)
                .then((loadedRecipeFile) => {
                    this.recipeFileCache.put(recipeFilePath, loadedRecipeFile);
                    return loadedRecipeFile;
                });
        }
        return Promises.resolve(recipeFile);
    },

    /**
     * @param {RecipeFile} recipeFile
     * @return {Promise<RecipePackage>}
     */
    packageRecipe: function(recipeFile) {
        const recipePath = path.dirname(recipeFile.getFilePath());
        return this.findPackagePaths(recipePath)
            .then((packagePaths) => {
                return this.doPackageRecipe(recipeFile, packagePaths);
            });
    },


    unpackageRecipe: function(packagePath) {

    },

    /**
     * @param {RecipeFile} recipeFile
     * @return {Promise<RecipeFile>}
     */
    validateNewRecipe: function(recipeFile) {
        return Promises.try(() => {
            this.validateRecipe(recipeFile);
            return RecipeVersion.get(recipeFile.getName(), recipeFile.getVersion())
                .then((snapshot) => {
                    if (snapshot.exists()) {
                        throw Throwables.exception('RecipeVersionExists', {}, 'Recipe ' + recipeFile.getName() + '@' + recipeFile.getVersion() + ' has already been published');
                    }
                    return recipeFile;
                });
        });
    },

    /**
     * @param {RecipeFile} recipeFile
     */
    validateRecipe: function(recipeFile) {
        this.validateRecipeName(recipeFile.getName());
        this.validateRecipeVersion(recipeFile.getVersion());
    },


    //-------------------------------------------------------------------------------
    // Private Methods
    //-------------------------------------------------------------------------------

    /**
     * @private
     * @param {RecipeFile} recipeFile
     * @param {Array.<string>} packagePaths
     * @return {Promise<RecipePackage>}
     */
    doPackageRecipe: function(recipeFile, packagePaths) {
        const recipePath = path.dirname(recipeFile.getFilePath());
        return Promises.try(() => {
            return _.map(packagePaths, (packagePath) => {
                return path.relative(recipePath, packagePath);
            });
        }).then((relativePackagePaths) => {
            return Promises.promise((resolve, reject) => {
                const gzip = zlib.createGzip();
                const hash = crypto.createHash('sha1');
                hash.setEncoding('hex');
                const recipeStream = tar.pack(recipePath, {
                    entries: relativePackagePaths
                });
                const pass = new stream.PassThrough();
                let caughtError = null;
                const gzipStream = recipeStream.pipe(gzip);
                gzipStream
                    .on('error', (error) => {
                        caughtError = error;
                    })
                    .on('end', () => {
                        if (caughtError) {
                            return reject(caughtError);
                        }
                        hash.end();
                        return resolve(new RecipePackage(recipeFile, pass, hash.read()));
                    });
                gzipStream.pipe(hash);
                gzipStream.pipe(pass);
            });
        });
    },

    /**
     * @private
     * @param {string} recipePath
     * @return {Promise.<Array<string>>}
     */
    findPackagePaths: function(recipePath) {
        return Promises.all([
            this.loadIgnores(recipePath),
            this.walkRecipePath(recipePath)
        ]).then((results) => {
            const [ignores, recipePaths] = results;
            return ignore()
                .addPattern(ignores)
                .filter(recipePaths);
        });
    },

    /**
     * @private
     * @param {string} recipePath
     * @return {Promise<Array<string>>}
     */
    loadIgnores: function(recipePath) {
        return fs.readFile(path.resolve(recipePath, RecipeController.IGNORE_FILE_NAME), 'utf8')
            .then((data) => {
                return data.split('\n');
            })
            .catch((error) => {
                if (error.code !== 'ENOENT') {
                    throw error;
                }
                return [];
            })
            .then((ignores) => {
                return ignores.concat(RecipeController.DEFAULT_IGNORES);
            });
    },

    /**
     * @private
     * @param {string} recipePath
     * @return {Promise<Array<string>>}
     */
    walkRecipePath: function(recipePath) {
        return Promises.promise((resolve, reject) => {
            const items = [];
            fse.walk(recipePath)
                .on('data', (item) => {
                    if (item.path !== recipePath) {
                        items.push(item.path);
                    }
                })
                .on('error', function (err, item) {
                    console.log(err.message);
                    console.log('error reading ', item.path);
                })
                .on('end', () => {
                    resolve(items);
                });
        });
    },


    /**
     * @private
     * @param {string} recipeName
     */
    validateRecipeName: function(recipeName) {
        if (!TypeUtil.isString(recipeName)) {
            throw Throwables.exception('RecipeInvalid', {}, 'Recipe name must be a string');
        }
        if (!(/^[a-z]+(?:[a-z0-9-][a-z0-9]+)*$/).test(recipeName)) {
            throw Throwables.exception('RecipeInvalid', {}, 'Recipe name must be lower case letters, numbers or dashes and must start with a letter');
        }
    },

    /**
     * @private
     * @param {string} recipeVersion
     */
    validateRecipeVersion: function(recipeVersion) {
        if (!TypeUtil.isString(recipeVersion)) {
            throw Throwables.exception('RecipeInvalid', {}, 'Recipe version must be a string');
        }
        if (!(/^[0-9]\.[0-9]\.[0-9]$/).test(recipeVersion)) {
            throw Throwables.exception('RecipeInvalid', {}, 'Recipe version must of of the format [number].[number].[number]');
        }
    }
});


//-------------------------------------------------------------------------------
// Private Static Properties
//-------------------------------------------------------------------------------

/**
 * @static
 * @private
 * @type {RecipeController}
 */
RecipeController.instance        = null;

/**
 * @static
 * @enum {string}
 */
RecipeController.IGNORE_FILE_NAME = '.recipeignore';

/**
 * @static
 * @enum {string}
 */
RecipeController.RECIPE_FILE_NAME = 'recipe.json';

/**
 * @static
 * @private
 * @type {Array.<string>}
 */
RecipeController.DEFAULT_IGNORES = [
    '.*.swp',
    '._*',
    '.DS_Store',
    '.git',
    '.hg',
    '.npmrc',
    '.lock-wscript',
    '.svn',
    '.wafpickle-*',
    'config.gypi',
    'CVS',
    'npm-debug.log',
    'node_modules',
    'recipes'
];


//-------------------------------------------------------------------------------
// Static Methods
//-------------------------------------------------------------------------------

/**
 * @static
 * @return {RecipeController}
 */
RecipeController.getInstance = function() {
    if (RecipeController.instance === null) {
        RecipeController.instance = new RecipeController();
    }
    return RecipeController.instance;
};


//-------------------------------------------------------------------------------
// Static Proxy
//-------------------------------------------------------------------------------

Proxy.proxy(RecipeController, Proxy.method(RecipeController.getInstance), [
    'loadRecipeFile',
    'packageRecipe',
    'validateNewRecipe',
    'validateRecipe'
]);


//-------------------------------------------------------------------------------
// Exports
//-------------------------------------------------------------------------------

export default RecipeController;
