/*jslint indent: 2, maxlen: 80 */
/*global Blob, FileReader */
"use strict";

// keywords: js, javascript, async json, stringify, parse, async replacer

var promises = require("./Promise.js"), Deferred = promises.Deferred,
  Promise = promises.Promise;

// async JSON.stringify with
// - async replacer
// - integrated Blob stringify feature
// - integrated RegExp stringify feature
// - XXX space parameter is not used yet

var asyncJSON = {
  "stringify": function (value, replacer, space) {
    function stringify(value, key, indent) {
      var d = new Deferred();
      function onRealValue() {
        var i, res;
        // XXX indentation
        if (value instanceof RegExp) {
          d.resolve(JSON.stringify(value.toString()));
        } else if (typeof Blob === 'function' && value instanceof Blob) {
          console.log(2);
          i = new FileReader();
          i.onload = function () {
            d.resolve(JSON.stringify([[i.result], {"type": value.type}]));
          };
          i.onerror = function () {
            d.reject(new TypeError('Blob loading error'));
          };
          i.readAsBinaryString(value);
        } else if (Array.isArray(value)) {
          res = [];
          for (i = 0; i < value.length; i += 1) {
            res[res.length] =
              stringify(value[i], i, indent + 1);
          }
          Promise.all.apply(null, res).done(function () {
            var args = [];
            for (i = 0; i < arguments.length; i += 1) {
              if (arguments[i] !== undefined) {
                args[args.length] = arguments[i];
              } else {
                args[args.length] = 'null';
              }
            }
            d.resolve('[' + args.join(',') + ']');
          }).fail(function () {
            for (i = 0; i < arguments.length; i += 1) {
              if (arguments[i] !== undefined) {
                d.reject(arguments[i]);
                break;
              }
            }
          });
        } else if (typeof value === 'object' && value !== null &&
                   typeof value.toJSON !== 'function') {
          res = [[], []];
          for (i in value) {
            if (value.hasOwnProperty(i)) {
              res[0][res[0].length] = i;
              res[1][res[1].length] =
                stringify(value[i], i, indent + 1);
            }
          }
          Promise.all.apply(null, res[1]).done(function () {
            var key_value_list = [];
            for (i = 0; i < arguments.length; i += 1) {
              if (arguments[i] !== undefined) {
                key_value_list[key_value_list.length] =
                  JSON.stringify(res[0][i]) + ':' + arguments[i];
              }
            }
            key_value_list.sort();
            d.resolve('{' + key_value_list.join(',') + '}');
          }).fail(function () {
            for (i = 0; i < arguments.length; i += 1) {
              if (arguments[i] !== undefined) {
                d.reject(arguments[i]);
                break;
              }
            }
          });
        } else {
          d.resolve(JSON.stringify(value));
        }
      }
      if (typeof replacer === 'function') {
        Promise.when(replacer(key, value)).done(function (v) {
          value = v;
          onRealValue();
        }).fail(d.reject);
      } else {
        onRealValue();
      }
      return d.promise();
    }
    if (typeof space !== 'string') {
      space = '';
    }
    return stringify(value, replacer, space, '', 0);
  },
  "parse": function (val) {
    return Promise.execute(function () {
      return JSON.parse(val);
    });
  }
};

/////////////////////////////////////////////////////////////////////////////
// Tests

function onsuccess(arg) {
  console.log(typeof arg, arg);
}

asyncJSON.stringify(undefined).done(onsuccess).fail(console.error);
asyncJSON.stringify(null).done(onsuccess).fail(console.error);
asyncJSON.stringify('lol').done(onsuccess).fail(console.error);
asyncJSON.stringify(NaN).done(onsuccess).fail(console.error);
asyncJSON.stringify(1).done(onsuccess).fail(console.error);
asyncJSON.stringify(new Date()).done(onsuccess).fail(console.error);
asyncJSON.stringify(/bla/i).done(onsuccess).fail(console.error);

asyncJSON.stringify([NaN, 'lol', null, undefined, new Date(), 1]).
  done(onsuccess).fail(console.error);

asyncJSON.stringify({
  "NaN": NaN,
  "lol": "lol",
  "null": null,
  "undefined": undefined,
  "Date": new Date(),
  "regexp": /regexp/gi,
  "1": 1,
  "function": function () {}
}).done(onsuccess).then(function (str) {
  asyncJSON.parse(str).done(onsuccess).fail(console.error);
}, console.error);

asyncJSON.stringify({'a': 'b'}, function (key, value) {
  if (key === 'a') {
    return value + 'c';
  }
  return value;
}).done(onsuccess).fail(console.error);

// async replacer with promise
asyncJSON.stringify({'a': 'b'}, function (key, value) {
  if (key === 'a') {
    var d = new Deferred();
    d.resolve(value + 'c');
    return d.promise();
  }
  return value;
}).done(onsuccess).fail(console.error);

asyncJSON.parse('olechua').done(onsuccess).fail(console.error);
