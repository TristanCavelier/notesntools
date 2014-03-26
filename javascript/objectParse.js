// Copyright (c) 2014 Tristan Cavelier <t.cavelier@free.fr>
// This program is free software. It comes without any warranty, to
// the extent permitted by applicable law. You can redistribute it
// and/or modify it under the terms of the Do What The Fuck You Want
// To Public License, Version 2, as published by Sam Hocevar. See
// http://www.wtfpl.net/ for more details.

// keywords: js, javascript, native, object deep parse

/*jslint indent: 2, maxlen: 80 */

"use strict";

/**
 * objectParse(object[, replacer]): Any
 *
 * Parses an object as JSON.stringify, but `objectParse` does convert to
 * anything. `replacer` function can be added to replace values to another just
 * by returning the replaced value.
 *
 * `replacer` parameters:
 *
 * - key The key of the parent object/array
 * - value The parsed value
 *
 * @param  {Any} object The object to parse
 * @param  {Function} replacer The function to convert parsed values
 * @return {Any} The original object or its replaced value
 */
function objectParse(object, replacer) {
  function objectParseRec(key, value) {
    if (typeof replacer === "function") {
      value = replacer(key, value);
    }
    var i, l, array;
    if (Array.isArray(value)) {
      for (i = 0; i < value.length; i += 1) {
        value[i] = objectParseRec(i, value[i]);
      }
      return value;
    }
    if (typeof value === "object" && value !== null) {
      array = Object.keys(value);
      for (i = 0, l = array.length; i < l; i += 1) {
        key = array[i];
        value[key] = objectParseRec(key, value[key]);
      }
      return value;
    }
    return value;
  }
  return objectParseRec('', object, []);
}

//////////////////////////////////////////////////////////////////////
// Tests
if (!module.parent) {
  (function () {
    var o, inspect = require("util").inspect;
    function numberToString(key, value) {
      /*jslint unparam: true */
      if (typeof value === "number") {
        return value.toString();
      }
      return value;
    }

    o = {
      "lol": ['a', 2, 'c'],
      "2": 2
    };
    objectParse(o, numberToString);
    console.log(inspect(o) === "{ '2': '2', lol: [ 'a', '2', 'c' ] }");
    o = objectParse(2, numberToString);
    console.log(o === "2");
  }());
}
