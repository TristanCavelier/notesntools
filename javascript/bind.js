// keywords: js, javascript, function prototype bind

/**
 * Creates a new function that, when called, has its `this` keyword set to the
 * provided value, with a given sequence of arguments preceding any provided
 * when the new function is called. See Mozilla Developer Network:
 * Function.prototype.bind
 *
 * In PhantomJS, their is a bug with `Function.prototype.bind`. You can
 * reproduce this bug by testing this code:
 *
 *     function a(str) { console.log(this, str); }
 *     var b = a.bind({"a": "b"}, "test");
 *     b();
 *
 * @param {Function} fun The function to bind
 *
 * @param {Object} thisArg The value to be passed as the `this` parameter to
 *   the target function when the bound function is called. The value is
 *   ignored if the bound function is constructed using the `new` operator.
 *
 * @param {Any} [arg]* Arguments to prepend to arguments provided to the
 *   bound function when invoking the target function.
 *
 * @return {Function} The bound function.
 */
function bind(fun, thisArg) {
  var args = [].slice.call(arguments, 2);
  return function () {
    args.push.apply(args, arguments);
    return fun.apply(thisArg, args);
  };
}
// or
Function.prototype.bind = function (thisArg) {
  var fun = this, args = [].slice.call(arguments, 1);
  return function () {
    args.push.apply(args, arguments);
    return fun.apply(thisArg, args);
  };
};

//////////////////////////////////////////////////////////////////////
// Tests

if (!module.parent) {
  (function () {
    var _1 = {}, _2 = {}, o = {
      "m": function (a, b) {
        this.a = a;
        this.b = b;
      }
    };
    o.m.bind(_1, 1)(2);
    bind(o.m, _2, 1)(2);
    console.log("fun.bind(..) === bind(fun, ...)");
    console.log('   ', JSON.stringify(_1) === JSON.stringify(_2));
    console.log("check fun owner");
    console.log('   ', JSON.stringify(o) === "{}");
  }());
}
