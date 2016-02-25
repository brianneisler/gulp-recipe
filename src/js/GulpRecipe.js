//-------------------------------------------------------------------------------
// Imports
//-------------------------------------------------------------------------------

import {
    ArgUtil,
    Class,
    Obj,
    ObjectBuilder,
    Proxy,
    Throwables,
    TypeUtil
} from 'bugcore';
import path from 'path';
import * as commands from './commands';
import * as config from './config';
import * as controllers from './controllers';
import * as core from './core';
import * as data from './data';
import * as entities from './entities';
import * as managers from './managers';
import * as util from './util';


//-------------------------------------------------------------------------------
// Simplify References
//-------------------------------------------------------------------------------

const {
    AuthController,
    ConfigController,
    ContextController,
    RecipeController
} = controllers;


//-------------------------------------------------------------------------------
// Declare Class
//-------------------------------------------------------------------------------

/**
 * @class
 * @extends {Obj}
 */
const GulpRecipe = Class.extend(Obj, {

    _name: 'recipe.GulpRecipe',


    //-------------------------------------------------------------------------------
    // Public Methods
    //-------------------------------------------------------------------------------

    /**
     * @param {{
     *      auth: {
     *          uid: string,
     *          token: string
     *      },
     *      prefix: string
     * }} configObject
     */
    configure(configObject) {
        if (TypeUtil.isObject(configObject)) {
            return ConfigController.updateConfigOverrides(configObject);
        }
        throw Throwables.illegalArgumentBug('configObject', configObject, 'must be an object');
    },

    /**
     * @param {string} key
     * @param {{
     *      target: string=
     * }=} options
     * @return {{deleted: boolean, exists: boolean, key: *, value: *}}
     */
    async configDelete(key, options) {
        options = this.defineOptions(options, {
            target: 'project'
        });
        await this.context(options);
        return await ConfigController.deleteConfigProperty(key);
    },

    /**
     * @param {string} key
     * @param {{
     *      target: string=
     * }=} options
     * @return {*}
     */
    async configGet(key, options) {
        options = this.defineOptions(options, {
            target: 'project'
        });
        await this.context(options);
        return await ConfigController.getConfigProperty(key);
    },

    /**
     * @param {string} key
     * @param {*} value
     * @param {{
     *      target: string=
     * }=} options
     * @return {Promise}
     */
    async configSet(key, value, options) {
        options = this.defineOptions(options, {
            target: 'project'
        });
        await this.context(options);
        await ConfigController.setConfigProperty(key, value);
    },

    /**
     * @param {{
     *      execPath: string=,
     *      target: string=
     * }=} options
     */
    async context(options) {
        ContextController.establishRecipeContext(options);
        await ConfigController.loadConfigChain();
        await AuthController.auth();
    },

    /**
     * @param {string} recipeQuery
     * @param {{
     *      target: string=
     * }=} options
     * @return {Recipe}
     */
    async get(recipeQuery, options) {
        options = this.defineOptions(options, {
            target: 'project'
        });
        await this.context(options);
        return await RecipeController.getRecipe(recipeQuery);
    },

    /**
     * @param {string} recipeQuery
     * @param {{
     *      target: string=
     * }=} options
     * @return {Recipe}
     */
    async install(recipeQuery, options) {
        options = this.defineOptions(options, {
            target: 'project'
        });
        await this.context(options);
        return await RecipeController.installRecipe(recipeQuery);
    },

    /**
     * @param {string} email
     * @param {string} password
     * @param {{
     *      target: string=
     * }=} options
     * @return {Promise}
     */
    async login(email, password, options) {
        options = this.defineOptions(options, {
            target: 'user'
        });
        await this.context(options);
        return await AuthController.login(email, password);
    },

    /**
     * @param {{
     *      target: string=
     * }=} options
     * @return {CurrentUser}
     */
    async logout(options) {
        options = this.defineOptions(options, {
            target: 'user'
        });
        await this.context(options);
        return await AuthController.logout();
    },

    /**
     * @param {string} recipeQuery
     * @return {function(function(Error), *...)}
     */
    make(recipeQuery) {
        const recipeArgs    = ArgUtil.toArray(arguments);
        recipeQuery         = recipeArgs.shift();
        return () => {
            const gulpArgs      = ArgUtil.toArray(arguments);
            return this.get(recipeQuery)
                .then((recipe) => {
                    return recipe.runRecipe(gulpArgs.concat(recipeArgs));
                });
        };
    },

    /**
     * @param {string} recipePath
     * @param {{
     *      target: string=
     * }=} options
     * @return {Promise}
     */
    publish(recipePath, options) {
        options = this.defineOptions(options, {
            target: 'project'
        });
        if (!recipePath) {
            recipePath = options.execPath;
        }
        recipePath = path.resolve(recipePath);
        return this.context(options)
            .then(() => {
                return RecipeController.publishRecipe(recipePath);
            });
    },

    /**
     * @param {string} username
     * @param {string} email
     * @param {string} password
     * @param {{
     *      target: string=
     * }=} options
     * @return {Promise}
     */
    async signUp(username, email, password, options) {
        options = this.defineOptions(options, {
            target: 'user'
        });
        await this.context(options);
        return await AuthController.signUp(username, email, password);
    },


    //-------------------------------------------------------------------------------
    // Private Methods
    //-------------------------------------------------------------------------------

    /**
     * @private
     * @param {{
     *      execPath: string=,
     *      target: string=
     * }=} options
     * @param {{
     *      execPath: string=,
     *      target: string=
     * }=} suppliedDefaults
     * @return {{
     *      execPath: string,
     *      target: string
     * }}
     */
    defineOptions(options, suppliedDefaults) {
        options             = options || {};
        suppliedDefaults    = suppliedDefaults || {};
        const defaults      = {
            execPath: process.cwd()
        };

        return ObjectBuilder
            .assign(defaults, suppliedDefaults, options)
            .build();
    }
});


//-------------------------------------------------------------------------------
// Public Static Properties
//-------------------------------------------------------------------------------

/**
 * @static
 * @type {*}
 */
GulpRecipe.commands     = commands;

/**
 * @static
 * @type {*}
 */
GulpRecipe.config       = config;

/**
 * @static
 * @type {*}
 */
GulpRecipe.controllers  = controllers;

/**
 * @static
 * @type {*}
 */
GulpRecipe.core         = core;

/**
 * @static
 * @type {*}
 */
GulpRecipe.data         = data;

/**
 * @static
 * @type {*}
 */
GulpRecipe.entities     = entities;

/**
 * @static
 * @type {*}
 */
GulpRecipe.managers     = managers;

/**
 * @static
 * @type {*}
 */
GulpRecipe.util         = util;


//-------------------------------------------------------------------------------
// Private Static Properties
//-------------------------------------------------------------------------------

/**
 * @static
 * @private
 * @type {GulpRecipe}
 */
GulpRecipe.instance     = null;


//-------------------------------------------------------------------------------
// Static Methods
//-------------------------------------------------------------------------------

/**
 * @static
 * @return {GulpRecipe}
 */
GulpRecipe.getInstance = function() {
    if (GulpRecipe.instance === null) {
        GulpRecipe.instance = new GulpRecipe();
    }
    return GulpRecipe.instance;
};


//-------------------------------------------------------------------------------
// Static Proxy
//-------------------------------------------------------------------------------

Proxy.proxy(GulpRecipe, Proxy.method(GulpRecipe.getInstance), [
    'configure',
    'configDelete',
    'configGet',
    'configSet',
    'context',
    'define',
    'install',
    'login',
    'logout',
    'make',
    'publish',
    'signUp'
]);


//-------------------------------------------------------------------------------
// Exports
//-------------------------------------------------------------------------------

export default GulpRecipe;
