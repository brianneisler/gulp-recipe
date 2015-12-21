//-------------------------------------------------------------------------------
// Imports
//-------------------------------------------------------------------------------

var bugcore         = require('bugcore');


//-------------------------------------------------------------------------------
// Simplify References
//-------------------------------------------------------------------------------

var Class           = bugcore.Class;
var Map             = bugcore.Map;
var Obj             = bugcore.Obj;


//-------------------------------------------------------------------------------
// Declare Class
//-------------------------------------------------------------------------------

/**
 * @class
 * @extends {Obj}
 */
var ElfTaskStore = Class.extend(Obj, {

    _name: 'gulpelf.ElfTaskStore',


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
         * @type {Map.<string, ElfTask>}
         */
        this.taskNameToElfTaskMap   = new Map();
    },


    //-------------------------------------------------------------------------------
    // Getters and Setters
    //-------------------------------------------------------------------------------

    /**
     * @return {Map.<string, ElfTask>}
     */
    getTaskNameToElfTaskMap: function() {
        return this.taskNameToElfTaskMap;
    },
    

    //-------------------------------------------------------------------------------
    // Public Methods
    //-------------------------------------------------------------------------------

    /**
     * @param {string} taskName
     * @returns {ElfTask}
     */
    getTask: function(taskName) {
        return this.taskNameToElfTaskMap.get(taskName);
    },

    /**
     * @param {string} taskName
     * @returns {boolean}
     */
    hasTask: function(taskName) {
        return this.taskNameToElfTaskMap.containsKey(taskName);
    },

    /**
     * @param {string} taskName
     * @param {ElfTask} elfTask
     */
    setTask: function(taskName, elfTask) {
        this.taskNameToElfTaskMap.put(taskName, elfTask);
    }
});


//-------------------------------------------------------------------------------
// Exports
//-------------------------------------------------------------------------------

module.exports = ElfTaskStore;
