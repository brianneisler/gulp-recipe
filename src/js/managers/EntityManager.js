//-------------------------------------------------------------------------------
// Imports
//-------------------------------------------------------------------------------

import {
    Class,
    Obj,
    ObjectUtil,
    Throwables
} from 'bugcore';
import { EntityCache } from '../caches';


//-------------------------------------------------------------------------------
// Declare Class
//-------------------------------------------------------------------------------

/**
 * @class
 * @extends {Obj}
 */
const EntityManager = Class.extend(Obj, {

    _name: 'recipe.EntityManager',


    //-------------------------------------------------------------------------------
    // Constructor
    //-------------------------------------------------------------------------------

    /**
     * @constructs
     * @param {EntityClass} entityClass
     */
    _constructor(entityClass) {

        this._super();


        //-------------------------------------------------------------------------------
        // Private Properties
        //-------------------------------------------------------------------------------

        //TODO BRN: Add watchers for when Entitys change. On change, delete cache entry (or reload file and update cache)

        /**
         * @private
         * @type {boolean}
         */
        this.cacheEnabled   = true;

        /**
         * @private
         * @type {EntityCache}
         */
        this.entityCache    = new EntityCache();

        /**
         * @private
         * @type {Class}
         */
        this.entityClass    = entityClass;
    },


    //-------------------------------------------------------------------------------
    // Getters and Setters
    //-------------------------------------------------------------------------------

    /**
     * @return {EntityCache}
     */
    getEntityCache() {
        return this.entityCache;
    },

    /**
     * @return {Class}
     */
    getEntityClass() {
        return this.entityClass;
    },


    //-------------------------------------------------------------------------------
    // Public Methods
    //-------------------------------------------------------------------------------

    /**
     *
     */
    disableCache() {
        this.cacheEnabled = false;
    },

    /**
     *
     */
    enableCache() {
        this.cacheEnabled = true;
    },

    /**
     * @param {Object} pathData
     * @return {Promise<Entity>}
     */
    get(pathData) {
        const path = this.generatePath(pathData);
        return this.cachePass(path, () => {
            const entity = this.generateEntity(path, null);
            return entity
                .proof()
                .then(() => {
                    return entity;
                });
        });
    },

    /**
     * @param {Object} pathData
     * @return {Promise}
     */
    remove(pathData) {
        const path      = this.generatePath(pathData);
        const entity    = this.generateEntity(path, null);
        return entity
            .proof()
            .remove()
            .then(() => {
                this.removeCache(path);
            });
    },

    /**
     * @param {Object} pathData
     * @param {Object} rawData
     * @return {Promise<Entity>}
     */
    set(pathData, rawData) {
        const path      = this.generatePath(pathData);
        const entity    = this.generateEntity(path, null);
        return entity
            .proof()
            .set(rawData)
            .then(() => {
                return this.addCache(entity);
            });
    },

    /**
     * @param {Object} pathData
     * @param {{
     * }} updates
     * @return {Promise<Entity>}
     */
    update(pathData, updates) {
        const path      = this.generatePath(pathData);
        const entity    = this.generateEntity(path, null);
        return entity
            .proof()
            .update(updates)
            .then(() => {
                return this.addCache(entity);
            });
    },


    //-------------------------------------------------------------------------------
    // Abstract Methods
    //-------------------------------------------------------------------------------

    /**
     * @abstract
     * @param {Object} pathData
     * @return {string}
     */
    generatePath(pathData) {   //eslint-disable-line no-unused-vars
        throw Throwables.bug('AbstractMethodNotImplemented', {}, 'Must implement EntityManager.generate');
    },


    //-------------------------------------------------------------------------------
    // Protected Methods
    //-------------------------------------------------------------------------------

    /**
     * @protected
     * @param {Entity} entity
     * @return {Entity}
     */
    addCache(entity) {
        if (this.cacheEnabled) {
            this.entityCache.set(entity.toPath(), entity);
        }
        return entity;
    },

    /**
     * @protected
     * @param {string} path
     */
    removeCache(path) {
        if (this.cacheEnabled) {
            return this.entityCache.delete(path);
        }
    },

    /**
     * @protected
     * @param {string} path
     * @param {function():Promise} getMethod
     * @return {Promise<Entity>}
     */
    cachePass(path, getMethod) {
        const value = this.cacheEnabled ? this.entityCache.get(path) : null;
        if (!value) {
            return getMethod()
                .then((entity) => {
                    if (entity.hasData()) {
                        return this.addCache(entity);
                    }
                    return null;
                });
        }
        return Promise.resolve(value);
    },

    /**
     * @protected
     * @param {*} pathData
     * @param {Object} rawData
     * @return {Entity}
     */
    generateEntity(pathData, rawData) {
        return new this.entityClass(pathData, rawData);
    }
});


//-------------------------------------------------------------------------------
// Exports
//-------------------------------------------------------------------------------

export default EntityManager;
