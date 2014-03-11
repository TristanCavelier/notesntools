/*!
 * MY LIB description v0.1.0
 *
 * PUT LICENSE HERE
 */
var MYLIB = (function () {
  "use strict";

var hasOwnProperty = Function.prototype.call.bind(
  Object.prototype.hasOwnProperty
);

var emptyString = "";

function toString(value) {
  if (arguments.length === 0) {
    return "";
  }
  return emptyString + value;
}

function isObject(arg) {
  return typeof arg === 'object' && arg;
}
  return {
    "hasOwnProperty": hasOwnProperty,
    "toString": toString,
    "isObject": isObject
  };
}());
