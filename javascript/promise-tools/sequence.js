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

  /*jslint indent: 2 */

  // dependency: spawn

  function sequence(array) {
    return root.spawn(function () {
      var i = 0, g;
      function exec(f, value) {
        try {
          value = f(value);
          if (i === array.length) {
            return {"done": true, "value": value};
          }
          return {"value": value};
        } catch (e) {
          return g["throw"](e);
        }
      }
      g = {
        "next": function (value) {
          var f;
          while (i < array.length) {
            if (Array.isArray(array[i])) {
              f = array[i][0];
            } else {
              f = array[i];
            }
            if (typeof f === "function") {
              i += 1;
              return exec(f, value);
            }
            i += 1;
          }
          return {"done": true, "value": value};
        },
        "throw": function (value) {
          var f;
          while (i < array.length) {
            if (Array.isArray(array[i])) {
              f = array[i][1];
            }
            if (typeof f === "function") {
              i += 1;
              return exec(f, value);
            }
            i += 1;
          }
          throw value;
        }
      };
      return g;
    });
  }

  root.sequence = sequence;

  //////////////////////////////////////////////////////////////////////

  /**
   * Prepare `toScript` function to export easily this library as a string.
   */
  Object.defineProperty(sequence, "toScript", {
    "configurable": true,
    "enumerable": false,
    "writable": true,
    "value": function () {
      return "(" + factory.toString() + "(this));\n";
    }
  });

}(this));
