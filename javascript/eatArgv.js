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

  var eat = {};

  eat.argvUnquotedChar = function (text) {
    var tmp;
    if ((tmp = /^[^\s"'\\]/.exec(text)) !== null) {
      tmp.object = tmp[0];
    } else if ((tmp = /^\\./.exec(text)) !== null) {
      tmp.object = tmp[0][1];
    } else if ((tmp = /^\\\n/.exec(text)) !== null) {
      tmp.object = "";
    }
    return tmp;
  };

  eat.argvUnquotedString = function (text) {
    var tmp, original = text, object = "";
    while ((tmp = eat.argvUnquotedChar(text)) !== null) {
      text = text.slice(tmp[0].length);
      object += tmp.object;
    }
    if (object) {
      tmp = [original.slice(0, original.length - text.length)];
      tmp.object = object;
      tmp.index = 0;
      tmp.input = original;
      return tmp;
    }
    return null;
  };

  eat.argvDoubleQuotedChar = function (text) {
    var tmp;
    if ((tmp = /^[^"\\]/.exec(text)) !== null) {
      tmp.object = tmp[0];
    } else if ((tmp = /^\\"/.exec(text)) !== null) {
      tmp.object = "\"";
    } else if ((tmp = /^\\./.exec(text)) !== null) {
      tmp.object = tmp[0];
    } else if ((tmp = /^\\\n/.exec(text)) !== null) {
      tmp.object = "";
    }
    return tmp;
  };

  eat.argvDoubleQuotedString = function (text) {
    var tmp, original = text, object = "";
    if (text[0] !== "\"") { return null; }
    text = text.slice(1);
    while ((tmp = eat.argvDoubleQuotedChar(text)) !== null) {
      text = text.slice(tmp[0].length);
      object += tmp.object;
    }
    if (text[0] !== "\"") { return null; }
    tmp = [original.slice(0, original.length - text.length + 1)];
    tmp.object = object;
    tmp.index = 0;
    tmp.input = original;
    return tmp;
  };

  eat.argvSimpleQuotedChar = function (text) {
    var tmp;
    if ((tmp = /^[^']/.exec(text)) !== null) {
      tmp.object = tmp[0];
    }
    return tmp;
  };

  eat.argvSimpleQuotedString = function (text) {
    var tmp, original = text, object = "";
    if (text[0] !== "'") { return null; }
    text = text.slice(1);
    while ((tmp = eat.argvSimpleQuotedChar(text)) !== null) {
      text = text.slice(tmp[0].length);
      object += tmp.object;
    }
    if (text[0] !== "'") { return null; }
    tmp = [original.slice(0, original.length - text.length + 1)];
    tmp.object = object;
    tmp.input = original;
    return tmp;
  };

  eat.argv = function (text) {
    var tmp, original = text, object = "", found;
    text = text.replace(/^\s*/, "");
    while ((tmp = eat.argvUnquotedString(text)) !== null ||
           (tmp = eat.argvDoubleQuotedString(text)) !== null ||
           (tmp = eat.argvSimpleQuotedString(text)) !== null) {
      text = text.slice(tmp[0].length);
      object += tmp.object;
      found = true;
    }
    if (found) {
      tmp = [original.slice(0, original.length - text.length)];
      tmp.object = object;
      tmp.index = 0;
      tmp.input = original;
    }
    return tmp;
  };

  ////////////////////////////////////////////////

  function remain(output) {
    if (output === null) { return null; }
    return output.input.slice(output[0].length);
  }

  root.console.log(eat.argv("test").object === "test");
  root.console.log(eat.argv("\"test\"").object === "test");
  root.console.log(eat.argv("'test'").object === "test");
  root.console.log(eat.argv("\\'test\\\"").object === "'test\"");
  root.console.log(eat.argv("t'e'\"s\"t").object === "test");
  root.console.log(eat.argv("t'e'\"s\"t").object === "test");
  root.console.log(eat.argv("test yeah").object === "test");
  root.console.log(eat.argv("'test yeah'").object === "test yeah");
  root.console.log(eat.argv("test\\ yeah").object === "test yeah");
  root.console.log(eat.argv("test\\\nyeah").object === "testyeah");
  root.console.log(eat.argv("test\\  yeah").object === "test ");
  root.console.log(eat.argv(remain(eat.argv("test yeah"))).object === "yeah");
  root.console.log(eat.argv(remain(eat.argv("test\nyeah"))).object === "yeah");
  root.console.log(eat.argv(remain(eat.argv("test\tyeah"))).object === "yeah");

}(this));
