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
  function update(a, b) {
    /*jslint forin: true */
    var k;
    for (k in b) { a[k] = b[k]; }
    return a;
  }


  var eat = {};

  var reStrJSONExp = "(?:[eE][\\-\\+]?[0-9]+)";
  var reStrJSONFrac = "(?:\\.[0-9]+)";
  var reStrJSONInt = "(?:-?(?:[1-9][0-9]*|[0-9]))";
  var reStrJSONNumber = "(?:" + reStrJSONInt + "(?:" + reStrJSONFrac + reStrJSONExp + "?|" + reStrJSONExp + "|))";
  var reStrJSONChar = "(?:[^\\x00-\\x1F\\x7F\"\\\\]|\\\\[\"\\\\/bfnrt]|\\\\u[0-9]{4})";
  var reStrJSONString = "(?:\"" + reStrJSONChar + "*\")";

  var reEatWhiteSpacesIfThere = /^(\s*)(.*)/;
  eat.JSONObject = function (text) {
    var tmp, tmp2, object = {};
    if ((tmp = (/^(\{)(.*)/).exec(text)) === null) { return null; }
    tmp = reEatWhiteSpacesIfThere.exec(tmp[2]);
    if ((tmp2 = (/^(\})(.*)/).exec(tmp[2])) !== null) {
      return update([text, text.slice(0, -tmp2[2].length), tmp2[2]], {"object": {}, "input": text, "index": 0});
    }
    if ((tmp = eat.JSONPair(tmp[2])) === null) { return null; }
    object[tmp.object.key] = tmp.object.value;
    tmp = reEatWhiteSpacesIfThere.exec(tmp[2]);
    while ((tmp2 = (/^(,)(.*)/).exec(tmp[2])) !== null) {
      tmp2 = reEatWhiteSpacesIfThere.exec(tmp2[2]);
      if ((tmp = eat.JSONPair(tmp2[2])) === null) { return null; }
      if (objectHasOwnProperty(object, tmp.object.key)) {
        return null; // same key found
      }
      object[tmp.object.key] = tmp.object.value;
      tmp = reEatWhiteSpacesIfThere.exec(tmp[2]);
    }
    if ((/^(\})(.*)/).exec(tmp[2]) === null) { return null; }
    return update([text, text.slice(0, -tmp[2].length), tmp[2]], {"object": object, "input": text, "index": 0});
  };

  eat.JSONPair = function (text) {
    var tmp, object = {};
    if ((tmp = eat.JSONString(text)) === null) { return null; }
    object.key = tmp.object;
    tmp = reEatWhiteSpacesIfThere.exec(tmp[2]);
    if ((tmp = (/^(:)(.*)/).exec(tmp[2])) === null) { return null; }
    tmp = reEatWhiteSpacesIfThere.exec(tmp[2]);
    if ((tmp = eat.JSONValue(tmp[2])) === null) { return null; }
    object.value = tmp.object;
    return update([text, text.slice(0, -tmp[2].length), tmp[2]], {"object": object, "input": text, "index": 0});
  };

  eat.JSONArray = function (text) {
    var tmp, tmp2, object = [];
    if ((tmp = (/^(\[)(.*)/).exec(text)) === null) { return null; }
    tmp = reEatWhiteSpacesIfThere.exec(tmp[2]);
    if ((tmp2 = (/^(\])(.*)/).exec(tmp[2])) !== null) {
      return update([text, text.slice(0, -tmp2[2].length), tmp2[2]], {"object": [], "input": text, "index": 0});
    }
    if ((tmp = eat.JSONValue(tmp[2])) === null) { return null; }
    object.push(tmp.object);
    tmp = reEatWhiteSpacesIfThere.exec(tmp[2]);
    while ((tmp2 = (/^(,)(.*)/).exec(tmp[2])) !== null) {
      tmp2 = reEatWhiteSpacesIfThere.exec(tmp2[2]);
      if ((tmp = eat.JSONValue(tmp2[2])) === null) { return null; }
      object.push(tmp.object);
      tmp = reEatWhiteSpacesIfThere.exec(tmp[2]);
    }
    if ((/^(\])(.*)/).exec(tmp[2]) === null) { return null; }
    return update([text, text.slice(0, -tmp[2].length), tmp[2]], {"object": object, "input": text, "index": 0});
  };

  eat.JSONValue = function (text) {
    var tmp;
    if ((tmp = (eat.JSONString(text) || eat.JSONNumber(text) || eat.JSONObject(text) || eat.JSONArray(text))) !== null) {
      return tmp;
    }
    if ((tmp = (/^(true)(.*)/).exec(text)) !== null) {
      tmp.object = true;
    } else if ((tmp = (/^(false)(.*)/).exec(text)) !== null) {
      tmp.object = false;
    } else if ((tmp = (/^(null)(.*)/).exec(text)) !== null) {
      tmp.object = null;
    }
    return tmp;
  };

  var reJSONString = new RegExp("^(" + reStrJSONString + ")(.*)");
  eat.JSONString = function (text) {
    var tmp = reJSONString.exec(text);
    if (tmp === null) { return null; }
    tmp.object = JSON.parse(tmp[1]); // don't want to reimplement instanciation
    return tmp;
  };

  var reJSONNumber = new RegExp("^(" + reStrJSONNumber + ")(.*)");
  eat.JSONNumber = function (text) {
    var tmp = reJSONNumber.exec(text);
    if (tmp === null) { return null; }
    tmp.object = JSON.parse(tmp[1]); // don't want to reimplement instanciation
    return tmp;
  };

  ////////////////////////////////////////////////

  root.console.log(eat.JSONValue('"test"').object === "test");
  root.console.log(eat.JSONValue('13e-2').object === 13e-2);
  root.console.log(eat.JSONValue('true').object === true);
  root.console.log(JSON.stringify(eat.JSONValue('{ "test" : "retest" }').object) === JSON.stringify({"test": "retest"}));
  root.console.log(JSON.stringify(eat.JSONValue('[ "test" , "retest" ]').object) === JSON.stringify(["test", "retest"]));

}(this));
