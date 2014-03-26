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

function jsonId(value, replacer) {
  function jsonIdRec(key, value) {
    var i, l, res;
    if (typeof value === "object" && value !== null &&
        typeof value.toJSON === "function") {
      value = value.toJSON();
    }
    if (typeof replacer === "function") {
      value = replacer(key, value);
    }

    if (Array.isArray(value)) {
      res = [];
      for (i = 0; i < value.length; i += 1) {
        res[res.length] = jsonIdRec(i, value[i]);
        if (res[res.length - 1] === undefined) {
          res[res.length - 1] = "null";
        }
      }
      return "[" + res.join(",") + "]";
    }
    if (typeof value === "object" && value !== null) {
      res = Object.keys(value).sort();
      for (i = 0, l = res.length; i < l; i += 1) {
        key = res[i];
        res[i] = jsonIdRec(key, value[key]);
        if (res[i] !== undefined) {
          res[i] = JSON.stringify(key) + ":" + res[i];
        } else {
          res.splice(i, 1);
          l -= 1;
          i -= 1;
        }
      }
      return "{" + res.join(",") + "}";
    }
    return JSON.stringify(value);
  }
  return jsonIdRec("", value);
}

/////////////////////////////////////////////////////////////////////////////
// Visual tests

function onsuccess(arg) {
  console.log(typeof arg, arg);
}

onsuccess(jsonId(undefined));
onsuccess(jsonId(null));
onsuccess(jsonId("lol"));
onsuccess(jsonId(NaN));
onsuccess(jsonId(1));
onsuccess(jsonId(new Date()));

onsuccess(jsonId([NaN, "lol", false, null, undefined, new Date(), 1]));


onsuccess(jsonId({
  "NaN": NaN,
  "lol": "lol",
  "null": null,
  "false": false,
  "undefined": undefined,
  "Date": new Date(),
  "regexp": /regexp/gi,
  "1": 1,
  "function": function () { return; }
}));

onsuccess(jsonId({"a": "b"}, function (key, value) {
  if (key === "a") {
    return value + key + "c";
  }
  return value;
}));
