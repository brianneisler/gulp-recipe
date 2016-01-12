//-------------------------------------------------------------------------------
// Imports
//-------------------------------------------------------------------------------

import {
    Class,
    Obj,
    Proxy,
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
        this.modulePath    = '';

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
     * @param {string=} execPath
     * @return {RecipeContext}
     */
    init: function(execPath) {
        const _this = this._super();
        if (_this) {
            if (TypeUtil.isString(execPath)) {
                _this.execPath = path.resolve(execPath);
            } else {
                _this.execPath = path.resolve(process.cwd());
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
                Obj.equals(value.getUserPath, this.userPath)
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
                Obj.hashCode(this.userPath));
        }
        return this._hashCode;
    }
});


//-------------------------------------------------------------------------------
// Private Static Properties
//-------------------------------------------------------------------------------

/**
 * @static
 * @private
 * @type {RecipeContext}
 */
RecipeContext.instance        = null;


//-------------------------------------------------------------------------------
// Static Methods
//-------------------------------------------------------------------------------

/**
 * @static
 * @return {ConfigSetCommand}
 */
RecipeContext.getInstance = function() {
    if (RecipeContext.instance === null) {
        RecipeContext.instance = new RecipeContext();
    }
    return RecipeContext.instance;
};


//-------------------------------------------------------------------------------
// Static Proxy
//-------------------------------------------------------------------------------

Proxy.proxy(RecipeContext, Proxy.method(RecipeContext.getInstance), [
    'getExecPath',
    'getModulePath',
    'getUserPath'
]);


//-------------------------------------------------------------------------------
// Exports
//-------------------------------------------------------------------------------

export default RecipeContext;
