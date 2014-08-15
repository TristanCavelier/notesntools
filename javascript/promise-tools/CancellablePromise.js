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

  /*jslint indent: 2, nomen: true */

  // dependency: Promise

  function CancellablePromise(executor, canceller) {
    this._canceller = canceller;
    this._promise = new root.Promise(executor);
  }

  CancellablePromise.prototype.then = function () {
    return this._promise.then.apply(this._promise, arguments);
  };

  CancellablePromise.prototype["catch"] = function () {
    return this._promise["catch"].apply(this._promise, arguments);
  };

  // just send a cancel signal
  CancellablePromise.prototype.cancel = function () {
    if (typeof this._canceller === "function") {
      try { this._canceller(); } catch (ignore) {}
      // return this;
    }
    // throw new Error("Cannot cancel this promise.");
    return this;
  };

  /**
   *     all(promises): Promise< promises_fulfilment_values >
   *     all(promises): Promise< one_rejected_reason >
   *
   * Produces a promise that is resolved when all the given `promises` are
   * fulfilled. The fulfillment value is an array of each of the fulfillment
   * values of the promise array.
   *
   * If one of the promises is rejected, the `all` promise will be rejected with
   * the same rejected reason, and the remaining unresolved promises recieve a
   * cancel signal.
   *
   * @param  {Array} promises An array of promises
   * @return {Promise} A promise
   */
  CancellablePromise.all = function (promises) {
    var length = promises.length;

    function onCancel() {
      var i;
      for (i = 0; i < promises.length; i += 1) {
        if (typeof promises[i].cancel === "function") {
          promises[i].cancel();
        }
      }
    }

    if (length === 0) {
      return new CancellablePromise(function (done) { done([]); });
    }

    return new CancellablePromise(function (resolve, reject) {
      var i, count = 0, results = [];
      function resolver(i) {
        return function (value) {
          count += 1;
          results[i] = value;
          if (count === length) {
            resolve(results);
          }
        };
      }

      function rejecter(err) {
        reject(err);
        onCancel();
      }

      for (i = 0; i < length; i += 1) {
        promises[i].then(resolver(i), rejecter);
      }
    }, onCancel);
  };

  /**
   *     race(promises): promise< first_value >
   *
   * Produces a promise that is fulfilled when any one of the given promises is
   * fulfilled. As soon as one of the promises is resolved, whether by being
   * fulfilled or rejected, all the promises receive a cancel signal.
   *
   * @param  {Array} promises An array of promises
   * @return {Promise} A promise
   */
  CancellablePromise.race = function (promises) {
    var length = promises.length;

    function onCancel() {
      var i;
      for (i = 0; i < promises.length; i += 1) {
        if (typeof promises[i].cancel === "function") {
          promises[i].cancel();
        }
      }
    }

    return new CancellablePromise(function (resolve, reject) {
      var i, ended = false;
      function resolver(value) {
        if (!ended) {
          ended = true;
          resolve(value);
          onCancel();
        }
      }

      function rejecter(err) {
        if (!ended) {
          ended = true;
          reject(err);
          onCancel();
        }
      }

      for (i = 0; i < length; i += 1) {
        promises[i].then(resolver, rejecter);
      }
    }, onCancel);
  };

  /**
   *     spawn(generator): CancellablePromise< returned_value >
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
   * @return {CancellablePromise} A new cancellable promise
   */
  CancellablePromise.spawn = function (generator) {
    var promise, cancelled;
    return new CancellablePromise(function (done, fail) {
      var g = generator(), prev_value, next = {};
      function rec(method) {
        if (cancelled) {
          return fail(new Error("Cancelled"));
        }
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
    }, function () {
      cancelled = true;
      if (promise && typeof promise.cancel === "function") {
        promise.cancel();
      }
    });
  };

  /**
   *     sequence(thenArray): CancellablePromise< returned_value >
   *
   * An alternative to `CancellablePromise.spawn`, but instead of using a
   * generator function, it uses an array of function like in then chains.
   * This function works with old ECMAScript version.
   *
   *     var config;
   *     sequence([function () {
   *       return getConfig();
   *     }, function (_config) {
   *       config = _config;
   *       config.enableSomething = true;
   *       return sleep(1000);
   *     }, function () {
   *       return putConfig(config);
   *     }, [null, function (e) {
   *       console.error(e);
   *     }]]);
   *
   * @param  {Array} thenArray An array of function.
   * @return {CancellablePromise} A new cancellable promise
   */
  CancellablePromise.sequence = function (array) {
    return CancellablePromise.spawn(function () {
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
  };

  //////////////////////////////////////////////////////////////////////

  /**
   * Prepare `toScript` function to export easily this library as a string.
   */
  Object.defineProperty(CancellablePromise, "toScript", {
    "configurable": true,
    "enumerable": false,
    "writable": true,
    "value": function () {
      return "(" + factory.toString() + "(this));\n";
    }
  });

}(this));
