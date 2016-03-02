//-------------------------------------------------------------------------------
// Imports
//-------------------------------------------------------------------------------

import {
    Class,
    Obj,
    ObjectBuilder,
    Promise,
    Throwables
} from 'bugcore';
import prompt from 'prompt';


//-------------------------------------------------------------------------------
// Declare Class
//-------------------------------------------------------------------------------

/**
 * @class
 * @extends {Obj}
 */
const Command = Class.extend(Obj, {

    _name: 'gulprecipe.Command',


    //-------------------------------------------------------------------------------
    // Abstract Methods
    //-------------------------------------------------------------------------------

    /**
     * @abstract
     */
    async run() {
        throw Throwables.bug('AbstractMethodNotImplemented', {}, 'Must implement Command#run');
    },


    //-------------------------------------------------------------------------------
    // Protected Methods
    //-------------------------------------------------------------------------------

    /**
     * @protected
     * @param {Object} schema
     * @return {Promise}
     */
    prompt(schema) {
        return new Promise((resolve, reject) => {
            prompt.start();
            prompt.get(schema, (error, result) => {
                if (error) {
                    return reject(error);
                }
                return resolve(result);
            });
        });
    },

    /**
     * @protected
     * @param {{
     *      global: ?boolean,
     *      user: ?boolean,
     *      project: ?boolean
     * }} options
     * @param {string=} defaultTarget
     * @return {{target: string}}
     */
    refineTargetOption(options, defaultTarget) {
        let target = '';
        if (options.global) {
            target = 'global';
        }
        if (options.user) {
            if (target) {
                throw Throwables.exception('TooManyContexts', {}, 'One context at a time');
            }
            target = 'user';
        }
        if (options.project) {
            if (target) {
                throw Throwables.exception('TooManyContexts', {}, 'One context at a time');
            }
            target = 'project';
        }
        if (!target && defaultTarget) {
            target = defaultTarget;
        }
        return ObjectBuilder
            .assign({target: target})
            .build();
    }
});


//-------------------------------------------------------------------------------
// Exports
//-------------------------------------------------------------------------------

export default Command;
