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
/*global */

// keywords: js, javascript, promise, commonjs

function Promise() {
  this._onReject = [];
  this._onResolve = [];
  this._onProgress = [];
  this._state = "";
  this._answers = undefined;
}

Promise.when = function (callback) {
  return new Promise().solver(function (solver) {
    try {
      solver.resolve(callback());
    } catch (e) {
      solver.reject(e);
    }
  });
};

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
  Array.prototype.forEach.call(arguments, function (promise, i) {
    promise.done(function (answer) {
      results[i] = answer;
      return finished();
    }).fail(function (answer) {
      errors[i] = answer;
      return finished();
    });
  });
  return next;
};

Promise.first = function () { // *promises
  var next = new Promise(), solver;
  solver = next.solver();
  function onSuccess() {
    solver.resolve.apply(next, arguments);
  }
  function onError() {
    solver.reject.apply(next, arguments);
  }
  Array.prototype.forEach.call(arguments, function (promise, i) {
    promise.done(onSuccess).fail(onError);
  });
  return next;
};

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

Promise.timeout = function (promise, timeout) {
  var next = new Promise(), solver, i;
  solver = next.solver();
  i = setTimeout(function () {
    solver.reject.apply(next, [new Error("Timeout")]);
  }, timeout);
  promise.done(function () {
    clearTimeout(i);
    solver.resolve.apply(next, arguments);
  }).fail(function () {
    clearTimeout(i);
    solver.reject.apply(next, arguments);
  });
  return next;
};

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

// Promise.when(function () {
//   return 12;
// }).done(onsuccess, onerror);

// Promise.all(Promise.when(function () {
//   return 1;
// }), Promise.when(function () {
//   return 2;
// })).done(onsuccess);

// Promise.delay(1000, 100).done(onsuccess).progress(onprogress);

// Promise.first(Promise.delay(100), Promise.when(function () {
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
