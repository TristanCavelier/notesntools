// keywords: js, javascript, native, deep clone
/*jslint indent: 2, maxlen: 80 */
(function () {
  "use strict";

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
        cloned = Object.getPrototypeOf(object).constructor;
        if (typeof cloned === 'function') {
          /*jslint newcap: true */
          return new cloned(object.toJSON());
        }
      }
    }
    return object;
  }

  exports.deepClone = deepClone;

  //////////////////////////////////////////////////////////////////////
  // Tests
  if (!module.parent) {
    (function () {
      var a, b, inspect = require('util').inspect;

      a = {"events": {
        "a": function () {
          return;
        },
        "b": [function () {
          return;
        }, function () {
          return;
        }],
        "c": [1, "a"]
      }};
      b = deepClone(a);
      delete a.events.c;
      delete a.events.b[0];
      console.log(inspect(a) ===
                  "{ events: { a: [Function], b: [ , [Function] ] } }");
      console.log(inspect(b) ===
                  "{ events: { a: [Function], b: [ [Function], " +
                  "[Function] ], c: [ 1, 'a' ] } }");
    }());
  }
}());
