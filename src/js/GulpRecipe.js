//-------------------------------------------------------------------------------
// Imports
//-------------------------------------------------------------------------------

import {
    ArgUtil,
    Class,
    Obj,
    Proxy
} from 'bugcore';
import path from 'path';
import {
    DEFAULT_PACK_SCOPE,
    PACK_CLASS,
    PACK_TYPE
} from './defines';
import { BitPack } from 'bitpack';
import { RecipeStore } from './stores';


//-------------------------------------------------------------------------------
// Declare Class
//-------------------------------------------------------------------------------

/**
 * @class
 * @extends {Obj}
 */
const GulpRecipe = Class.extend(Obj, {

    _name: 'gulprecipe.GulpRecipe',


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
         * @type {string}
         */
        this.bitPack        = new BitPack(PACK_TYPE);

        /**
         * @private
         * @type {RecipeStore}
         */
        this.recipeStore    = new RecipeStore();
    },


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
        return this.bitPack.configure(configObject);
    },

    /**
     * @param {string} key
     * @param {{
     *      target: string=
     * }=} options
     * @return {{deleted: boolean, exists: boolean, key: *, value: *}}
     */
    async configDelete(key, options) {
        return await this.bitPack.configDelete(key, options);
    },

    /**
     * @param {string} key
     * @param {{
     *      target: string=
     * }=} options
     * @return {*}
     */
    async configGet(key, options) {
        return await this.bitPack.configGet(key, options);
    },

    /**
     * @param {string} key
     * @param {*} value
     * @param {{
     *      target: string=
     * }=} options
     */
    async configSet(key, value, options) {
        return await this.bitPack.configSet(key, value, options);
    },

    /**
     * @param {string} recipeQuery
     * @param {{
     *      target: string=
     * }=} options
     * @return {Recipe}
     */
    async get(recipeQuery, options) {
        const pack = await this.bitPack.get(PACK_TYPE, PACK_CLASS, DEFAULT_PACK_SCOPE, recipeQuery, options);
        return this.recipeStore.generateRecipe(pack);
    },

    /**
     * @param {string} recipeQuery
     * @param {{
     *      target: string=
     * }=} options
     * @return {Recipe}
     */
    async install(recipeQuery, options) {
        const pack = await this.bitPack.install(PACK_TYPE, PACK_CLASS, DEFAULT_PACK_SCOPE, recipeQuery, options);
        return this.recipeStore.generateRecipe(pack);
    },

    /**
     * @param {string} email
     * @param {string} password
     * @param {{
     *      target: string=
     * }=} options
     */
    async login(email, password, options) {
        return await this.bitPack.login(email, password, options);
    },

    /**
     * @param {{
     *      target: string=
     * }=} options
     * @return {CurrentUser}
     */
    async logout(options) {
        return await this.bitPack.logout(options);
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
     * @return {PublishKeyEntity}
     */
    async publish(recipePath, options) {
        return this.bitPack.publish(PACK_TYPE, PACK_CLASS, DEFAULT_PACK_SCOPE, recipePath, options);
    },

    /**
     * @param {string} username
     * @param {string} email
     * @param {string} password
     * @param {{
     *      target: string=
     * }=} options
     * @return {CurrentUser}
     */
    async signUp(username, email, password, options) {
        return this.bitPack.signUp(uusername, email, password, options);
    }
});


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
