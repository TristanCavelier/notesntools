
// keywords: js, javascript, json, deep clone

/**
 * Clones jsonable object in deep
 *
 * @param  {A} object The jsonable object to clone
 * @return {A} The cloned object
 */
function jsonDeepClone(object) {
  var tmp = JSON.stringify(object);
  if (tmp === undefined) {
    return undefined;
  }
  return JSON.parse(tmp);
}

////////////////////////////////////////////////////////////////////////////////

// keywords: js, javascript, native, deep clone

/**
 * Clones all native object in deep. Managed types: Object, Array, String,
 * Number, Boolean, Function, null.
 *
 * It can also clone object which are serializable, like Date.
 *
 * To make a class serializable, you need to implement the `toJSON` function
 * which returns a JSON representation of the object. The return value is used
 * as first parameter of the object constructor.
 *
 * @param  {A} object The object to clone
 * @return {A} The cloned object
 */
function deepClone(object) {
  var i, cloned;
  if (Array.isArray(object)) {
    cloned = [];
    for (i = 0; i < object.length; i += 1) {
      cloned[i] = deepClone(object[i]);
    }
    return cloned;
  }
  if (typeof object === 'object') {
    if (Object.getPrototypeOf(object) === Object.prototype) {
      cloned = {};
      for (i in object) {
        if (object.hasOwnProperty(i)) {
          cloned[i] = deepClone(object[i]);
        }
      }
      return cloned;
    }
    if (object instanceof Date) {
      return new Date(object);
    }
    if (typeof object.toJSON === 'function') {
      return new (Object.getPrototypeOf(object).constructor)(object.toJSON());
    }
  }
  return object;
}

exports.jsonDeepClone = jsonDeepClone;
exports.deepClone = deepClone;

////////////////////////////////////////////////////////////////////////////////
// Visual Tests

var inspect = require('util').inspect;

var a = {"_events": {
  "a": function () {},
  "b": [function () {}, function () {}],
  "c": [1, "a"]
}};
var b = deepClone(a);
delete a._events.c;
delete a._events.b[0];
console.log(inspect(a) ===
            "{ _events: { a: [Function], b: [ , [Function] ] } }");
console.log(inspect(b) ===
            "{ _events: { a: [Function], b: [ [Function], " +
            "[Function] ], c: [ 1, 'a' ] } }");
