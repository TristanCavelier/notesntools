/*jslint indent: 2, nomen: true */

// keywords: js, javascript, event emitter deferred, promises, done, fail, always, resolve, reject, post, each

"use strict";

var inherits = require('util').inherits,
  EventEmitter = require('events').EventEmitter;

/**
 * Promise instance can manage callbacks on done, on fail or on end.
 *
 * @class Promise
 * @extends EventEmitter
 * @constructor
 */
function Promise() {
  EventEmitter.call(this);
}
inherits(Promise, EventEmitter);

/**
 * Set the callback to call on done.
 *
 * @method done
 * @param  {Function} onDone The callback to call on done
 * @return {Promise} This
 */
Promise.prototype.done = function (onDone) {
  return this.once('resolve', onDone);
};

/**
 * Set the callback to call on fail.
 *
 * @method fail
 * @param  {Function} onFail The callback to call on fail
 * @return {Promise} This
 */
Promise.prototype.fail = function (onFail) {
  return this.once('reject', onFail);
};

/**
 * Set the callback to call on done or on end.
 *
 * @method always
 * @param  {Function} onEnd The callback to call on end
 * @return {Promise} This
 */
Promise.prototype.always = function (onEnd) {
  this.once('resolve', onEnd);
  this.once('reject', onEnd);
  return this;
};

/**
 * Set the callback to call on post.
 *
 * @method each
 * @param  {Function} onPost The callback to call on post
 * @return {Promise} This
 */
Promise.prototype.each = function (onPost) {
  this.on('post', onPost);
  return this;
};

/**
 * The deferred instance is associated to a promise. It provide method that
 * can answer to a request by resolving or rejecting it.
 *
 * @class Deferred
 * @extends EventEmitter
 * @constructor
 */
function Deferred() {
  EventEmitter.call(this);

  this._state = null;
  this._answer = null;
  this._promise = new Promise();
}
inherits(Deferred, EventEmitter);

/**
 * Resolve the command sending on event asynchronously to the promise with the
 * answer in parameters.
 *
 * @method resolve
 * @param  {Any} [args]* The arguments to give
 * @return {Deferred} This
 */
Deferred.prototype.resolve = function () {
  var i, args = ["resolve"];
  if (this._state !== null) {
    return this;
  }
  this._state = 'resolved';
  for (i = 0; i < arguments.length; i += 1) {
    args[i + 1] = arguments[i];
  }
  this._answer = args.slice(1);
  i = this;
  setTimeout(function () {
    i._promise.emit.apply(i._promise, args);
  });
  i._promise.removeAllListeners('reject');
  return this;
};

/**
 * Reject the command sending on event asynchronously to the promise with the
 * answer in parameters.
 *
 * @method reject
 * @param  {Any} [args]* The arguments to give
 * @return {Deferred} This
 */
Deferred.prototype.reject = function () {
  var i, args = ["reject"];
  if (this._state !== null) {
    return this;
  }
  this._state = 'rejected';
  for (i = 0; i < arguments.length; i += 1) {
    args[i + 1] = arguments[i];
  }
  this._answer = args.slice(1);
  i = this;
  setTimeout(function () {
    i._promise.emit.apply(i._promise, args);
  });
  i._promise.removeAllListeners('resolve');
  return this;
};

/**
 * Post something to the promise. The promise can catch each post with the
 * `each` method.
 *
 * @method post
 * @param  {Any} [args]* The arguments to give
 * @return {Deferred} This
 */
Deferred.prototype.post = function () {
  var i, args = ["post"];
  for (i = 0; i < arguments.length; i += 1) {
    args[i + 1] = arguments[i];
  }
  i = this;
  setTimeout(function () {
    i._promise.emit.apply(i._promise, args);
  });
  return this;
};

/**
 * Returns the promise object.
 *
 * @method promise
 * @return {Promise} The promise object
 */
Deferred.prototype.promise = function () {
  return this._promise;
};

/**
 * Call a function synchronously. This function is applied to a new deferred
 * instance `this`. `this.resolve` or `this.reject` must be call to answer to
 * the promise.
 *
 * Returns the deferred promise.
 *
 * @method call
 * @param  {Function} callback The function to call
 * @return {Promise} The callback promise
 */
Deferred.call = function (callback) {
  var deferred = new Deferred();
  callback.apply(deferred);
  return deferred.promise();
};

////////////////////////////////////////////////////////////////////////////////
// Tests

function myProcess() {
  return Deferred.call(function () {
    var deferred = this;
    deferred.resolve('a');
    deferred.reject('a');
  });
}

myProcess().done(function (answer) {
  console.log('done', answer);
}).fail(function (answer) {
  console.log('fail', answer);
}).always(function (answer) {
  console.log('always', answer);
}).done(function (answer) {
  console.log('done', answer);
});

setTimeout(function () {
  function myProcess() {
    return Deferred.call(function () {
      var deferred = this;
      deferred.post('a');
      deferred.post('b');
      deferred.post('c');
      deferred.resolve('d');
    });
  }
  myProcess().each(function (answer) {
    console.log(1, answer);
  }).each(function (answer) {
    console.log(2, answer);
  }).done(function (answer) {
    console.log(3, answer);
  });
}, 100);
