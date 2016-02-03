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
    Throwables
} from 'bugcore';
import path from 'path';
import ContextController from './ContextController';
import RecipeConfig from '../config/RecipeConfig';
import RecipeConfigChain from '../config/RecipeConfigChain';


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
        const context = ContextController.getCurrentContext();
        const configChain = this.getConfigChain(context);
        if (!configChain) {
            throw Throwables.exception('ConfigNotLoaded', {}, 'Must first load the config before getProperty can be called');
        }
        return configChain.getProperty(key);
    },

    /**
     * @return {Promise}
     */
    loadConfigChain() {
        const context = ContextController.getCurrentContext();
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
     * @return {Promise}
     */
    deleteConfigProperty(key) {
        return this.loadConfigChain()
            .then((configChain) => {
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
                        return config.saveToFile()
                            .then(() => {
                                return result;
                            });
                    }
                    return Promises.resolve(result);
                }
                return Promises.resolve(result);
            });
    },

    /**
     * @param {string} key
     * @return {Promise}
     */
    getConfigProperty(key) {
        return this.loadConfigChain()
            .then((configChain) => {
                return configChain.getProperty(key);
            });
    },

    /**
     * @param {string} key
     * @param {*} value
     * @return {Promise}
     */
    setConfigProperty(key, value) {
        return this.loadConfigChain()
            .then((configChain) => {
                const config = configChain.getTargetConfig();
                config.setProperty(key, value);
                return config.saveToFile();
            });
    },

    /**
     * @param {string} key
     * @returns {*}
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


    //-------------------------------------------------------------------------------
    // Private Methods
    //-------------------------------------------------------------------------------

    /**
     * @private
     * @param {RecipeContext} context
     * @param {string} target
     * @returns {boolean}
     */
    belowTarget(context, target) {
        return ConfigController.TARGET_WEIGHT[context.getTarget()] < ConfigController.TARGET_WEIGHT[target];
    },

    /**
     * @private
     * @param {RecipeContext} context
     * @return {Promise}
     */
    buildConfigChainForContext(context) {
        const execPath      = context.getExecPath();
        const modulePath    = context.getModulePath();
        const userPath      = context.getUserPath();
        return Promises.props({
            builtIn: RecipeConfig.loadFromFile(modulePath + path.sep + 'config' + path.sep + ConfigController.CONFIG_FILE_NAME),
            global: '',
            project: this.belowTarget(context, 'project') ? null : RecipeConfig.loadFromFile(execPath + path.sep + ConfigController.CONFIG_FILE_NAME),
            user: this.belowTarget(context, 'user') ? null : RecipeConfig.loadFromFile(userPath + path.sep + ConfigController.CONFIG_FILE_NAME),
            override: this.configOverride
        }).then((configs) => {
            const chain = new RecipeConfigChain(configs, context.getTarget());
            configs.global = this.belowTarget(context, 'global ') ? null : RecipeConfig.loadFromFile(chain.getProperty('prefix') + path.sep + ConfigController.CONFIG_FILE_NAME);
            return Promises.props(configs);
        }).then((configs) => {
            return new RecipeConfigChain(configs, context.getTarget());
        });
    }
});


//-------------------------------------------------------------------------------
// Static Properties
//-------------------------------------------------------------------------------

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
    'setConfigOverride'
]);


//-------------------------------------------------------------------------------
// Exports
//-------------------------------------------------------------------------------

export default ConfigController;
