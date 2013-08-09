//
// The MIT License (MIT)
//
// Copyright (c) 2013 Tristan Cavelier <t.cavelier@free.fr>
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.
//

/*jslint indent: 2, maxlen: 80, sloppy: true, nomen: true */
/*global Deferred, setInterval, setTimeout, clearInterval, clearTimeout */

// keywords: js, javascript, promise, commonjs

/**
 * Promise()
 *
 * @class Promise
 * @constructor
 */
function Promise() {
  this._onReject = [];
  this._onResolve = [];
  this._onProgress = [];
  this._state = "";
  this._answers = undefined;
}

/**
 * when(item): Promise
 *
 * Return an item as first parameter of the promise answer. If item is of
 * type Promise, the method will just return the promise. If item is of type
 * Deferred, the method will return the deferred promise.
 *
 *     Promise.when('a').then(console.log); // shows 'a'
 *
 * @method when
 * @static
 * @param  {Any} item The item to use
 * @return {Promise} The promise
 */
Promise.when = function (item) {
  if (item instanceof Promise) {
    return item;
  }
  if (typeof Deferred === 'function' && item instanceof Deferred) {
    return item.promise();
  }
  return new Promise().solver(function (solver) {
    solver.resolve(item);
  });
};

/**
 * execute(callback): Promise
 *
 * Execute the callback and use the returned value as promise answer.
 *
 *     Promise.execute(function () {
 *       return 'a';
 *     }).then(console.log); // shows 'a'
 *
 * @method execute
 * @static
 * @param  {Function} callback The callback to execute
 * @return {Promise} The promise
 */
Promise.execute = function (callback) {
  return new Promise().solver(function (solver) {
    try {
      solver.resolve(callback());
    } catch (e) {
      solver.reject(e);
    }
  });
};

/**
 * all(*items): Promise
 *
 * Resolve the promise only when item are resolved. The item type must be like
 * the item parameter of the `when` static method.
 *
 *     Promise.all(Promise.when('a'), 'b').then(console.log); // shows 'a b'
 *
 * @method all
 * @static
 * @param  {Any} *items The items to use
 * @return {Promise} The promise
 */
Promise.all = function () { // *promises
  var results = [], errors = [], count = 0, max, next = new Promise(), solver;
  max = arguments.length;
  solver = next.solver();
  function finished() {
    count += 1;
    if (count !== max) {
      return;
    }
    if (errors.length > 0) {
      return solver.reject.apply(next, errors);
    }
    return solver.resolve.apply(next, results);
  }
  Array.prototype.forEach.call(arguments, function (item, i) {
    Promise.when(item).done(function (answer) {
      results[i] = answer;
      return finished();
    }).fail(function (answer) {
      errors[i] = answer;
      return finished();
    });
  });
  return next;
};

/**
 * first(*items): Promise
 *
 * Resolve the promise only when one item is resolved. The item type must be
 * like the item parameter of the `when` static method.
 *
 *     Promise.first(Promise.delay(100), 'b').then(console.log); // shows 'b'
 *
 * @method first
 * @static
 * @param  {Any} *items The items to use
 * @return {Promise} The promise
 */
Promise.first = function () { // *promises
  var next = new Promise(), solver;
  solver = next.solver();
  function onSuccess() {
    solver.resolve.apply(next, arguments);
  }
  function onError() {
    solver.reject.apply(next, arguments);
  }
  Array.prototype.forEach.call(arguments, function (item) {
    Promise.when(item).done(onSuccess).fail(onError);
  });
  return next;
};

/**
 * delay(timeout[, every]): Promise
 *
 * Resolve the promise after `timeout` milliseconds and notfies us every `every`
 * milliseconds.
 *
 *     Promise.delay(50, 10).then(console.log, console.error, console.log);
 *     // // shows
 *     // 10 // from progress
 *     // 20 // from progress
 *     // 30 // from progress
 *     // 40 // from progress
 *     // 50 // from success
 *
 * @method delay
 * @static
 * @param  {Number} timeout In milliseconds
 * @param  {Number} [every] In milliseconds
 * @return {Promise} The promise
 */
Promise.delay = function (timeout, every) { // *promises
  var next = new Promise(), solver, ident, now = 0;
  solver = next.solver();
  if (typeof every === 'number' && !isNaN(every)) {
    ident = setInterval(function () {
      now += every;
      solver.notify(now);
    }, every);
  }
  setTimeout(function () {
    clearInterval(ident);
    solver.resolve(timeout);
  }, timeout);
  return next;
};

/**
 * timeout(item, timeout): Promise
 *
 * If the promise is not resolved after `timeout` milliseconds, it returns a
 * timeout error.
 *
 *     Promise.timeout('a', 100).then(console.log); // shows 'a'
 *
 *     Promise.timeout(Promise.delay(100), 10).then(console.log, console.error);
 *     // shows Error Timeout
 *
 * @method timeout
 * @static
 * @param  {Any} Item The item to use
 * @param  {Number} timeout In milliseconds
 * @return {Promise} The promise
 */
Promise.timeout = function (item, timeout) {
  var next = new Promise(), solver, i;
  solver = next.solver();
  i = setTimeout(function () {
    solver.reject.apply(next, [new Error("Timeout")]);
  }, timeout);
  Promise.when(item).done(function () {
    clearTimeout(i);
    solver.resolve.apply(next, arguments);
  }).fail(function () {
    clearTimeout(i);
    solver.reject.apply(next, arguments);
  });
  return next;
};

/**
 * solver([callback]): Promise
 *
 * Set the promise to the 'running' state. If `callback` is a function, then it
 * will be executed with a solver as first parameter and returns the promise.
 * Else it returns the promise solver.
 *
 * @method solver
 * @param  {Function} [callback] The callback to execute
 * @return {Promise,Object} The promise or the promise solver
 */
Promise.prototype.solver = function (callback) {
  var that = this;
  switch (this._state) {
  case "running":
  case "resolved":
  case "rejected":
    throw new Error("Promise().solver(): Already " + this._state);
  default:
    break;
  }
  function createSolver(promise) {
    return {
      "resolve": function () {
        if (promise._state !== "resolved" && promise._state !== "rejected") {
          promise._state = "resolved";
          promise._answers = arguments;
          promise._onResolve.forEach(function (callback) {
            setTimeout(function () {
              callback.apply(that, promise._answers);
            });
          });
          promise._onResolve = [];
          promise._onReject = [];
          promise._onProgress = [];
        }
      },
      "reject": function () {
        if (promise._state !== "resolved" && promise._state !== "rejected") {
          promise._state = "rejected";
          promise._answers = arguments;
          promise._onReject.forEach(function (callback) {
            setTimeout(function () {
              callback.apply(that, promise._answers);
            });
          });
          promise._onResolve = [];
          promise._onReject = [];
          promise._onProgress = [];
        }
      },
      "notify": function () {
        var answers = arguments;
        promise._onProgress.forEach(function (callback) {
          callback.apply(that, answers);
        });
      }
    };
  }
  this._state = "running";
  if (typeof callback === 'function') {
    setTimeout(function () {
      callback(createSolver(that));
    });
    return this;
  }
  return createSolver(this);
};

Promise.prototype.then = function (onSuccess, onError, onProgress) {
  var next = new Promise(), that = this;
  switch (this._state) {
  case "resolved":
    if (typeof onSuccess === 'function') {
      next.solver(function (resolver) {
        try {
          resolver.resolve(onSuccess.apply(that, that._answers));
        } catch (e) {
          resolver.reject(e);
        }
      });
    }
    break;
  case "rejected":
    if (typeof onError === 'function') {
      next.solver(function (resolver) {
        try {
          resolver.resolve(onError.apply(that, that._answers));
        } catch (e) {
          resolver.reject(e);
        }
      });
    }
    break;
  default:
    if (typeof onSuccess === 'function') {
      this._onResolve.push(function () {
        var answers = arguments;
        next.solver(function (resolver) {
          try {
            resolver.resolve(onSuccess.apply(that, answers));
          } catch (e) {
            resolver.reject(e);
          }
        });
      });
    }
    if (typeof onError === 'function') {
      this._onReject.push(function () {
        var answers = arguments;
        next.solver(function (resolver) {
          try {
            resolver.resolve(onError.apply(that, answers));
          } catch (e) {
            resolver.reject(e);
          }
        });
      });
    }
    if (typeof onProgress === 'function') {
      this._onProgress.push(onProgress);
    }
    break;
  }
  return next;
};

Promise.prototype.done = function (callback) {
  var that = this;
  if (typeof callback !== 'function') {
    return this;
  }
  switch (this._state) {
  case "resolved":
    setTimeout(function () {
      callback.apply(that, that._answers);
    });
    break;
  default:
    this._onResolve.push(callback);
    break;
  }
  return this;
};

Promise.prototype.fail = function (callback) {
  var that = this;
  if (typeof callback !== 'function') {
    return this;
  }
  switch (this._state) {
  case "rejected":
    setTimeout(function () {
      callback.apply(that, that._answers);
    });
    break;
  default:
    this._onReject.push(callback);
    break;
  }
  return this;
};

Promise.prototype.progress = function (callback) {
  if (typeof callback !== 'function') {
    return this;
  }
  switch (this._state) {
  case "rejected":
  case "resolved":
    break;
  default:
    this._onProgress.push(callback);
    break;
  }
  return this;
};

Promise.prototype.always = function (callback) {
  var that = this;
  if (typeof callback !== 'function') {
    return this;
  }
  switch (this._state) {
  case "resolved":
  case "rejected":
    setTimeout(function () {
      callback.apply(that, that._answers);
    });
    break;
  default:
    that._onReject.push(callback);
    that._onResolve.push(callback);
    break;
  }
  return this;
};


function Deferred() {
  this._promise = new Promise();
  this._solver = this._promise.solver();
}

Deferred.prototype.resolve = function () {
  this._solver.resolve.apply(this._solver, arguments);
};

Deferred.prototype.reject = function () {
  this._solver.reject.apply(this._solver, arguments);
};

Deferred.prototype.notify = function () {
  this._solver.notify.apply(this._solver, arguments);
};

Deferred.prototype.promise = function () {
  return this._promise;
};

////////////////////////////////////////////////////////////////////////////////
exports.Promise = Promise;
exports.Deferred = Deferred;
// /////////////////////////////////////////////////////////////////////////////
// // Tests

// var one = new Promise().solver(function (r) {
//   r.notify(1);
//   r.notify(2);
//   r.resolve('a');
//   r.notify(3);
// }).progress(function (answer) {
//   console.log('progress', answer);
// });

// var two = one.then(function (answer) {
//   console.log(1, answer);
//   return answer + 'b';
// });

// two.then(function (answer) {
//   console.log(2, answer);
//   return answer + 'c';
// }).done(function (answer) {
//   console.log('done', answer);
// });

// setTimeout(function () {
//   one.then(function (answer) {
//     console.log(3, answer);
//   });
//   one.done(function (answer) {
//     console.log(4, answer);
//   });
// }, 100);

// ////////////////////////////////////////

// function onDone(answer) {
//   console.log('done', answer);
// }

// function onFail(answer) {
//   console.log('fail', answer);
// }

// function nThen(answer) {
//   console.log('nThen', answer);
//   if (answer === 13) {
//     throw new Error('13 is 13!');
//   }
//   return answer + 1;
// }

// function errThen(answer) {
//   console.log('errThen', answer);
// }

// function execute() {
//   var d = new Deferred();
//   d.resolve(12);
//   return d.promise();
// }

// var p = execute();

// p.then(nThen, errThen).then(nThen, errThen).done(onDone).fail(onFail);
// p.done(onDone).then(nThen, errThen);

////////////////////////////////////////

// function onsuccess() {
//   console.log('success', arguments);
// }
// function onprogress() {
//   console.log('progress', arguments);
// }
// function onerror() {
//   console.log('error', arguments);
// }

// Promise.when('lol').done(onsuccess);

// Promise.execute(function () {
//   return 12;
// }).done(onsuccess, onerror);

// Promise.all(Promise.execute(function () {
//   return 1;
// }), Promise.execute(function () {
//   return 2;
// })).done(onsuccess);

// Promise.delay(1000, 100).done(onsuccess).progress(onprogress);

// Promise.when(Promise.delay(100)).done(onsuccess);

// Promise.first(Promise.delay(100), Promise.execute(function () {
//   return 2;
// })).done(onsuccess);

// Promise.timeout(Promise.delay(100), 1000).done(onsuccess).fail(onerror);
// Promise.timeout(Promise.delay(1000), 100).done(onsuccess).fail(onerror);

// /////////////////////////////////////////////////////////////////////////////
// // Tests Deferred

// var p = (function () {
//   var d = new Deferred();
//   d.notify(1);
//   setTimeout(function () {
//     d.notify(2);
//     d.resolve('a');
//   });
//   return d.promise();
// }());

// p.progress(function () {
//   console.log('progress', arguments);
// });

// p.then(function () {
//   console.log('then', arguments);
// });
