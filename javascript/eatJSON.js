/*jslint indent: 2 */
(function factory(root) {
  "use strict";

  /*
   Copyright (c) 2014 Tristan Cavelier <t.cavelier@free.fr>

   This program is free software. It comes without any warranty, to
   the extent permitted by applicable law. You can redistribute it
   and/or modify it under the terms of the Do What The Fuck You Want
   To Public License, Version 2, as published by Sam Hocevar. See
   below for more details.

   ___________________________________________________________________
  |                                                                   |
  |           DO WHAT THE FUCK YOU WANT TO PUBLIC LICENSE             |
  |                   Version 2, December 2004                        |
  |                                                                   |
  |Copyright (C) 2004 Sam Hocevar <sam@hocevar.net>                   |
  |                                                                   |
  |Everyone is permitted to copy and distribute verbatim or modified  |
  |copies of this license document, and changing it is allowed as long|
  |as the name is changed.                                            |
  |                                                                   |
  |           DO WHAT THE FUCK YOU WANT TO PUBLIC LICENSE             |
  |  TERMS AND CONDITIONS FOR COPYING, DISTRIBUTION AND MODIFICATION  |
  |                                                                   |
  | 0. You just DO WHAT THE FUCK YOU WANT TO.                         |
  |___________________________________________________________________|

  */

  /*jslint indent: 2, nomen: true, vars: true, regexp: true, ass: true */

  // Implemented from: http://www.json.org/
  // Version: 2014-08-18

  var objectHasOwnProperty = Function.prototype.call.bind(Object.prototype.hasOwnProperty);

  var eat = {};

  var reStrJSONExp = "(?:[eE][\\-\\+]?[0-9]+)";
  var reStrJSONFrac = "(?:\\.[0-9]+)";
  var reStrJSONInt = "(?:-?(?:[1-9][0-9]*|[0-9]))";
  var reStrJSONNumber = "(?:" + reStrJSONInt + "(?:" + reStrJSONFrac + reStrJSONExp + "?|" + reStrJSONExp + "|))";
  var reStrJSONChar = "(?:[^\\x00-\\x1F\\x7F\"\\\\]|\\\\[\"\\\\/bfnrt]|\\\\u[0-9]{4})";
  var reStrJSONString = "(?:\"" + reStrJSONChar + "*\")";

  eat.JSONObject = function (text) {
    var tmp, original = text, object = {};
    if (text[0] !== "{") { return null; }
    text = text.replace(/^\{\s*/, "");
    if ((tmp = eat.JSONPair(text)) !== null) {
      object[tmp.object.key] = tmp.object.value;
      text = text.slice(tmp[0].length).replace(/^\s*/, "");
      while (text[0] === ",") {
        text = text.replace(/^,\s*/, "");
        if ((tmp = eat.JSONPair(text)) === null) { return null; }
        if (objectHasOwnProperty(object, tmp.object.key)) {
          return null; // same key found
        }
        object[tmp.object.key] = tmp.object.value;
        text = text.slice(tmp[0].length).replace(/^\s*/, "");
      }
    }
    if (text[0] !== "}") { return null; }
    tmp = [original.slice(0, original.length - text.length + 1)];
    tmp.object = object;
    tmp.index = 0;
    tmp.input = original;
    return tmp;
  };

  eat.JSONPair = function (text) {
    var tmp, original = text, object = {};
    if ((tmp = eat.JSONString(text)) === null) { return null; }
    object.key = tmp.object;
    text = text.slice(tmp[0].length).replace(/^\s*/, "");
    if (text[0] !== ":") { return null; }
    text = text.replace(/^:\s*/, "");
    if ((tmp = eat.JSONValue(text)) === null) { return null; }
    object.value = tmp.object;
    tmp = [original.slice(0, original.length - text.length + tmp[0].length)];
    tmp.object = object;
    tmp.index = 0;
    tmp.input = original;
    return tmp;
  };

  eat.JSONArray = function (text) {
    var tmp, original = text, object = [];
    if (text[0] !== "[") { return null; }
    text = text.replace(/^\[\s*/, "");
    if ((tmp = eat.JSONValue(text)) !== null) {
      object.push(tmp.object);
      text = text.slice(tmp[0].length).replace(/^\s*/, "");
      while (text[0] === ",") {
        text = text.replace(/^,\s*/, "");
        if ((tmp = eat.JSONValue(text)) === null) { return null; }
        object.push(tmp.object);
        text = text.slice(tmp[0].length).replace(/^\s*/, "");
      }
    }
    if (text[0] !== "]") { return null; }
    tmp = [original.slice(0, original.length - text.length + 1)];
    tmp.object = object;
    tmp.index = 0;
    tmp.input = original;
    return tmp;
  };

  eat.JSONValue = function (text) {
    var tmp;
    if ((tmp = (eat.JSONString(text) || eat.JSONNumber(text) || eat.JSONObject(text) || eat.JSONArray(text))) !== null) {
      return tmp;
    }
    if ((tmp = (/^true/).exec(text)) !== null) {
      tmp.object = true;
    } else if ((tmp = (/^false/).exec(text)) !== null) {
      tmp.object = false;
    } else if ((tmp = (/^null/).exec(text)) !== null) {
      tmp.object = null;
    }
    return tmp;
  };

  var reJSONString = new RegExp("^" + reStrJSONString);
  eat.JSONString = function (text) {
    var tmp = reJSONString.exec(text);
    if (tmp === null) { return null; }
    tmp.object = JSON.parse(tmp[0]); // don't want to reimplement instanciation
    return tmp;
  };

  var reJSONNumber = new RegExp("^" + reStrJSONNumber);
  eat.JSONNumber = function (text) {
    var tmp = reJSONNumber.exec(text);
    if (tmp === null) { return null; }
    tmp.object = JSON.parse(tmp[0]); // don't want to reimplement instanciation
    return tmp;
  };

  ////////////////////////////////////////////////

  function remain(output) {
    if (output === null) { return null; }
    return output.input.slice(output[0].length);
  }

  root.console.log(eat.JSONValue('"test"').object === "test");
  root.console.log(eat.JSONValue('13e-2').object === 13e-2);
  root.console.log(eat.JSONValue('true').object === true);
  root.console.log(JSON.stringify(eat.JSONValue('{ "test" : "retest" }').object) === JSON.stringify({"test": "retest"}));
  root.console.log(JSON.stringify(eat.JSONValue('[ "test" , "retest" ]').object) === JSON.stringify(["test", "retest"]));
  root.console.log(eat.JSONValue(remain(eat.JSONValue('"hello""world"'))).object === "world");

}(this));
