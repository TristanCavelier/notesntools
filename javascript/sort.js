/*jslint indent: 2, maxlen: 80 */

"use strict";

// keywords: js, javascript, python sort, array

/**
 * Acts like python `sort()`.
 *
 * @param  {Array} array The array to sort
 * @param  {Function} [key] A function that return the value to compare
 * @param  {Boolean} [reverse=false] Sort way
 */
function sort(array, key, reverse) {
  if (reverse === true) {
    reverse = 1;
  } else {
    reverse = -1;
  }
  if (typeof key === 'function') {
    return array.sort(function (a, b) {
      a = key(a);
      b = key(b);
      return a < b ? reverse : a > b ? -reverse : 0;
    });
  }
  return array.sort(function (a, b) {
    return a < b ? reverse : a > b ? -reverse : 0;
  });
}

/**
 * Acts like python `sort()`.
 *
 * @param  {Array} array The array to sort
 * @param  {Object} [options] Some sort option
 * @param  {Function} [options.key] A function that return the value to compare
 * @param  {Boolean} [options.reverse=false] Sort way
 */
function sort(array, options) {
  var key, reverse = -1;
  if (typeof options === 'object' &&
      Object.getPrototypeOf(options) === Object.prototype) {
    if (options.reverse === true) {
      reverse = 1;
    }
    if (typeof options.key === 'function') {
      key = options.key;
      return array.sort(function (a, b) {
        a = key(a);
        b = key(b);
        return a < b ? reverse : a > b ? -reverse : 0;
      });
    }
  }
  return array.sort(function (a, b) {
    return a < b ? reverse : a > b ? -reverse : 0;
  });
}
