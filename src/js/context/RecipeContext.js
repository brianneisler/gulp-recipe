//-------------------------------------------------------------------------------
// Imports
//-------------------------------------------------------------------------------

import {
    Class,
    Obj,
    Throwables,
    TypeUtil
} from 'bugcore';
import path from 'path';


//-------------------------------------------------------------------------------
// Declare Class
//-------------------------------------------------------------------------------

/**
 * @class
 * @extends {Obj}
 */
const RecipeContext = Class.extend(Obj, {

    _name: 'recipe.RecipeContext',


    //-------------------------------------------------------------------------------
    // Constructor
    //-------------------------------------------------------------------------------

    /**
     * @constructs
     */
    _constructor: function() {

        this._super();


        //-------------------------------------------------------------------------------
        // Private Properties
        //-------------------------------------------------------------------------------

        /**
         * @private
         * @type {string}
         */
        this.execPath       = '';

        /**
         * @private
         * @type {string}
         */
        this.modulePath     = '';

        /**
         * @private
         * @type {string}
         */
        this.target         = '';

        /**
         * @private
         * @type {string}
         */
        this.userPath       = '';
    },


    //-------------------------------------------------------------------------------
    // Init Methods
    //-------------------------------------------------------------------------------

    /**
     * @param {{
     *      execPath: string=,
     *      target: string=
     * }=} options
     * @return {RecipeContext}
     */
    init: function(options) {
        const _this = this._super();
        if (_this) {
            if (TypeUtil.isObject(options) && TypeUtil.isString(options.execPath)) {
                _this.execPath = path.resolve(options.execPath);
            } else {
                _this.execPath = path.resolve(process.cwd());
            }
            if (TypeUtil.isObject(options) && TypeUtil.isString(options.target)) {
                if (!RecipeContext.TARGETS[options.target]) {
                    throw Throwables.illegalArgumentBug('options.target', options.target, 'target must be a valid target value ["global", "user", "project"]');
                }
                _this.target = options.target;
            } else {
                _this.target = 'project';
            }

            _this.modulePath = path.resolve(__dirname, '../../..');
            _this.userPath = path.resolve(process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME']);
        }
        return _this;
    },


    //-------------------------------------------------------------------------------
    // Getters and Setters
    //-------------------------------------------------------------------------------

    /**
     * @return {string}
     */
    getExecPath: function() {
        return this.execPath;
    },

    /**
     * @return {string}
     */
    getModulePath: function() {
        return this.modulePath;
    },

    /**
     * @return {string}
     */
    getTarget: function() {
        return this.target;
    },

    /**
     * @return {string}
     */
    getUserPath: function() {
        return this.userPath;
    },


    //-------------------------------------------------------------------------------
    // Obj Methods
    //-------------------------------------------------------------------------------

    /**
     * @override
     * @param {*} value
     * @return {boolean}
     */
    equals: function(value) {
        if (Class.doesExtend(value, RecipeContext)) {
            return (
                Obj.equals(value.getModulePath(), this.modulePath) &&
                Obj.equals(value.getExecPath(), this.execPath) &&
                Obj.equals(value.getTarget(), this.target) &&
                Obj.equals(value.getUserPath(), this.userPath)
            );
        }
        return false;
    },

    /**
     * @override
     * @return {number}
     */
    hashCode: function() {
        if (!this._hashCode) {
            this._hashCode = Obj.hashCode('[RecipeContext]' +
                Obj.hashCode(this.modulePath) + '_' +
                Obj.hashCode(this.execPath) + '_' +
                Obj.hashCode(this.target) + '_' +
                Obj.hashCode(this.userPath));
        }
        return this._hashCode;
    }
});


//-------------------------------------------------------------------------------
// Static Properties
//-------------------------------------------------------------------------------

RecipeContext.TARGETS = {
    global: 'global',
    project: 'project',
    user: 'user'
};


//-------------------------------------------------------------------------------
// Exports
//-------------------------------------------------------------------------------

export default RecipeContext;
