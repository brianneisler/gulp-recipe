//-------------------------------------------------------------------------------
// Imports
//-------------------------------------------------------------------------------

import {
    Class,
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
    _constructor: function() {

        this._super();


        //-------------------------------------------------------------------------------
        // Public Properties
        //-------------------------------------------------------------------------------

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
    getContextToConfigChainMap: function() {
        return this.contextToConfigChainMap;
    },


    //-------------------------------------------------------------------------------
    // Public Methods
    //-------------------------------------------------------------------------------

    /**
     * @return {Promise}
     */
    loadRecipeConfigChain: function() {
        const context       = ContextController.generateContext();
        const configChain   = this.contextToConfigChainMap.get(context);
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
     * @param {string} target
     * @return {Promise}
     */
    getConfigProperty: function(key, target) {
        return this.loadRecipeConfigChain()
            .then((configChain) => {
                if (!target) {
                    return configChain.getProperty(key);
                }
                var config = null;
                if (target === 'project') {
                    config = configChain.getProjectConfig();
                } else if (target === 'user') {
                    config = configChain.getUserConfig();
                } else if (target === 'global') {
                    config = configChain.getGlobalConfig();
                } else {
                    throw Throwables.exception('BadConfigTarget', {}, 'config target must be either "project", "user" or "global"');
                }
                return config.getProperty(key);
            });
    },

    /**
     * @param {string} key
     * @param {*} value
     * @param {Array.<string>} targets
     */
    setConfigProperty: function(key, value, targets) {
        return this.loadRecipeConfigChain()
            .then((configChain) => {
                console.log('made it here');
                const promises = [];
                if (!targets) {
                    targets = ['project'];
                }
                targets.forEach((target) => {
                    let config = null;
                    if (target === 'project') {
                        config = configChain.getProjectConfig();
                    } else if (target === 'user') {
                        config = configChain.getUserConfig();
                    } else if (target === 'global') {
                        config = configChain.getGlobalConfig();
                    } else {
                        throw Throwables.exception('BadConfigTarget', {}, 'config target must be either "project", "user" or "global"');
                    }
                    config.setProperty(key, value);
                    promises.push(config.saveToFile());
                });
                return Promises.all(promises);
            });
    },


    //-------------------------------------------------------------------------------
    // Private Methods
    //-------------------------------------------------------------------------------

    /**
     * @private
     * @param {RecipeContext} context
     * @return {Promise}
     */
    buildConfigChainForContext: function(context) {
        const execPath      = context.getExecPath();
        const modulePath    = context.getModulePath();
        const userPath      = context.getUserPath();
        return Promises.props({
            builtIn: RecipeConfig.loadFromFile(modulePath + path.sep + 'config' + path.sep + ConfigController.CONFIG_FILE_NAME),
            global: '',
            project: RecipeConfig.loadFromFile(execPath + path.sep + ConfigController.CONFIG_FILE_NAME),
            user: RecipeConfig.loadFromFile(userPath + path.sep + ConfigController.CONFIG_FILE_NAME)
        }).then((configs) => {
            const chain = new RecipeConfigChain(configs);
            configs.global = RecipeConfig.loadFromFile(chain.getProperty('prefix') + path.sep + ConfigController.CONFIG_FILE_NAME);
            return Promises.props(configs);
        }).then((configs) => {
            return new RecipeConfigChain(configs);
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
    'loadRecipeConfigChain',
    'getConfigProperty',
    'setConfigProperty'
]);


//-------------------------------------------------------------------------------
// Exports
//-------------------------------------------------------------------------------

export default ConfigController;
