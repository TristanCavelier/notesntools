
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
 * Number, Boolean, null.
 *
 * @param  {A} object The object to clone
 * @return {A} The cloned object
 */
function deepClone(object) {
  var i, cloned;
  if (Object.prototype.toString.call(object) === "[object Array]") {
    cloned = [];
    for (i = 0; i < object.length; i += 1) {
      cloned[i] = deepClone(object[i]);
    }
    return cloned;
  }
  if (typeof object === "object") {
    cloned = {};
    for (i in object) {
      if (object.hasOwnProperty(i)) {
        cloned[i] = deepClone(object[i]);
      }
    }
    return cloned;
  }
  return object;
}

exports.jsonDeepClone = jsonDeepClone
exports.deepClone = deepClone

////////////////////////////////////////////////////////////////////////////////
// Visual Tests

var a = {"_events": {
  "a": function () {},
  "b": [function () {}, function () {}],
  "c": [1, "a"]
}};
var b = deepClone(a);
delete a._events.c
delete a._events.b[0]
console.log(a);
console.log(b);
