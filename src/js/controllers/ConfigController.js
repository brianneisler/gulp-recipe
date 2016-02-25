//-------------------------------------------------------------------------------
// Imports
//-------------------------------------------------------------------------------

import {
    Class,
    Config,
    Map,
    Obj,
    Promises,
    Proxy,
    StringUtil,
    Throwables,
    TypeUtil
} from 'bugcore';
import path from 'path';
import {
    ContextController
} from './';
import {
    RecipeConfig,
    RecipeConfigChain
} from '../config';
import _ from 'lodash';


//-------------------------------------------------------------------------------
// Declare Class
//-------------------------------------------------------------------------------

/**
 * @class
 * @extends {Obj}
 */
const ConfigController = Class.extend(Obj, {

    _name: 'recipe.ConfigController',


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
         * @type {Config}
         */
        this.configOverride         = new Config();

        /**
         * @private
         * @type {Map.<RecipeContext, ConfigChain>}
         */
        this.contextToConfigChainMap = new Map();
    },


    //-------------------------------------------------------------------------------
    // Getters and Setters
    //-------------------------------------------------------------------------------

    /**
     * @return {Map.<RecipeContext, ConfigChain>}
     */
    getContextToConfigChainMap() {
        return this.contextToConfigChainMap;
    },


    //-------------------------------------------------------------------------------
    // Public Methods
    //-------------------------------------------------------------------------------

    /**
     * @param {RecipeContext} context
     * @return {ConfigChain}
     */
    getConfigChain(context) {
        return this.contextToConfigChainMap.get(context);
    },

    /**
     * @param {string} key
     * @return {*}
     */
    getProperty(key) {
        const context = ContextController.getCurrentRecipeContext();
        const configChain = this.getConfigChain(context);
        if (!configChain) {
            throw Throwables.exception('ConfigNotLoaded', {}, 'Must first load the config before getProperty can be called');
        }
        return configChain.getProperty(key);
    },

    /**
     * @return {Promise<RecipeConfigChain>}
     */
    loadConfigChain() {
        const context = ContextController.getCurrentRecipeContext();
        const configChain = this.getConfigChain(context);
        if (!configChain) {
            return this.buildConfigChainForContext(context)
                .then((returnedConfigChain) => {
                    this.contextToConfigChainMap.put(context, returnedConfigChain);
                    return returnedConfigChain;
                });
        }
        return Promises.resolve(configChain);
    },

    /**
     * @param {string} key
     * @return {{deleted: boolean, exists: boolean, key: *, value: *}}
     */
    async deleteConfigProperty(key) {
        const configChain = await this.loadConfigChain();
        const result = {
            deleted: false,
            exists: false,
            key: key,
            value: undefined
        };
        const config = configChain.getTargetConfig();
        result.exists = config.getExists();
        if (config.hasProperty(key)) {
            result.value = config.getProperty(key);
            result.deleted = config.deleteProperty(key);
            if (result.deleted) {
                await config.saveToFile();
            }
        }
        return result;
    },

    /**
     * @param {string} key
     * @return {*}
     */
    async getConfigProperty(key) {
        const configChain = await this.loadConfigChain();
        return configChain.getProperty(key);
    },

    /**
     * @param {string} key
     * @param {*} value
     */
    async setConfigProperty(key, value) {
        const configChain   = await this.loadConfigChain();
        const config        = configChain.getTargetConfig();
        config.setProperty(key, value);
        await config.saveToFile();
    },

    /**
     * @param {string} key
     * @return {*}
     */
    getConfigOverride(key) {
        return this.configOverride.getProperty(key);
    },

    /**
     * @param {string} key
     * @param {*} value
     */
    setConfigOverride(key, value) {
        return this.configOverride.setProperty(key, value);
    },

    /**
     * @param {Object} propertiesObject
     */
    updateConfigOverrides(propertiesObject) {
        return this.configOverride.updateProperties(propertiesObject);
    },


    //-------------------------------------------------------------------------------
    // Private Methods
    //-------------------------------------------------------------------------------

    /**
     * @private
     * @param {RecipeContext} context
     * @param {string} target
     * @return {boolean}
     */
    belowTarget(context, target) {
        return ConfigController.TARGET_WEIGHT[context.getTarget()] < ConfigController.TARGET_WEIGHT[target];
    },

    /**
     * @private
     * @param {RecipeContext} context
     * @return {RecipeConfigChain}
     */
    async buildConfigChainForContext(context) {
        const execPath      = context.getExecPath();
        const modulePath    = context.getModulePath();
        const userPath      = context.getUserPath();

        const configs = await Promises.props({
            builtIn: RecipeConfig.loadFromFile(path.resolve(modulePath, 'resources', ConfigController.CONFIG_FILE_NAME), this.getConfigDefaults()),
            global: '',
            project: this.belowTarget(context, 'project') ? null : RecipeConfig.loadFromFile(path.resolve(execPath, ConfigController.CONFIG_FILE_NAME)),
            user: this.belowTarget(context, 'user') ? null : RecipeConfig.loadFromFile(path.resolve(userPath, ConfigController.CONFIG_FILE_NAME)),
            override: this.configOverride
        });
        const chain = new RecipeConfigChain(configs, context.getTarget());
        configs.global = this.belowTarget(context, 'global') ? null : RecipeConfig.loadFromFile(path.resolve(chain.getProperty('prefix'), ConfigController.CONFIG_FILE_NAME));
        await Promises.props(configs);
        return new RecipeConfigChain(configs, context.getTarget());
    },

    /**
     * @private
     * @return {Object}
     */
    getConfigDefaults() {
        return _.reduce(ConfigController.BUILT_IN_DEFAULTS, (result, value, key) => {
            return _.assign(result, {
                [key]: TypeUtil.isString(value) ? this.replaceTokens(value, { home: this.getHomeDir() }) : value
            });
        }, {});
    },

    /**
     * @private
     * @return {string}
     */
    getHomeDir() {
        return process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE;
    },

    /**
     * @private
     * @param {string} string
     * @param {Object} valueMap
     * @return {string}
     */
    replaceTokens(string, valueMap) {
        const matches = string.match(/\{([a-zA-Z0-9_-]+)\}/g);
        return _.reduce(matches, (result, match) => {
            const key = match.substr(1, match.length - 2);
            const value = !TypeUtil.isUndefined(valueMap[key]) ? valueMap[key] : '';
            return StringUtil.replaceAll(result, match, value);
        }, string);
    }
});


//-------------------------------------------------------------------------------
// Static Properties
//-------------------------------------------------------------------------------

/**
 * @static
 * @type {{debug: boolean, firebaseUrl: string, prefix: string, serverUrl: string}}
 */
ConfigController.BUILT_IN_DEFAULTS  = {
    cache: '{home}/.recipe',
    debug: false,
    firebaseUrl: 'https://gulp-recipe.firebaseio.com',
    prefix: '/usr/local',
    serverUrl: 'https://gulprecipe.com'
};

/**
 * @static
 * @const {string}
 */
ConfigController.CONFIG_FILE_NAME   = '.reciperc';

/**
 * @static
 * @type {{global: number, user: number, project: number}}
 */
ConfigController.TARGET_WEIGHT = {
    'global': 0,
    'user': 1,
    'project': 2
};


//-------------------------------------------------------------------------------
// Private Static Properties
//-------------------------------------------------------------------------------

/**
 * @static
 * @private
 * @type {ConfigController}
 */
ConfigController.instance           = null;


//-------------------------------------------------------------------------------
// Static Methods
//-------------------------------------------------------------------------------

/**
 * @static
 * @return {ConfigController}
 */
ConfigController.getInstance = function() {
    if (ConfigController.instance === null) {
        ConfigController.instance = new ConfigController();
    }
    return ConfigController.instance;
};


//-------------------------------------------------------------------------------
// Static Proxy
//-------------------------------------------------------------------------------

Proxy.proxy(ConfigController, Proxy.method(ConfigController.getInstance), [
    'getConfigChain',
    'getProperty',
    'loadConfigChain',
    'deleteConfigProperty',
    'getConfigProperty',
    'setConfigProperty',
    'getConfigOverride',
    'setConfigOverride',
    'updateConfigOverrides'
]);


//-------------------------------------------------------------------------------
// Exports
//-------------------------------------------------------------------------------

export default ConfigController;
