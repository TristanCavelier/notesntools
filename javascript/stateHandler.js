
// keywords: js, javascript, event state handler

var EventEmitter = require('events').EventEmitter;
var util = require('util');
var deepClone = require('./deepClone.js').deepClone;

/**
 * A state handler class.
 *
 * Each instance have states with their own events object.
 *
 * @class StateHandler
 * @constructor
 */
function StateHandler() {
  EventEmitter.call(this);
  this._current_state = "initial";
  this._states = {};
}
util.inherits(StateHandler, EventEmitter);

/**
 * Returns a clone of this object.
 *
 * @method clone
 * @return {StateHandler} The cloned object
 */
StateHandler.prototype.clone = function () {
  var new_one = new StateHandler();
  new_one._maxListeners = deepClone(this._maxListeners);
  new_one._current_state = deepClone(this._current_state);
  new_one._states = deepClone(this._states);
  new_one._events = deepClone(this._events);
  return new_one;
};

/**
 * If an argument is provided, it sets the new state and return this object,
 * otherwise it returns the current state.
 *
 * @method state
 * @param  {String} [state] The new state
 * @return {String,StateHandler} The current state or this object
 */
StateHandler.prototype.state = function () {
  if (arguments.length === 0) {
    return this._current_state;
  } else {
    this._states[this._current_state] = this._events;
    this._current_state = arguments[0].toString();
    this._events = this._states[this._current_state];
    delete this._states[this._current_state];
    return this;
  }
};

exports.StateHandler = StateHandler;

////////////////////////////////////////////////////////////////////////////////
// Visual tests

var s = new StateHandler();

function a() { console.log('a');}
function b() { console.log('b');}

s.on('a', a);
s.emit('a');

s.state('b');
s.on('a', b);
s.emit('a');

console.log(s.clone());
