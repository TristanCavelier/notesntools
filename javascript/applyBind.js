/*jslint indent: 2, sloppy: true */

// keywords: js, javascript, function prototype applyBind, apply, bind

/**
 * Creates a new function that, when called, has its `this` keyword set to the
 * provided value, with a given array of arguments preceding any provided
 * when the new function is called.
 *
 *     function a(str) { console.log(this, str); }
 *     var b = a.applyBind({"a": "b"}, ["test"]);
 *     b();
 *
 * @param {Function} fun The function to bind
 *
 * @param {Object} thisArg The value to be passed as the `this` parameter to
 *   the target function when the bound function is called. The value is
 *   ignored if the bound function is constructed using the `new` operator.
 *
 * @param {Array} [argument] Arguments to prepend to arguments provided to the
 *   bound function when invoking the target function.
 *
 * @return {Function} The bound function.
 */
function applyBind(fun, thisArg, args) {
  args = [].slice.call(args);
  return function () {
    args.push.apply(args, arguments);
    return fun.apply(thisArg, args);
  };
}

//////////////////////////////////////////////////////////////////////
// other, improve Function.prototype

// Function.prototype.applyBind = function (thisArg, args) {
//   var fun = this;
//   args = [].slice.call(args);
//   return function () {
//     args.push.apply(args, arguments);
//     return fun.apply(thisArg, args);
//   };
// };
