/*jslint indent: 2, sloppy: true */

// keywords: js, javascript, function prototype applyBind, apply, bind

/**
 * Designed for Function.prototype object
 */
var applyBindMethod = function (thisArg, args) {
  var fun = this;
  args = [].slice.call(args);
  return function () {
    args.push.apply(args, arguments);
    return fun.apply(thisArg, args);
  };
};

/**
 * Creates a new function that, when called, has its `this` keyword set to the
 * provided value, with a given array of arguments preceding any provided
 * when the new function is called.
 *
 * @param {Function} fun The function to bind
 *
 * @param {Object} thisArg The value to be passed as the `this` parameter to
 *   the target function when the bound function is called. The value is
 *   ignored if the bound function is constructed using the `new` operator.
 *
 * @param {Array} [args] Arguments to prepend to arguments provided to the
 *   bound function when invoking the target function.
 *
 * @return {Function} The bound function.
 */
var applyBind = Function.prototype.call.bind(applyBindMethod);

//////////////////////////////////////////////////////////////////////
// improve Function.prototype

Function.prototype.applyBind = applyBindMethod;


//////////////////////////////////////////////////////////////////////
// Tests

var _1 = {}, _2 = {}, o = {
  "m": function (a, b) {
    this.a = a;
    this.b = b;
  }
};
o.m.applyBind(_1, [1])(2);
applyBind(o.m, _2, [1])(2);
console.log("fun.applyBind(..) === applyBind(fun, ...)");
console.log('   ', JSON.stringify(_1) === JSON.stringify(_2));
console.log("check fun owner");
console.log('   ', JSON.stringify(o) === "{}");
