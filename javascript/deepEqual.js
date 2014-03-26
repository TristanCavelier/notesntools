// Copyright (c) 2014 Tristan Cavelier <t.cavelier@free.fr>
// This program is free software. It comes without any warranty, to
// the extent permitted by applicable law. You can redistribute it
// and/or modify it under the terms of the Do What The Fuck You Want
// To Public License, Version 2, as published by Sam Hocevar. See
// http://www.wtfpl.net/ for more details.

/*jslint indent: 2, maxlen: 80 */
/*global WeakMap */

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
var hasOwnProperty =
  Function.prototype.call.bind(Object.prototype.hasOwnProperty);

/**
 *     deepEqual(a, b[, adapter]): Boolean
 *
 * Compares two values in deep. With the use of weak maps, `deepEqual` can
 * detect cyclic references.
 *
 * @param  {Any} a The first object
 * @param  {Any} b The second object
 * @param  {Function} adapter The function to adapt values to comparable value
 * @return {Boolean} true if equal, else false
 */
function deepEqual(a, b, adapter) {
  var refsa = new WeakMap(), refsb = new WeakMap();
  function deepEqualRec(a, b) {
    var i, l, array, key;
    if (typeof adapter === "function") {
      a = adapter(a);
      b = adapter(b);
    }
    if (Array.isArray(a)) {
      if (!Array.isArray(b)) {
        return false;
      }
      if (refsa.has(a)) {
        if (refsb.has(b)) {
          return true;
        }
        return false;
      }
      if (refsb.has(b)) {
        return false;
      }
      if (a.length !== b.length) {
        return false;
      }
      refsa.set(a);
      refsb.set(b);
      for (i = 0; i < a.length; i += 1) {
        if (!deepEqualRec(a[i], b[i])) {
          return false;
        }
      }
      refsb.delete(b);
      refsa.delete(a);
      return true;
    }
    if (typeof a === "object" && a) {
      if (refsa.has(a)) {
        if (refsb.has(b)) {
          return refsa.get(a) === refsb.get(b);
        }
        return false;
      }
      if (refsb.has(b)) {
        return false;
      }
      refsa.set(a);
      refsb.set(b);
      array = Object.keys(a);
      for (i = 0, l = array.length; i < l; i += 1) {
        key = array[i];
        if (!hasOwnProperty(b, key)) {
          return false;
        }
        if (!deepEqualRec(a[key], b[key])) {
          return false;
        }
      }
      if (array.length !== Object.keys(b).length) {
        return false;
      }
      refsb.delete(b);
      refsa.delete(a);
      return true;
    }
    return a === b;
  }
  return deepEqualRec(a, b);
}

//////////////////////////////////////////////////////////////////////
// Tests
(function () {
  var a, b;

  function dateToNumber(value) {
    if (value instanceof Date) {
      return value.getTime();
    }
    return value;
  }

  function regexpToString(value) {
    if (value instanceof RegExp) {
      return value.toString();
    }
    return value;
  }

  a = {"a": ["b", {"c": "d"}]};
  b = {"a": ["b", {"c": "d"}]};
  console.log(deepEqual(a, b) === true);

  a = {"a": ["b", {"c": "d"}]};
  b = {"a": ["b", {"c": "e"}]};
  console.log(deepEqual(a, b) === false);

  a = {"a": ["b", {"c": new Date(2000)}]};
  b = {"a": ["b", {"c": new Date(1000)}]};
  console.log(deepEqual(a, b, dateToNumber) === false);

  a = {"a": ["b", {"c": /a/g}]};
  b = {"a": ["b", {"c": /b/g}]};
  console.log(deepEqual(a, b, regexpToString) === false);

  a = {"a": ["b", {"c": /a/g}]};
  b = {"a": ["b", {"c": /a/g}]};
  console.log(deepEqual(a, b, regexpToString) === true);

  // with cyclic references
  a = {"a": ["b", {"c": "d"}]};
  a.a[1].a = a;
  b = {"a": ["b", {"c": "d"}]};
  b.a[1].a = b;
  console.log(deepEqual(a, b) === true);

  a = {"a": ["b", {"c": "d"}]};
  a.a[1].a = a;
  b = {"a": ["b", {"c": "d"}]};
  b.a[1].b = b;
  console.log(deepEqual(a, b) === false);
}());
