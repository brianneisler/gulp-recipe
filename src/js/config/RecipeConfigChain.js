//-------------------------------------------------------------------------------
// Imports
//-------------------------------------------------------------------------------

import {
    Class,
    ConfigChain
} from 'bugcore';


//-------------------------------------------------------------------------------
// Declare Class
//-------------------------------------------------------------------------------

/**
 * @class
 * @extends {ConfigChain}
 */
const RecipeConfigChain = Class.extend(ConfigChain, {

    _name: 'recipe.RecipeConfigChain',


    //-------------------------------------------------------------------------------
    // Constructor
    //-------------------------------------------------------------------------------

    /**
     * @constructs
     * @param {{
     *  builtIn: RecipeConfig,
     *  global: RecipeConfig,
     *  project: RecipeConfig,
     *  user: RecipeConfig
     * }} configs
     */
    _constructor: function(configs) {

        const configArray = [];
        if (configs.builtIn) {
            configArray.push(configs.builtIn);
        }
        if (configs.global) {
            configArray.push(configs.global);
        }
        if (configs.user) {
            configArray.push(configs.user);
        }
        if (configs.project) {
            configArray.push(configs.project);
        }

        this._super(configArray);

        /**
         * @private
         * @type {RecipeConfig}
         */
        this.builtInConfig      = configs.builtIn;

        /**
         * @private
         * @type {RecipeConfig}
         */
        this.globalConfig       = configs.global;

        /**
         * @private
         * @type {RecipeConfig}
         */
        this.projectConfig      = configs.project;

        /**
         * @private
         * @type {RecipeConfig}
         */
        this.userConfig         = configs.user;
    },


    //-------------------------------------------------------------------------------
    // Getters and Setters
    //-------------------------------------------------------------------------------

    /**
     * @return {RecipeConfig}
     */
    getBuiltInConfig: function() {
        return this.builtInConfig;
    },

    /**
     * @return {RecipeConfig}
     */
    getGlobalConfig: function() {
        return this.globalConfig;
    },

    /**
     * @return {RecipeConfig}
     */
    getProjectConfig: function() {
        return this.projectConfig;
    },

    /**
     * @return {RecipeConfig}
     */
    getUserConfig: function() {
        return this.userConfig;
    }
});


//-------------------------------------------------------------------------------
// Exports
//-------------------------------------------------------------------------------

export default RecipeConfigChain;
