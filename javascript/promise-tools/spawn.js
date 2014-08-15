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

  /**
   *     spawn(generator): Promise< returned_value >
   *
   * Use generator function to do asynchronous operations sequentialy using
   * `yield` operator.
   *
   *     spawn(function* () {
   *       try {
   *         var config = yield getConfig();
   *         config.enableSomething = true;
   *         yield sleep(1000);
   *         yield putConfig(config);
   *       } catch (e) {
   *         console.error(e);
   *       }
   *     });
   *
   * @param  {Function} generator A generator function.
   * @return {Promise} A new cancellable promise
   */
  function spawn(generator) {
    var promise;
    return new root.Promise(function (done, fail) {
      var g = generator(), prev_value, next = {};
      function rec(method) {
        try {
          next = g[method](prev_value);
        } catch (e) {
          return fail(e);
        }
        if (next.done) {
          return done(next.value);
        }
        promise = next.value;
        if (!promise || typeof promise.then !== "function") {
          // The value is not a thenable. However, the user used `yield`
          // anyway. It means he wants to left hand to another process.
          promise = new root.Promise(function (d) { d(promise); });
        }
        return promise.then(function (a) {
          prev_value = a;
          rec("next");
        }, function (e) {
          prev_value = e;
          rec("throw");
        });
      }
      rec("next");
    });
  }

  root.spawn = spawn;

  //////////////////////////////////////////////////////////////////////

  /**
   * Prepare `toScript` function to export easily this library as a string.
   */
  Object.defineProperty(spawn, "toScript", {
    "configurable": true,
    "enumerable": false,
    "writable": true,
    "value": function () {
      return "(" + factory.toString() + "(this));\n";
    }
  });

}(this));
