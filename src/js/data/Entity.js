//-------------------------------------------------------------------------------
// Imports
//-------------------------------------------------------------------------------

import {
    Class
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
    push: function(value, onComplete) {
        this.addTime(value);
        return this._super(value, onComplete);
    },

    /**
     * @method Entity#set
     * @param {*} value
     * @param {function=} onComplete
     */
    set: function(value, onComplete) {
        this.addTime(value);
        this._super(value, onComplete);
    },

    /**
     * @method Entity#update
     * @param {Object} value
     * @param {function=} onComplete
     */
    update: function(value, onComplete) {
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
    addCreatedAt: function(entity) {
        entity.createdAt = (new Date()).getTime();
    },

    /**
     * @protected
     * @param {{
     *  createdAt: number,
     *  id: string,
     *  updatedAt: number
     * }} entity
     */
    addTime: function(entity) {
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
    addUpdatedAt: function(entity) {
        entity.updatedAt = (new Date()).getTime();
    }
});


//-------------------------------------------------------------------------------
// Exports
//-------------------------------------------------------------------------------

export default Entity;
