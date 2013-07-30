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

// keywords: js, javascript, promise, commonjs

function Promise() {
  this._onReject = [];
  this._onResolve = [];
  this._onProgress = [];
  this._state = "";
  this._answer = undefined;
}

Promise.prototype.execute = function (callback) {
  var that = this;
  switch (this._state) {
  case "running":
    throw new Error("Promise().execute(): Already running");
  case "resolved":
    throw new Error("Promise().execute(): Resolved");
  case "rejected":
    throw new Error("Promise().execute(): Rejected");
  default:
    this._state = "running";
    setTimeout(function () {
      callback({
        "resolve": function (answer) {
          if (that._state !== "resolved" && that._state !== "rejected") {
            that._state = "resolved";
            that._answer = answer;
            that._onResolve.forEach(function (callback) {
              setTimeout(function () {
                callback(answer);
              });
            });
            that._onResolve = [];
            that._onReject = [];
            that._onProgress = [];
          }
        },
        "reject": function (answer) {
          if (that._state !== "resolved" && that._state !== "rejected") {
            that._state = "rejected";
            that._answer = answer;
            that._onReject.forEach(function (callback) {
              setTimeout(function () {
                callback(answer);
              });
            });
            that._onResolve = [];
            that._onReject = [];
            that._onProgress = [];
          }
        },
        "notify": function (answer) {
          that._onProgress.forEach(function (callback) {
            callback(answer);
          });
        }
      });
    });
    break;
  }
  return this;
};

Promise.prototype.then = function (onSuccess, onError, onProgress) {
  var next = new Promise(), that = this;
  switch (this._state) {
  case "resolved":
    if (typeof onSuccess === 'function') {
      next.execute(function (resolver) {
        try {
          resolver.resolve(onSuccess(that._answer));
        } catch (e) {
          resolver.reject(e);
        }
      });
    }
    break;
  case "rejected":
    if (typeof onError === 'function') {
      next.execute(function (resolver) {
        try {
          resolver.resolve(onError(that._answer));
        } catch (e) {
          resolver.reject(e);
        }
      });
    }
    break;
  default:
    if (typeof onSuccess === 'function') {
      this._onResolve.push(function (answer) {
        next.execute(function (resolver) {
          try {
            resolver.resolve(onSuccess(answer));
          } catch (e) {
            resolver.reject(e);
          }
        });
      });
    }
    if (typeof onError === 'function') {
      this._onReject.push(function (answer) {
        next.execute(function (resolver) {
          try {
            resolver.resolve(onError(answer));
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
      callback(that._answer);
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
      callback(that._answer);
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
      callback(that._answer);
    });
    break;
  default:
    ['_onReject', '_onResolve'].forEach(function (event) {
      that[event].push(callback);
    });
    break;
  }
  return this;
};



function Deferred() {
  this._promise = new Promise();
  this._solver = null;
  this._promise.execute(function (r) {
    if (Array.isArray(this._solver)) {
      r[this._solver[0]].apply(r, this._solver[1]);
    }
    this._solver = r;
  }.bind(this));
}

Deferred.prototype.resolve = function () {
  if (!this._solver) {
    this._solver = ['resolve', arguments];
  } else if (!Array.isArray(this._solver)) {
    this._solver.resolve.apply(this._solver, arguments);
  }
};

Deferred.prototype.reject = function () {
  if (!this._solver) {
    this._solver = ['reject', arguments];
  } else if (!Array.isArray(this._solver)) {
    this._solver.reject.apply(this._solver, arguments);
  }
};

Deferred.prototype.promise = function () {
  return this._promise;
};

// /////////////////////////////////////////////////////////////////////////////
// // Tests

// var one = new Promise().execute(function (r) {
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

// /////////////////////////////////////////////////////////////////////////////
// // Tests Deferred

// var p = (function () {
//   var d = new Deferred();
//   d.resolve('a');
//   return d.promise();
// }());

// p.then(function (a) {
//   console.log(a);
// });
