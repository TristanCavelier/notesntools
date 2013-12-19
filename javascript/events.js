(function (root, factory) {
  "use strict";
  if (typeof define === 'function' && define.amd) {
    define(factory);
  } else if (typeof module === 'object' && typeof exports === 'object') {
    module.exports = factory();
  } else {
    root.events = factory();
  }
}(this, function () {
  "use strict";
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

//////////////////////////////
function isObject(arg) {
  return typeof arg === 'object' && arg;
}
//////////////////////////////
function EventEmitter() {
  this._events = this._events || {};
  this._maxListeners = this._maxListeners || undefined;
}

// Backwards-compat with node 0.10.x
EventEmitter.EventEmitter = EventEmitter;

EventEmitter.prototype._events = undefined;
EventEmitter.prototype._maxListeners = undefined;

// By default EventEmitters will print a warning if more than 10 listeners are
// added to it. This is a useful default which helps finding memory leaks.
EventEmitter.defaultMaxListeners = 10;

// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
EventEmitter.prototype.setMaxListeners = function (n) {
  if (typeof n !== 'number' || n < 0) {
    throw new TypeError('n must be a positive number');
  }
  this._maxListeners = n;
  return this;
};

EventEmitter.prototype.emit = function (type, first, second) {
  var handler, len, args, i, listeners;

  if (!this._events) {
    this._events = {};
  }

  // If there is no 'error' event listener then throw.
  if (type === 'error' &&
      (!this._events.error ||
       (isObject(this._events.error) && !this._events.error.length))) {
    if (first instanceof Error) {
      throw first; // Unhandled 'error' event
    }
    throw new TypeError('Uncaught, unspecified "error" event.');
  }

  handler = this._events[type];

  if (handler === undefined) {
    return false;
  }

  if (typeof handler === 'function') {
    switch (arguments.length) {
      // fast cases
    case 1:
      handler.call(this);
      break;
    case 2:
      handler.call(this, first);
      break;
    case 3:
      handler.call(this, first, second);
      break;
      // slower
    default:
      handler.apply(this, [].slice.call(arguments, 1));
    }
  } else if (isObject(handler)) {
    args = [].slice.call(arguments, 1);

    listeners = handler.slice();
    len = listeners.length;
    for (i = 0; i < len; i += 1) {
      listeners[i].apply(this, args);
    }
  }

  return true;
};

EventEmitter.prototype.addListener = function (type, listener) {
  var m;

  if (typeof listener !== 'function') {
    throw new TypeError('listener must be a function');
  }

  if (!this._events) {
    this._events = {};
  }

  // To avoid recursion in the case that type === "newListener"! Before
  // adding it to the listeners, first emit "newListener".
  if (this._events.newListener) {
    this.emit('newListener', type,
              typeof listener.listener === 'function' ?
              listener.listener : listener);
  }

  if (!this._events[type]) {
    // Optimize the case of one listener. Don't need the extra array object.
    this._events[type] = listener;
  } else if (isObject(this._events[type])) {
    // If we've already got an array, just append.
    this._events[type].push(listener);
  } else {
    // Adding the second element, need to change to array.
    this._events[type] = [this._events[type], listener];
  }

  // Check for listener leak
  if (isObject(this._events[type]) && !this._events[type].warned) {
    if (this._maxListeners !== undefined) {
      m = this._maxListeners;
    } else {
      m = EventEmitter.defaultMaxListeners;
    }

    if (m && m > 0 && this._events[type].length > m) {
      this._events[type].warned = true;
      console.error('(node) warning: possible EventEmitter memory ' +
                    'leak detected. %d listeners added. ' +
                    'Use emitter.setMaxListeners() to increase limit.',
                    this._events[type].length);
      console.trace();
    }
  }

  return this;
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.once = function (type, listener) {
  if (typeof listener !== 'function') {
    throw new TypeError('listener must be a function');
  }

  function g() {
    this.removeListener(type, g);
    listener.apply(this, arguments);
  }

  g.listener = listener;
  this.on(type, g);

  return this;
};

// emits a 'removeListener' event iff the listener was removed
EventEmitter.prototype.removeListener = function (type, listener) {
  var list, position, length, i;

  if (typeof listener !== 'function') {
    throw new TypeError('listener must be a function');
  }

  if (!this._events || !this._events[type]) {
    return this;
  }

  list = this._events[type];
  length = list.length;
  position = -1;

  if (list === listener || list.listener === listener) {
    delete this._events[type];
    if (this._events.removeListener) {
      this.emit('removeListener', type, listener);
    }

  } else if (isObject(list)) {
    for (i = length - 1; i >= 0; i -= 1) {
      if (list[i] === listener ||
          (list[i].listener && list[i].listener === listener)) {
        position = i;
        break;
      }
    }

    if (position < 0) {
      return this;
    }

    if (list.length === 1) {
      list.length = 0;
      delete this._events[type];
    } else {
      list.splice(position, 1);
    }

    if (this._events.removeListener) {
      this.emit('removeListener', type, listener);
    }
  }

  return this;
};

EventEmitter.prototype.removeAllListeners = function (type) {
  var key, listeners;

  if (!this._events) {
    return this;
  }

  // not listening for removeListener, no need to emit
  if (!this._events.removeListener) {
    if (arguments.length === 0) {
      this._events = {};
    } else if (this._events[type]) {
      delete this._events[type];
    }
    return this;
  }

  // emit removeListener for all listeners on all events
  if (arguments.length === 0) {
    for (key in this._events) {
      if (this._events.hasOwnProperty(key)) {
        if (key === 'removeListener') {
          /*jslint continue: true */
          continue;
        }
        this.removeAllListeners(key);
      }
    }
    this.removeAllListeners('removeListener');
    this._events = {};
    return this;
  }

  listeners = this._events[type];

  if (typeof listeners === 'function') {
    this.removeListener(type, listeners);
  } else {
    // LIFO order
    while (listeners.length) {
      this.removeListener(type, listeners[listeners.length - 1]);
    }
  }
  delete this._events[type];

  return this;
};

EventEmitter.prototype.listeners = function (type) {
  if (!this._events || !this._events[type]) {
    return [];
  }
  if (typeof this._events[type] === 'function') {
    return [this._events[type]];
  }
  return this._events[type].slice();
};

EventEmitter.listenerCount = function (emitter, type) {
  if (!emitter._events || !emitter._events[type]) {
    return 0;
  }
  if (typeof emitter._events[type] === 'function') {
    return 1;
  }
  return emitter._events[type].length;
};

return EventEmitter;
}));
