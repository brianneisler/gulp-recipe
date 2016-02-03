//-------------------------------------------------------------------------------
// Imports
//-------------------------------------------------------------------------------

import {
    Class,
    ObjectUtil
} from 'bugcore';
import Firebase from '../util/Firebase';


//-------------------------------------------------------------------------------
// Declare Class
//-------------------------------------------------------------------------------

/**
 * @class
 * @extends {Firebase}
 */
const Entity = Class.extend(Firebase, {

    _name: 'recipe.Entity',


    //-------------------------------------------------------------------------------
    // Public Methods
    //-------------------------------------------------------------------------------

    /**
     * @param {*} value
     * @param {function=} onComplete
     * @return {Firebase}
     */
    push(value, onComplete) {
        this.addTime(value);
        return this._super(value, onComplete);
    },

    /**
     * @method Entity#set
     * @param {*} value
     * @param {function=} onComplete
     */
    set(value, onComplete) {
        this.addTime(value);
        this._super(value, onComplete);
    },

    /**
     * @method Entity#update
     * @param {Object} value
     * @param {function=} onComplete
     */
    update(value, onComplete) {
        this.addUpdatedAt(value);
        this._super(value, onComplete);
    },


    //-------------------------------------------------------------------------------
    // Protected Methods
    //-------------------------------------------------------------------------------

    /**
     * @protected
     * @param {{
     *  createdAt: number,
     *  id: string,
     *  updatedAt: number
     * }} entity
     */
    addCreatedAt(entity) {
        ObjectUtil.assign(entity, { createdAt: Firebase.timestamp() });
    },

    /**
     * @protected
     * @param {{
     *  createdAt: number,
     *  id: string,
     *  updatedAt: number
     * }} entity
     */
    addTime(entity) {
        this.addCreatedAt(entity);
        this.addUpdatedAt(entity);
    },

    /**
     * @protected
     * @param {{
     *  createdAt: number,
     *  id: string,
     *  updatedAt: number
     * }} entity
     */
    addUpdatedAt(entity) {
        ObjectUtil.assign(entity, { updatedAt: Firebase.timestamp() });
    }
});


//-------------------------------------------------------------------------------
// Exports
//-------------------------------------------------------------------------------

export default Entity;
