//-------------------------------------------------------------------------------
// Imports
//-------------------------------------------------------------------------------

import {
    Class,
    Obj,
    Promises
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


//-------------------------------------------------------------------------------
// Declare Class
//-------------------------------------------------------------------------------

/**
 * @class
 * @extends {Obj}
 */
const RecipePackage = Class.extend(Obj, {

    _name: 'recipe.RecipePackage',


    //-------------------------------------------------------------------------------
    // Constructor
    //-------------------------------------------------------------------------------

    /**
     * @constructs
     * @param {Buffer} recipeStream
     * @param {string} recipeHash
     */
    _constructor(recipeStream, recipeHash) {

        this._super();


        //-------------------------------------------------------------------------------
        // Public Properties
        //-------------------------------------------------------------------------------

        /**
         * @private
         * @type {string}
         */
        this.recipeHash     = recipeHash;

        /**
         * @private
         * @type {Buffer}
         */
        this.recipeStream   = recipeStream;
    },


    //-------------------------------------------------------------------------------
    // Getters and Setters
    //-------------------------------------------------------------------------------

    /**
     * @return {string}
     */
    getRecipeHash() {
        return this.recipeHash;
    },

    /**
     * @return {Buffer}
     */
    getRecipeStream() {
        return this.recipeStream;
    },


    //-------------------------------------------------------------------------------
    // Public Methods
    //-------------------------------------------------------------------------------

    /**
     * @param {Stream} nextStream
     */
    pipe(nextStream) {
        const pass = new stream.PassThrough();
        this.recipeStream.pipe(nextStream);
        this.recipeStream.pipe(pass);
        this.recipeStream = pass;
    },

    /**
     * @param {string} outputPath
     * @return {Promise}
     */
    saveToFile(outputPath) {
        return fs.ensureFile(outputPath)
            .then(() => {
                return Promises.promise((resolve, reject) => {
                    let caughtError = null;
                    const ws = fs.createWriteStream(outputPath);
                    const pass = new stream.PassThrough();
                    this.recipeStream.pipe(ws)
                        .on('error', (error) => {
                            caughtError = error;
                        })
                        .on('finish', () => {
                            if (caughtError) {
                                return reject(caughtError);
                            }
                            this.recipeStream = pass;
                            return resolve();
                        });
                    this.recipeStream.pipe(pass);
                });
            });
    }
});


//-------------------------------------------------------------------------------
// Static Properties
//-------------------------------------------------------------------------------

/**
 * @static
 * @type {Array.<string>}
 */
RecipePackage.DEFAULT_IGNORES = [
    '.*.swp',
    '._*',
    '.DS_Store',
    '.git',
    '.hg',
    '.npmrc',
    '.reciperc',
    '.lock-wscript',
    '.svn',
    '.wafpickle-*',
    'config.gypi',
    'CVS',
    'npm-debug.log',
    'node_modules',
    'recipes'
];

/**
 * @static
 * @enum {string}
 */
RecipePackage.IGNORE_FILE_NAME = '.recipeignore';


//-------------------------------------------------------------------------------
// Static Methods
//-------------------------------------------------------------------------------

/**
 * @static
 * @param {string} recipePath
 * @return {Promise<RecipePackage>}
 */
RecipePackage.fromPath = function(recipePath) {
    return this.findPackagePaths(recipePath)
        .then((packagePaths) => {
            const relativePackagePaths = _.map(packagePaths, (packagePath) => {
                return path.relative(recipePath, packagePath);
            });
            const gzip = zlib.createGzip();
            const packageStream = tar.pack(recipePath, {
                entries: relativePackagePaths
            });
            return packageStream.pipe(gzip);
        })
        .then((recipeStream) => {
            return RecipePackage.fromStream(recipeStream);
        });
};

/**
 * @static
 * @param {Stream} recipeStream
 * @return {Promise<RecipePackage>}
 */
RecipePackage.fromStream = function(recipeStream) {
    return RecipePackage.hashRecipeStream(recipeStream)
        .then((results) => {
            const [newRecipeStream, recipeHash] = results;
            return new RecipePackage(newRecipeStream, recipeHash);
        });
};

//-------------------------------------------------------------------------------
// Private Static Methods
//-------------------------------------------------------------------------------

/**
 * @private
 * @static
 * @param {string} recipePath
 * @return {Promise.<Array<string>>}
 */
RecipePackage.findPackagePaths = function(recipePath) {
    return RecipePackage.walkRecipePath(recipePath)
        .then((recipePaths) => {
            const ignoreFilePath = path.resolve(recipePath, RecipePackage.IGNORE_FILE_NAME);
            const ignoreFile = ignore.select([ignoreFilePath]);
            return ignore()
                .addIgnoreFile(ignoreFile)
                .addPattern(RecipePackage.DEFAULT_IGNORES)
                .filter(recipePaths);
        });
};

/**
 * @private
 * @static
 * @param {Stream} recipeStream
 * @return {Promise.<Stream, string>}
 */
RecipePackage.hashRecipeStream = function(recipeStream) {
    return Promises.promise((resolve, reject) => {
        const hash = crypto.createHash('sha1');
        hash.setEncoding('hex');
        const duplicateStream = new stream.PassThrough();
        let caughtError = null;
        recipeStream
            .on('error', (error) => {
                console.log('error:', error);
                caughtError = error;
            })
            .on('end', () => {
                if (caughtError) {
                    return reject(caughtError);
                }
                hash.end();
                return resolve([duplicateStream, hash.read()]);
            });
        recipeStream.pipe(hash);
        recipeStream.pipe(duplicateStream);
    });
};

/**
 * @private
 * @static
 * @param {string} recipePath
 * @return {Promise<Array<string>>}
 */
RecipePackage.walkRecipePath = function(recipePath) {
    return Promises.promise((resolve) => {
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
};


//-------------------------------------------------------------------------------
// Exports
//-------------------------------------------------------------------------------

export default RecipePackage;
