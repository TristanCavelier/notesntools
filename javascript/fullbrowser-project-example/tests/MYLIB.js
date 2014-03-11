/*jslint indent: 2 */
/*global module, test, ok, MYLIB */

(function () {
  "use strict";

  module("MY LIB");

  test("Check provided library", function () {
    ok(typeof MYLIB.hasOwnProperty === "function", "hasOwnProperty");
    ok(typeof MYLIB.toString === "function", "toString");
    ok(typeof MYLIB.isObject === "function", "isObject");
  });

}());
