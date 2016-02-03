//-------------------------------------------------------------------------------
// Imports
//-------------------------------------------------------------------------------

import {
    Class
} from 'bugcore';
import Entity from './Entity';
import Firebase from '../util/Firebase';


//-------------------------------------------------------------------------------
// Declare Class
//-------------------------------------------------------------------------------

/**
 * @class
 * @extends {Entity}
 */
const Email = Class.extend(Entity, {
    _name: 'recipe.Email'
});


//-------------------------------------------------------------------------------
// Static Methods
//-------------------------------------------------------------------------------

/**
 * @static
 * @param {string} emailId
 * @return {Promise}
 */
Email.get = function(emailId) {
    return (new Email(['emails', emailId])).proof();
};

/**
 * @static
 * @param {{
 *
 * }} email
 * @returns {Promise}
 */
Email.push = function(email) {
    const ref = Firebase.ref(['emails']).push();
    email.id = ref.key();
    return (new Email(ref))
        .proof()
        .set(email);
};

/**
 * @static
 * @param {{}} email
 * @return {Promise}
 */
Email.set = function(email) {
    return (new Email(['emails', email.id]))
        .proof()
        .set(email);
};

/**
 * @static
 * @param {string} emailId
 * @param {{}} updates
 * @return {Promise}
 */
Email.update = function(emailId, updates) {
    return (new Email(['emails', emailId]))
        .proof()
        .update(updates);
};


//-------------------------------------------------------------------------------
// Exports
//-------------------------------------------------------------------------------

export default Email;
