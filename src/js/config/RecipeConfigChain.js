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
     *  override: Config,
     *  project: RecipeConfig,
     *  user: RecipeConfig
     * }} configs
     * @param {string} target
     */
    _constructor(configs, target) {
        const configArray = [];
        if (configs.override) {
            configArray.push(configs.override);
        }
        if (configs.project) {
            configArray.push(configs.project);
        }
        if (configs.user) {
            configArray.push(configs.user);
        }
        if (configs.global) {
            configArray.push(configs.global);
        }
        if (configs.builtIn) {
            configArray.push(configs.builtIn);
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
         * @type {Config}
         */
        this.overrideConfig     = configs.override;

        /**
         * @private
         * @type {RecipeConfig}
         */
        this.projectConfig      = configs.project;

        /**
         * @private
         * @type {RecipeConfig}
         */
        this.targetConfig       = configs[target];

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
    getBuiltInConfig() {
        return this.builtInConfig;
    },

    /**
     * @return {RecipeConfig}
     */
    getGlobalConfig() {
        return this.globalConfig;
    },

    /**
     * @return {Config}
     */
    getOverrideConfig() {
        return this.overrideConfig;
    },

    /**
     * @return {RecipeConfig}
     */
    getProjectConfig() {
        return this.projectConfig;
    },

    /**
     * @return {RecipeConfig}
     */
    getTargetConfig() {
        return this.targetConfig;
    },

    /**
     * @return {RecipeConfig}
     */
    getUserConfig() {
        return this.userConfig;
    }
});


//-------------------------------------------------------------------------------
// Exports
//-------------------------------------------------------------------------------

export default RecipeConfigChain;
