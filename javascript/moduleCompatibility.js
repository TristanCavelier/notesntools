/*jslint indent: 2, maxlen: 80, nomen: true */
/*global window, exports, define */

// keywords: js, javascript, secured module, nodejs, browser, requirejs, web workers, security

////////////////////////////////////////////////////////////////////////////////
// I
// best way to make your script compatible

var my_module; // worker compatibility
(function (module_name, dependencies, module) {
  if (typeof define === 'function' && define.amd) { // require js compatibility
    return define(module_name, dependencies, module);
  }
  if (typeof exports === 'object') { // node js compatibility
    module(exports, require('jquery'));
  }
  if (typeof window === 'object') { // browser compatibility
    window.my_module = {};
    module(window.my_module, jQuery);
  }
  my_module = {}; // worker compatibility
  module(my_module, jQuery);
}('my_module', ['exports', 'jQuery'], function (exports, $) {

  // module definition

  exports.hello = function () {
    console.log('hello');
  };

}));


////////////////////////////////////////////////////////////////////////////////
// II

// Security:
//
// This kind of security denies all modification inside a module but does not
// deny module extension action. The module must not be modified by third party
// scripts, and the properties provided by the module too.
// Only compatible with ES5 (Object.defineProperty(..)).
//
// - RequireJs, no need to secure anything unless you want to define it in a
// global scope, in this case, all properties in 'to_export' must be secured.
// - Classical browser, all properties in 'to_export' must be secured, and the
// module must be secured in 'window'.
// - NodeJs, all properties in 'to_export' must be secured, and the module must
// be secured in 'exports'.
// - Web Worker, no need to secure anything because 'my_module' cannot be
// secured, you must not include third party script into the WW.

var my_module;
// var my_module; is declared here for web workers compatibility.
// For requirejs it is not dangerous because 'my_module' will be declared
// on window with type 'undefined'. Requirejs modules don't use globals.
// For nodejs without requirejs, module globals are omitted, only 'exports' is
// important.
// For browsers, 'my_module' will be declared in window, and overriden by
// Object.defineProperty(window, ...  so it's ok.

/**
 * Module description
 *
 * @module my_module
 */
(function () {
  "use strict";
  var to_export = {}, i;

  /**
   * Add a secured (write permission denied) property to an object.
   * This function is not needed if we don't want to secure the module.
   *
   * @param  {Object} object The object to fill
   * @param  {String} key The object key where to store the property
   * @param  {Any} value The value to store
   */
  function defineConstant(object, key, value) {
    Object.defineProperty(object, key, {
      "configurable": false,
      "enumerable": true,
      "writable": false,
      "value": value
    });
  }

  function toJson(thing) {
    return JSON.stringify(thing);
  }
  defineConstant(to_export, "toJson", toJson); // secured
  // to_export.toJson = toJson;                // classic

  function toString(thing) {
    return thing.toString();
  }
  defineConstant(to_export, "toString", toString); // secured
  // to_export.toString = toString;                // classic

  //////////////////////////////////////////////////
  // exports
  if (typeof exports === "object") {
    // nodejs export module, tested the 30 05 2013
    for (i in to_export) {
      if (to_export.hasOwnProperty(i)) {
        defineConstant(exports, i, to_export[i]);
        // exports[i] = to_export[i];
      }
    }
  } else if (typeof define === "function" && define.amd) {
    // requirejs export, tested the 30 05 2013
    define(to_export);
  } else if (typeof window === "object") {
    // classical browser window export, tested the 30 05 2013
    defineConstant(window, "my_module", to_export); // secured
    // window.my_module = to_export;                // classic
  } else {
    // web workers exports, tested the 30 05 2013
    my_module = to_export;
  }
}());
