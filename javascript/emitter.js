/*
 * The MIT License (MIT)
 *
 * Copyright (c) 2013 Tristan Cavelier <t.cavelier@free.fr>
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

/*jslint indent: 2, maxlen: 80, nomen: true */

// keywords: js, javascript, basic event emitter, listener, flexible

"use strict";

/**
 * Emitter()
 *
 * An event manager.
 *
 * @class Emitter
 * @constructor
 */
function Emitter() {
  return;
}

/**
 * on(eventName, callback)
 *
 * Subscribe a callback to an event.
 *
 * @method on
 * @param  {String} eventName The event name
 * @param  {Function} callback The callback to bind
 */
Emitter.prototype.on = function (eventName, callback) {
  //////////////////////////////
  // Check parameters
  if (arguments.length < 2) {
    throw new TypeError("Not enough arguments to Emitter.on");
  }
  if (typeof callback !== "function") {
    //////////////////////////////
    // throw new TypeError('callback argument is not of type function');
    return;
    //////////////////////////////
  }
  //////////////////////////////

  // assign callback to event
  this._events = this._events || {};
  this._events[eventName] = this._events[eventName] || [];
  this._events[eventName].push(callback);
};

//////////////////////////////
// for nodejs EventEmitter compatibility
Emitter.prototype.addListener = Emitter.prototype.on;
//////////////////////////////
// for html5 EventTarget compatibility
Emitter.prototype.addEventListener = Emitter.prototype.on;
//////////////////////////////

//////////////////////////////
// once method
// - not really necessary for some app
// - can be deleted
//////////////////////////////

/**
 * once(eventName, callback)
 *
 * Subscribe a callback to an event. After the first call, the callback is
 * unsubscribed.
 *
 * @method once
 * @param  {String} eventName The event name
 * @param  {Function} callback The callback to bind once
 */
Emitter.prototype.once = function (eventName, callback) {
  //////////////////////////////
  // Check parameters
  if (arguments.length < 2) {
    throw new TypeError("Not enough arguments to Emitter.once");
  }
  if (typeof callback !== "function") {
    //////////////////////////////
    // throw new TypeError('callback argument is not of type function');
    return;
    //////////////////////////////
  }
  //////////////////////////////

  // assign callback to event
  this._events = this._events || {};
  this._events[eventName] = this._events[eventName] || [];
  this._events[eventName].push({"callback": callback, "once": true});
};

/**
 * emit(eventName, [args*])
 *
 * @method emit
 * @param  {String} eventName The event name
 * @param  {Any} [args*] The emition arguments
 */
Emitter.prototype.emit = function (eventName) {
  //////////////////////////////
  // security- fast+
  var args, i, funs = this._events && this._events[eventName] &&
    this._events[eventName].slice();
  // // security+ fast-
  // var args, i, funs = this._events &&
  //   Array.isArray(this._events[eventName]) &&
  //   this._events[eventName].slice();
  //////////////////////////////

  //////////////////////////////
  // for html5 EventTarget compatibility
  // add property 'on' + eventName on function list
  if (this.hasOwnProperty('on' + eventName) &&
      typeof this['on' + eventName] === "function") {
    funs = funs || [];
    funs.before = this['on' + eventName];
  }
  //////////////////////////////

  if (funs) {
    //////////////////////////////
    // remove `once` funs
    // needed only if `once` method exists
    for (i = funs.length - 1; i >= 0; i -= 1) {
      if ((funs[i] || {}).once) {
        this._events[eventName].splice(i, 1);
      }
    }
    //////////////////////////////

    //////////////////////////////
    // clean this._events
    if (this._events) {
      if (this._events[eventName].length === 0) {
        delete this._events[eventName];
      }
      i = undefined;
      for (i in this._events) {
        if (this._events.hasOwnProperty(i)) {
          break;
        }
      }
      if (i === undefined) {
        delete this._events;
      }
    }
    //////////////////////////////

    args = Array.prototype.slice.call(arguments, 1);

    //////////////////////////////
    // for html5 EventTarget compatibility
    if (funs.before) {
      // no try catch wraps listeners on EventTarget API
      funs.before.apply(null, args);
    }
    //////////////////////////////

    // call funs
    for (i = 0; i < funs.length; i += 1) {
      /*jslint continue: true */

      //////////////////////////////
      // try catch block
      // - security++ fast--
      // - propagate error to 'error' event
      // - can be deleted
      //////////////////////////////
      try {
        if (typeof funs[i] === 'function') {
          funs[i].apply(null, args);
          continue;
        }

        //////////////////////////////
        // // security+ fast-
        // if (!funs[i] || typeof funs[i].callback !== 'function') {
        //   continue;
        // }
        //////////////////////////////

        //////////////////////////////
        // can be dead code if `once` or `addEventListener` are not impl
        funs[i].callback.apply(null, args);
        //////////////////////////////

      } catch (e) {
        if (eventName !== 'error' && this._events.error) {
          // propagate to 'error' event
          this.emit('error', e);
        } else {
          throw e;
        }
      }
    }
  }
};

//////////////////////////////
// for other compatibility
Emitter.prototype.trigger = Emitter.prototype.emit;
//////////////////////////////
// for html5 compatibility
Emitter.prototype.dispatchEvent = Emitter.prototype.emit;
//////////////////////////////

//////////////////////////////
// off method
// - not really necessary for some app
// - can be deleted
//////////////////////////////
/**
 * off(eventName, callback)
 *
 * Unsubscribe a callback from an event.
 *
 * @method off
 * @param  {String} eventName The event name
 * @param  {Function} callback The callback reference
 */
Emitter.prototype.off = function (eventName, callback) {
  //////////////////////////////
  // security- fast+
  var i, funs = this._events && this._events[eventName];
  // // security+ fast-
  // var i, funs = this._events && Array.isArray(this._events[eventName]) &&
  //   this._events[eventName];
  //////////////////////////////

  if (funs) {
    for (i = 0; i < funs.length; i += 1) {
      // remove callback reference
      //////////////////////////////
      // if `once` or `addEventListener` are implemented
      if (funs[i] === callback || (funs[i] && funs[i].callback === callback)) {
        // or security- fast+
        // if (funs[i] === callback || funs[i].callback === callback) {
        // overwise
        // if (funs[i] === callback) {
        //////////////////////////////
        funs.splice(i, 1);
        break;
      }
    }

    //////////////////////////////
    // clean this._events
    if (this._events[eventName].length === 0) {
      delete this._events[eventName];
    }
    i = undefined;
    for (i in this._events) {
      if (this._events.hasOwnProperty(i)) {
        break;
      }
    }
    if (i === undefined) {
      delete this._events;
    }
    //////////////////////////////

  }
};

//////////////////////////////
// For nodejs EventEmitter compatibility
Emitter.prototype.removeListener = Emitter.prototype.off;
//////////////////////////////
// For html5 EventTarget compatibility
Emitter.prototype.removeEventListener = Emitter.prototype.off;
//////////////////////////////

//////////////////////////////
// clear method
// - not really necessary for some app
// - can be deleted
//////////////////////////////

Emitter.prototype.clear = function (name) {
  if (this._events) {
    delete this._events[name];
  }
};

//////////////////////////////
// reset method
// - not really necessary for some app
// - can be deleted
//////////////////////////////

Emitter.prototype.reset = function () {
  delete this._events;
};

//////////////////////////////
// for nodejs EventEmitter compatibility
Emitter.prototype.removeAllListeners = function (name) {
  if (name === undefined) {
    delete this._events;
  } else if (this._events) {
    delete this._events[name];

    //////////////////////////////
    // clean this._events
    var i;
    for (i in this._events) {
      if (this._events.hasOwnProperty(i)) {
        break;
      }
    }
    if (i === undefined) {
      delete this._events;
    }
    //////////////////////////////
  }
};
//////////////////////////////

//////////////////////////////
// listeners method
// - not really necessary for some app
// - can be deleted
//////////////////////////////

Emitter.prototype.listeners = function (name) {
  //////////////////////////////
  // security- fast+
  return (this._events && this._events[name]) || [];
  // // security+ fast-
  // return (this._events && Array.isArray(this._events[name]) &&
  //         this._events[name]) || [];
  // // security++ fast--
  // try {
  //   if (Array.isArray(this._events[name]) {
  //     return this._events[name];
  //   }
  // } catch (ignore) {}
  // return [];
  //////////////////////////////
};

// function bind(method) {
//   return function (emitter) {
//     Emitter.prototype[method].apply(
//       emitter,
//       Array.prototype.slice.call(arguments, 1)
//     );
//   };
// }

// Choose static method
//////////////////////////////
// Emitter.on = bind('on');
// Emitter.emit = bind('emit');
// Emitter.off = bind('off');
// Emitter.reset = bind('reset');
// Emitter.clear = bind('clear');
//////////////////////////////
// for nodejs EventEmitter compatibily
Emitter.listenerCount = function (emitter, name) {
  return Emitter.prototype.listeners.call(emitter, name).length;
};
//////////////////////////////

module.exports = Emitter;

// UNIT TESTS
if (!module.parent) {
  (function () {
    var e, f, expected;

    // `on` and `emit` unit test
    console.log("----- `on` and `emit` tests");
    expected = ['on hey', 'sep', 'on hoo', 'on2 hoo', 'sep'];
    e = new Emitter();
    e.on('event', function (p) {
      console.log(expected.shift() === 'on ' + p);
    });
    e.emit('event', 'hey');
    console.log(expected.shift() === 'sep');
    e.on('event', function (p) {
      console.log(expected.shift() === 'on2 ' + p);
    });
    e.emit('event', 'hoo');
    console.log(expected.shift() === 'sep');
    console.log(expected.length === 0);

    // `once` unit test
    console.log("----- `once` tests");
    expected = ['on hey', 'once hey', 'sep', 'on hoo', 'sep'];
    e = new Emitter();
    e.on('event', function (p) {
      console.log(expected.shift() === 'on ' + p);
    });
    e.once('event', function (p) {
      console.log(expected.shift() === 'once ' + p);
    });
    e.emit('event', 'hey');
    console.log(expected.shift() === 'sep');
    e.emit('event', 'hoo');
    console.log(expected.shift() === 'sep');
    console.log(expected.length === 0);

    // `off` unit test
    console.log("----- `off` tests");
    expected = ['on hey', 'once hey', 'sep', 'on hoo', 'sep'];
    e = new Emitter();
    e.on('event', function (p) {
      console.log(expected.shift() === 'on ' + p);
    });
    f = function (p) {
      console.log(expected.shift() === 'once ' + p);
    };
    e.on('event', f);
    e.emit('event', 'hey');
    console.log(expected.shift() === 'sep');
    e.off('event', f);
    e.emit('event', 'hoo');
    console.log(expected.shift() === 'sep');
    console.log(expected.length === 0);

    // html listener assignment tests
    console.log("----- html style listener assignment tests");
    expected = ['onevent hey', 'adl hey', 'sep', 'onevent hoo', 'sep', 'sep'];
    e = new Emitter();
    f = function (p) {
      console.log(expected.shift() === 'adl ' + p);
    };
    e.addEventListener('event', f);
    e.onevent = function (p) {
      console.log(expected.shift() === 'onevent ' + p);
    };
    e.emit('event', "hey");
    e.removeEventListener('event', f);
    console.log(expected.shift() === 'sep');
    e.emit('event', "hoo");
    console.log(expected.shift() === 'sep');
    delete e.onevent;
    e.emit('event', "hoo");
    console.log(expected.shift() === 'sep');
    console.log(expected.length === 0);
  }());
}
