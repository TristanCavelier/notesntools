var promises = require("./Promise.js"), Deferred = promises.Deferred,
  Promise = promises.Promise;
function Blob() {}
function B() {}

var asyncJSON = {
  "stringify": function (obj) {
    var i, res, d = new Deferred();
    if (obj instanceof Blob) {
      console.log(2);
      i = new FileReader();
      i.onload = function () {
        try {
          d.resolve(JSON.stringify([[i.result], {"type": obj.type}]));
        } catch (e) {
          d.reject(e);
        }
      };
      i.onerror = function () {
        d.reject(new TypeError('Blob loading error'));
      };
      i.readAsBinaryString(obj);
    } else if (Array.isArray(obj)) {
      res = [];
      for (i = 0; i < obj.length; i += 1) {
        res[res.length] = asyncJSON.stringify(obj[i]);
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
    } else if (typeof obj === 'object' && obj !== null &&
               typeof obj.toJSON !== 'function') {
      res = [[], []];
      for (i in obj) {
        if (obj.hasOwnProperty(i)) {
          res[0][res[0].length] = i;
          res[1][res[1].length] = asyncJSON.stringify(obj[i]);
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
      try {
        d.resolve(JSON.stringify(obj));
      } catch (e2) {
        d.reject(e2);
      }
    }
    return d.promise();
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

asyncJSON.stringify([NaN, 'lol', null, undefined, new Date(), 1]).
  done(onsuccess).fail(console.error);

asyncJSON.stringify({
  "NaN": NaN,
  "lol": "lol",
  "null": null,
  "undefined": undefined,
  "Date": new Date(),
  "1": 1,
  "function": function () {}
}).done(onsuccess).then(function (str) {
  asyncJSON.parse(str).done(onsuccess).fail(console.error);
}, console.error);
