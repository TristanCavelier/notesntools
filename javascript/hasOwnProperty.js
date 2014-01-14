/*jslint indent: 2 */

"use strict";

/**
 * hasOwnProperty(object, prop): Boolean
 *
 * The hasOwnProperty() method returns a boolean indicating whether the object
 * has the specified property.
 *
 * @param  {Object} object The object to use
 * @param  {String} prop The property name
 * @return {Boolean} The result
 */
var hasOwnProperty = Function.prototype.call.bind(
  Object.prototype.hasOwnProperty
);

//////////////////////////////////////////////////////////////////////
// Test

if (!module.parent) {
  (function () {
    /*jslint forin: true */
    var o = {}, key;
    console.log(hasOwnProperty(o, 'a') === o.hasOwnProperty('a'));
    o.a = 'b';
    console.log(hasOwnProperty(o, 'a') === o.hasOwnProperty('a'));
    o.hasOwnProperty = 'c';
    console.log(o.hasOwnProperty === 'c');
    console.log(hasOwnProperty(o, 'hasOwnProperty') === true);

    // // prints
    // a
    // hasOwnProperty
    for (key in o) {
      if (hasOwnProperty(o, key)) {
        console.log(key);
      }
    }
  }());
}
