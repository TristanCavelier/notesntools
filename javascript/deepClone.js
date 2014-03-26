// Copyright (c) 2014 Tristan Cavelier <t.cavelier@free.fr>
// This program is free software. It comes without any warranty, to
// the extent permitted by applicable law. You can redistribute it
// and/or modify it under the terms of the Do What The Fuck You Want
// To Public License, Version 2, as published by Sam Hocevar. See
// http://www.wtfpl.net/ for more details.

// keywords: js, javascript, native, deep clone, cyclic references

/*jslint indent: 2, maxlen: 80 */
/*global WeakMap */

"use strict";

/**
 * deepClone(object[, cloner]): Any
 *
 * Clones all native object in deep. Managed types: Object, Array, String,
 * Number, Boolean, Function, null. With the use of weak maps, `deepClone` is
 * able to detect the cyclic references and to reproduce them to the cloned
 * object.
 *
 * `cloner` is a function that allow to extend the cloning tool. If `cloner`
 * returns undefined, then `deepClone` will not consider the object cloned and
 * will try to clone it. If `cloner` returns something else, then `deepClone`
 * will take the returned value as an already cloned value and will just
 * return this value.
 *
 *     var o = {"date": new Date()};
 *     var c = deepClone(o, function (parsed) {
 *       if (parsed instanceof Date) {
 *         return new Date(parsed);
 *       }
 *     });
 *
 * @param  {Any} object The object to clone
 * @param  {Function} cloner A function to extend cloning feature
 * @return {Any} The cloned object
 */
function deepClone(object, cloner) {
  var refs = new WeakMap();
  function deepCloneRec(value) {
    var i, l, array, key, cloned;
    if (typeof cloner === "function") {
      cloned = cloner(value);
      if (cloned !== undefined) {
        return cloned;
      }
    }
    if (Array.isArray(value)) {
      if (refs.has(value)) {
        return refs.get(value);
      }
      cloned = [];
      refs.set(value, cloned);
      for (i = 0; i < value.length; i += 1) {
        cloned[i] = deepCloneRec(value[i], cloner);
      }
      return cloned;
    }
    if (typeof value === "object" && value) {
      if (refs.has(value)) {
        return refs.get(value);
      }
      cloned = {};
      refs.set(value, cloned);
      array = Object.keys(value);
      for (i = 0, l = array.length; i < l; i += 1) {
        key = array[i];
        cloned[key] = deepCloneRec(value[key], cloner);
      }
      return cloned;
    }
    return value;
  }
  return deepCloneRec(object);
}

//////////////////////////////////////////////////////////////////////
// Tests
(function () {
  var a, b;

  a = {"events": {
    "a": function () {
      return;
    },
    "b": [function () {
      return;
    }, function () {
      return;
    }],
    "c": [1, "a"]
  }};
  b = deepClone(a);
  delete a.events.c;
  delete a.events.b[0];
  console.log(a, "{ events: { a: [Function], b: [ , [Function] ] } }");
  console.log(b, "{ events: { a: [Function], b: [ [Function], " +
              "[Function] ], c: [ 1, 'a' ] } }");
  a = {"date": new Date(1000)};
  b = deepClone(a, function (object) {
    if (object instanceof Date) {
      return new Date(object);
    }
  });
  console.log(b.date.getTime() === a.date.getTime());

  // With cyclic references
  a = {"a": {"b": "c"}};
  a.d = a;
  b = deepClone(a);
  console.log(b.d === b);
}());
