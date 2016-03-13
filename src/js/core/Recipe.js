//-------------------------------------------------------------------------------
// Imports
//-------------------------------------------------------------------------------

import {
    Class,
    Obj
} from 'bugcore';
import path from 'path';


//-------------------------------------------------------------------------------
// Declare Class
//-------------------------------------------------------------------------------

/**
 * @class
 * @extends {Obj}
 */
const Recipe = Class.extend(Obj, {

    _name: 'gulprecipe.Recipe',


    //-------------------------------------------------------------------------------
    // Constructor
    //-------------------------------------------------------------------------------

    /**
     * @constructs
     * @param {Pack} pack
     */
    _constructor(pack) {

        this._super();


        //-------------------------------------------------------------------------------
        // Private Properties
        //-------------------------------------------------------------------------------

        /**
         * @private
         * @type {Pack}
         */
        this.pack               = pack;

        /**
         * @private
         * @type {function(function(Error), *)}
         */
        this.recipeMethod       = null;
    },


    //-------------------------------------------------------------------------------
    // Getters and Setters
    //-------------------------------------------------------------------------------

    /**
     * @return {string}
     */
    getName() {
        return this.pack.getName();
    },

    /**
     * @return {Pack}
     */
    getPack() {
        return this.pack;
    },

    /**
     * @return {string}
     */
    getPackClass() {
        return this.pack.getPackClass();
    },

    /**
     * @return {function(function(Error), *)}
     */
    getRecipeMethod() {
        return this.recipeMethod;
    },

    /**
     * @return {string}
     */
    getScope() {
        return this.pack.getScope();
    },

    /**
     * @return {string}
     */
    getVersion() {
        return this.pack.getVersion();
    },


    //-------------------------------------------------------------------------------
    // Public Methods
    //-------------------------------------------------------------------------------

    /**
     * @param {Array.<*>} packArgs
     */
    runPack(packArgs) {
        if (!this.packMethod) {
            this.packMethod = require(path.resolve(this.pack.getPackPath(), this.pack.getMain()));
        }
        return this.packMethod.apply(null, packArgs);
    }
});


//-------------------------------------------------------------------------------
// Exports
//-------------------------------------------------------------------------------

export default Recipe;
