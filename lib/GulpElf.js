//-------------------------------------------------------------------------------
// Imports
//-------------------------------------------------------------------------------

var bugcore         = require('bugcore');
var npm             = require('npm');
var path            = require('path');
var ElfTask         = require('./core/ElfTask');
var ElfTaskStore    = require('./core/ElfTaskStore');


//-------------------------------------------------------------------------------
// Simplify References
//-------------------------------------------------------------------------------

var Class           = bugcore.Class;
var Obj             = bugcore.Obj;
var Promises        = bugcore.Promises;
var Proxy           = bugcore.Proxy;
var Set             = bugcore.Set;
var Throwables      = bugcore.Throwables;
var TypeUtil        = bugcore.TypeUtil;


//-------------------------------------------------------------------------------
// Declare Class
//-------------------------------------------------------------------------------

/**
 * @class
 * @extends {Obj}
 */
var GulpElf = Class.extend(Obj, {

    _name: 'gulpelf.GulpElf',


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
         * @type {string}
         */
        this.defaultTasksDir    = __dirname + path.sep + 'tasks';

        /**
         * @private
         * @type {Set.<string>}
         */
        this.dependencyCacheSet = new Set();

        /**
         * @pivate
         * @type {boolean}
         */
        this.npmLoaded          = false;

        /**
         * @private
         * @type {Promise}
         */
        this.npmLoadingPromise  = null;

        /**
         * @private
         * @type {string}
         */
        this.tasksDir           = process.cwd() + path.sep + 'gulp-tasks';

        /**
         * @private
         * @type {ElfTaskStore}
         */
        this.taskStore          = new ElfTaskStore();
    },


    //-------------------------------------------------------------------------------
    // Getters and Setters
    //-------------------------------------------------------------------------------

    /**
     * @return {string}
     */
    getDefaultTaskDir: function() {
        return this.defaultTasksDir;
    },

    /**
     * @return {string}
     */
    getTasksDir: function() {
        return this.tasksDir;
    },

    /**
     * @return {ElfTaskStore}
     */
    getTaskStore: function() {
        return this.taskStore;
    },


    //-------------------------------------------------------------------------------
    // Public Methods
    //-------------------------------------------------------------------------------

    /**
     * @param {{
     *      tasksDir: string
     * }} configObject
     */
    configure: function(configObject) {
       if (TypeUtil.isObject(configObject)) {
           if (TypeUtil.isString(configObject.tasksDir)) {
               this.tasksDir = configObject.tasksDir;
           }
       } else {
           throw Throwables.illegalArgumentBug("configObject", configObject, "must be an object");
       }
    },

    /**
     * @param {string} taskName
     * @param {{
     *      dependencies: Array.<string>,
     *      task: function(function(Error), *...)
     * }} taskObject
     * @return {ElfTask}
     */
    defineTask: function(taskName, taskObject) {
        var elfTask = new ElfTask(taskObject.dependencies, taskObject.task);
        this.taskStore.setTask(taskName, elfTask);
        return elfTask;
    },

    /**
     * @param {string} taskName
     * @return {function(function(Error), *...)}
     */
    getTask: function(taskName) {
        var _this       = this;
        var taskArgs    = Array.prototype.slice.call(arguments);
        taskArgs.shift();

        return function() {
            var gulpArgs = Array.prototype.slice.call(arguments);
            return _this.loadTask(taskName)
                .then(function(elfTask) {
                    return elfTask.runTask(gulpArgs.concat(taskArgs));
                })
        }
    },


    //-------------------------------------------------------------------------------
    // Private Methods
    //-------------------------------------------------------------------------------

    /**
     * @private
     * @return {Promise}
     */
    ensureNpmLoaded: function() {
        var _this = this;
        return Promises.promise(function(resolve, reject) {
            if (!_this.npmLoaded) {
                resolve(_this.loadNpm());
            } else {
                resolve();
            }
        });
    },

    /**
     * @private
     * @param {ElfTask} elfTask
     * @return {Promise}
     */
    ensureTaskDependenciesInstalled: function(elfTask) {
        var _this = this;
        return this.ensureNpmLoaded()
            .then(function() {
                var dependenciesToInstall = [];
                elfTask.getDependencies().forEach(function(dependency) {
                    if (!_this.isDependencyInstalled(dependency)) {
                        dependenciesToInstall.push(dependency);
                    }
                });
                return _this.installDependencies(dependenciesToInstall);
            }).then(function() {
                return elfTask;
            });
    },

    /**
     * @private
     * @param {string} taskName
     * @return {ElfTask}
     */
    findAndDefineTask: function(taskName) {
        var taskObject = this.tryFindTaskObject(taskName);
        if (!taskObject) {
            taskObject = this.tryFindDefaultTaskObject(taskName);
            if (!taskObject) {
                throw Throwables.exception('CouldNotFindTask', {}, 'Could not find task by the name "' + taskName + '"');
            }
        }
        return this.defineTask(taskName, taskObject);
    },

    /**
     * @private
     * @param {Array.<string>} dependencies
     * @returns {Promise}
     */
    installDependencies: function(dependencies) {
        return Promises.promise(function(resolve, reject) {
            npm.commands.install(dependencies, function (error) {
                if (error) {
                    return reject(error);
                }
                return resolve();
            });
        });
    },

    /**
     * @private
     * @param {string} dependency
     * @returns {boolean}
     */
    isDependencyInstalled: function(dependency) {
        var result = false;
        if (this.dependencyCacheSet.contains(dependency)) {
            return true;
        }
        try {
            result = !!require.resolve(dependency);
            this.dependencyCacheSet.add(dependency);
        } catch(e) {}
        return result
    },

    /**
     * @return {Promise}
     */
    loadNpm: function() {
        var _this = this;
        if (!this.npmLoadingPromise) {
            this.npmLoadingPromise = Promises.promise(function(resolve, reject) {
                npm.on("log", function (message) {
                    console.log(message);
                });
                npm.load({
                    loaded: false
                }, function(error) {
                    _this.npmLoadingPromise = null;
                    if (error) {
                        _this.npmLoaded = false;
                        return reject(error);
                    } else {
                        _this.npmLoaded = true;
                        return resolve();
                    }
                });
            });
        }
        return this.npmLoadingPromise;
    },

    /**
     * @private
     * @param {string} taskName
     * @returns {Promise}
     */
    loadTask: function(taskName) {
        var _this = this;
        return Promises.try(function() {
            var elfTask = _this.taskStore.getTask(taskName);
            if (!elfTask) {
                elfTask = _this.findAndDefineTask(taskName);
            }
            return _this.ensureTaskDependenciesInstalled(elfTask);
        });
    },

    /**
     * @private
     * @param {string} taskName
     * @returns {{
     *      dependencies: Array.<string>,
     *      task: function(function(Error), *...)
     * }}
     */
    tryFindDefaultTaskObject: function(taskName) {
        var taskObject = null;
        try {
            taskObject = require(this.defaultTasksDir + '/' + taskName)
        } catch(e) {}
        return taskObject;
    },

    /**
     * @private
     * @param {string} taskName
     * @returns {{
     *      dependencies: Array.<string>,
     *      task: function(function(Error), *...)
     * }}
     */
    tryFindTaskObject: function(taskName) {
        var taskObject = null;
        try {
            taskObject = require(this.tasksDir + '/' + taskName)
        } catch(e) {}
        return taskObject;
    }
});


//-------------------------------------------------------------------------------
// Public Static Properties
//-------------------------------------------------------------------------------

/**
 * @static
 * @type {function(new:ElfTask)}
 */
GulpElf.ElfTask         = ElfTask;

/**
 * @static
 * @type {function(new:ElfTaskStore)}
 */
GulpElf.ElfTaskStore    = ElfTaskStore;


//-------------------------------------------------------------------------------
// Private Static Properties
//-------------------------------------------------------------------------------

/**
 * @static
 * @private
 * @type {BugCore}
 */
GulpElf.instance        = null;


//-------------------------------------------------------------------------------
// Static Methods
//-------------------------------------------------------------------------------

/**
 * @static
 * @return {GulpElf}
 */
GulpElf.getInstance = function() {
    if (GulpElf.instance === null) {
        GulpElf.instance = new GulpElf();
    }
    return GulpElf.instance;
};


//-------------------------------------------------------------------------------
// Static Proxy
//-------------------------------------------------------------------------------

Proxy.proxy(GulpElf, Proxy.method(GulpElf.getInstance), [
    'configure',
    'defineTask',
    'getTask'
]);


//-------------------------------------------------------------------------------
// Exports
//-------------------------------------------------------------------------------

module.exports = GulpElf;
