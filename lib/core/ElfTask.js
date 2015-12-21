//-------------------------------------------------------------------------------
// Imports
//-------------------------------------------------------------------------------

var bugcore         = require('bugcore');


//-------------------------------------------------------------------------------
// Simplify References
//-------------------------------------------------------------------------------

var Class           = bugcore.Class;
var Obj             = bugcore.Obj;


//-------------------------------------------------------------------------------
// Declare Class
//-------------------------------------------------------------------------------

/**
 * @class
 * @extends {Obj}
 */
var ElfTask = Class.extend(Obj, {

    _name: 'gulpelf.ElfTask',


    //-------------------------------------------------------------------------------
    // Constructor
    //-------------------------------------------------------------------------------

    /**
     * @constructs
     * @param {Array.<String>} dependencies
     * @param {function(function(Error), *...)} taskMethod
     */
    _constructor: function(dependencies, taskMethod) {

        this._super();


        //-------------------------------------------------------------------------------
        // Private Properties
        //-------------------------------------------------------------------------------

        /**
         * @private
         * @type {Array.<string>}
         */
        this.dependencies   = dependencies;

        /**
         * @private
         * @type {function(function(Error), *)}
         */
        this.taskMethod     = taskMethod;
    },


    //-------------------------------------------------------------------------------
    // Getters and Setters
    //-------------------------------------------------------------------------------

    /**
     * @return {Array.<string>}
     */
    getDependencies: function() {
        return this.dependencies;
    },

    /**
     * @return {function(function(Error), *)}
     */
    getTaskMethod: function() {
        return this.taskMethod;
    },


    //-------------------------------------------------------------------------------
    // Public Methods
    //-------------------------------------------------------------------------------

    /**
     * @param {Array.<*>} taskArgs
     */
    runTask: function(taskArgs) {
        return this.taskMethod.apply(null, taskArgs);
    }
});


//-------------------------------------------------------------------------------
// Exports
//-------------------------------------------------------------------------------

module.exports = ElfTask;
