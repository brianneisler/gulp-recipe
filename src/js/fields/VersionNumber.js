//-------------------------------------------------------------------------------
// Imports
//-------------------------------------------------------------------------------

import {
    Class,
    Obj,
    Throwables,
    TypeUtil
} from 'bugcore';
import RegexUtil from '../util/RegexUtil';


//-------------------------------------------------------------------------------
// Declare Class
//-------------------------------------------------------------------------------

/**
 * @class
 * @extends {Obj}
 */
const VersionNumber = Class.extend(Obj, {
    _name: 'recipe.VersionNumber'
});


//-------------------------------------------------------------------------------
// Static Properties
//-------------------------------------------------------------------------------

/**
 * @static
 * @const {RegExp}
 */
VersionNumber.VERSION_NUMBER_REGEX = new RegExp('^' +
    '(' + RegexUtil.NO_LEADING_ZERO + ')' +
    '\\.(' + RegexUtil.NO_LEADING_ZERO + ')' +
    '\\.(' + RegexUtil.NO_LEADING_ZERO + ')' +
    '(?:-((?:' + RegexUtil.NO_LEADING_ZERO_IDENTIFIER + ')(?:\\.(?:' + RegexUtil.NO_LEADING_ZERO_IDENTIFIER + '))*))?' +
    '(?:\\+((?:' + RegexUtil.NO_LEADING_ZERO_IDENTIFIER + ')(?:\\.(?:' + RegexUtil.NO_LEADING_ZERO_IDENTIFIER + '))*))?' +
    '$');


//-------------------------------------------------------------------------------
// Static Methods
//-------------------------------------------------------------------------------

/**
 * @static
 * @param {string} versionNumber
 * @return {{
 *      major: number,
 *      minor: number,
 *      patch: number,
 *      preRelease: string,
 *      metadata: string
 * }}
 */
VersionNumber.parseParts = function(versionNumber) {
    const parts = versionNumber.match(VersionNumber.VERSION_NUMBER_REGEX);
    return {
        major: parts[1],
        minor: parts[2],
        patch: parts[3],
        preRelease: parts[4] || '',
        metadata: parts[5] || ''
    };
};

/**
 * @static
 * @param {string} versionNumber
 */
VersionNumber.validateVersionNumber = function(versionNumber) {
    if (!TypeUtil.isString(versionNumber)) {
        throw Throwables.exception('RecipeInvalid', {}, 'Recipe version must be a string');
    }
    if (!(VersionNumber.VERSION_NUMBER_REGEX).test(versionNumber)) {
        throw Throwables.exception('RecipeInvalid', {}, 'Recipe version must of of the format [number].[number].[number]');
    }
};


//-------------------------------------------------------------------------------
// Exports
//-------------------------------------------------------------------------------

export default VersionNumber;
