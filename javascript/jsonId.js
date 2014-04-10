// Copyright (c) 2014 Tristan Cavelier <t.cavelier@free.fr>
// This program is free software. It comes without any warranty, to
// the extent permitted by applicable law. You can redistribute it
// and/or modify it under the terms of the Do What The Fuck You Want
// To Public License, Version 2, as published by Sam Hocevar. See
// http://www.wtfpl.net/ for more details.

/*jslint indent: 2, maxlen: 80 */
/*global */

"use strict";

// keywords: js, javascript, sorted ordered unique json, stringify, parse

function concatStringNTimes(string, n) {
  var res = "";
  while (--n >= 0) { res += string; }
  return res;
}

function jsonId(value, replacer, space) {
  var indent, key_value_space = "";
  if (typeof space === "string") {
    if (space !== "") {
      indent = space;
      key_value_space = " ";
    }
  } else if (typeof space === "number") {
    if (isFinite(space) && space > 0) {
      indent = concatStringNTimes(" ", space);
      key_value_space = " ";
    }
  }

  function jsonIdRec(key, value, deep) {
    var i, l, res, my_space;
    if (typeof value === "object" && value !== null &&
        typeof value.toJSON === "function") {
      value = value.toJSON();
    }
    if (typeof replacer === "function") {
      value = replacer(key, value);
    }

    if (indent) {
      my_space = concatStringNTimes(indent, deep);
    }
    if (Array.isArray(value)) {
      res = [];
      for (i = 0; i < value.length; i += 1) {
        res[res.length] = jsonIdRec(i, value[i], deep + 1);
        if (res[res.length - 1] === undefined) {
          res[res.length - 1] = "null";
        }
      }
      if (res.length === 0) { return "[]"; }
      if (indent) {
        return "[\n" + my_space + indent +
          res.join(",\n" + my_space + indent) +
          "\n" + my_space + "]";
      }
      return "[" + res.join(",") + "]";
    }
    if (typeof value === "object" && value !== null) {
      if (Array.isArray(replacer)) {
        res = replacer.reduce(function (p, c) {
          p.push(c);
          return p;
        }, []);
      } else {
        res = Object.keys(value);
      }
      res.sort();
      for (i = 0, l = res.length; i < l; i += 1) {
        key = res[i];
        res[i] = jsonIdRec(key, value[key], deep + 1);
        if (res[i] !== undefined) {
          res[i] = JSON.stringify(key) + ":" + key_value_space + res[i];
        } else {
          res.splice(i, 1);
          l -= 1;
          i -= 1;
        }
      }
      if (res.length === 0) { return "{}"; }
      if (indent) {
        return "{\n" + my_space + indent +
          res.join(",\n" + my_space + indent) +
          "\n" + my_space + "}";
      }
      return "{" + res.join(",") + "}";
    }
    return JSON.stringify(value);
  }
  return jsonIdRec("", value, 0);
}

/////////////////////////////////////////////////////////////////////////////
// Visual tests

console.log(jsonId(undefined) === undefined);
console.log(jsonId(null) === 'null');
console.log(jsonId("lol") === '"lol"');
console.log(jsonId(NaN) === 'null');
console.log(jsonId(1) === '1');
console.log(jsonId(new Date(0)) === '"1970-01-01T00:00:00.000Z"');

console.log(jsonId([NaN, "lol", false, null, undefined, new Date(0), 1]) ===
            '[null,"lol",false,null,null,"1970-01-01T00:00:00.000Z",1]');

console.log(
  jsonId({
    "NaN": NaN,
    "lol": "lol",
    "null": null,
    "false": false,
    "undefined": undefined,
    "Date": new Date(0),
    "regexp": /regexp/gi,
    "1": 1,
    "function": function () { return; },
    "jsonablefunction": (function () {
      var f = function () { return; };
      f.toJSON = function () { return "jsonablefunction"; };
      return f;
    }()),
    "array": ["a", "b", {"c": "d"}],
    "object": {"ob": "ject"},
    "jsonableobject": {"toJSON": function () {
      return "jsonableobject";
    }},
  }, null, 2) ===
    '{\n' +
    '  "1": 1,\n' +
    '  "Date": "1970-01-01T00:00:00.000Z",\n' +
    '  "NaN": null,\n' +
    '  "array": [\n' +
    '    "a",\n' +
    '    "b",\n' +
    '    {\n' +
    '      "c": "d"\n' +
    '    }\n' +
    '  ],\n' +
    '  "false": false,\n' +
    '  "jsonablefunction": "jsonablefunction",\n' +
    '  "jsonableobject": "jsonableobject",\n' +
    '  "lol": "lol",\n' +
    '  "null": null,\n' +
    '  "object": {\n' +
    '    "ob": "ject"\n' +
    '  },\n' +
    '  "regexp": {}\n' +
    '}'
);

console.log(jsonId({"a": "b"}, function (key, value) {
  if (key === "a") {
    return value + key + "c";
  }
  return value;
}) === '{"a":"bac"}');

console.log(jsonId({"a": "b", "c": "d"}, ["a"]) === '{"a":"b"}');
