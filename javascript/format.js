// Copyright (c) 2014 Tristan Cavelier <t.cavelier@free.fr>
// This program is free software. It comes without any warranty, to
// the extent permitted by applicable law. You can redistribute it
// and/or modify it under the terms of the Do What The Fuck You Want
// To Public License, Version 2, as published by Sam Hocevar. See
// http://www.wtfpl.net/ for more details.

// keywords: js, javascript, format string, printf

/**
 * Returns a formatted string using the first arguments as a `printf`-like
 * format.
 *
 * The first argument is a string that contains zero or more *placeholders*.
 * Each placeholder is replaced with the converted value from its corresponding
 * argument. Supported placeholders are:
 *
 * - `%s` - String.
 * - `%d` - Decimal integer.
 * - `%x` - Hexadecimal integer.
 * - `%f` - Float.
 * - `%j` - JSON.
 * - `%` - single percent sign ('`%`'). This does not consume an argument.
 *
 * If the placeholder does not have a corresponding argument, `undefined` is
 * taken.
 *
 *     format('%s:%s', 'foo'); // 'foo:undefined'
 *
 * If there are more arguments than placeholders, the extra arguments are
 * just ignored.
 *
 *     format('%s:%s', 'foo', 'bar', 'baz'); // 'foo:bar'
 *
 * Extended placeholders are replaced with the converted value from the
 * corresponding property of the first argument. Supported placeholders are:
 *
 * - `%(prop)s` - String
 * - `%(prop)d` - Decimal integer
 * - etc
 *
 *     format('%(hello)s', {"hello": "world"}); // 'world'
 *
 * If extended placeholders are used first, the other placeholders types are
 * ignored.
 *
 * @param  {String} format_string The string to format
 * @param  {Any} [args]* The arguments to consume
 * @return {String} The format string
 */
function format(format_string) {
  var args = [].slice.call(arguments, 1), mapped;
  return format_string.replace(
    (/%(?:(%)|(?:\(([^\)]+)\))?( )?([0-9]*)([sdfxXj]))/g),
    function (match, percentChar, propertyName, filOfSpace, numFil, format) {
      if (percentChar) {
        return "%";
      }
      if (mapped === undefined) {
        if (typeof propertyName === "string") {
          mapped = true;
        } else {
          mapped = false;
        }
      }

      var arg, fil = "";
      if (typeof propertyName === "string") {
        if (mapped === false) {
          return match;
        }
        arg = args[0][propertyName];
      } else {
        if (mapped === true) {
          return match;
        }
        arg = args.shift();
      }

      // convert argument to string
      switch (format) {
      case "s":
        arg = fil + arg;
        break;
      case "j":
        arg = fil + JSON.stringify(arg);
        break;
      case "d":
        arg = parseInt(arg, 10);
        if (!isFinite(arg)) {
          format = "s";
        }
        arg = arg.toString();
        break;
      case "x":
        arg = parseInt(arg, 10);
        if (!isFinite(arg)) {
          format = "s";
        }
        arg = arg.toString(16);
        break;
      case "X":
        arg = parseInt(arg, 10);
        if (isFinite(arg)) {
          arg = arg.toString(16).toUpperCase();
        } else {
          format = "s";
          arg = arg.toString();
        }
        break;
      case "f":
        arg = parseFloat(arg);
        if (!isFinite(arg)) {
          format = "s";
        }
        arg = arg.toString();
        break;
      }

      // fil with some spaces or `0`
      if (numFil) {
        switch (format) {
        case "s":
        case "j":
          numFil = numFil - arg.length;
          while (numFil-- > 0) {
            fil += " ";
          }
          return fil + arg;
        case "d":
        case "x":
        case "f":
          if (numFil[0] === "0" && !filOfSpace) {
            numFil = numFil - arg.length;
            while (numFil-- > 0) {
              fil += "0";
            }
          } else {
            numFil = numFil - arg.length;
            while (numFil-- > 0) {
              fil += " ";
            }
          }
          return fil + arg;
        }
      }
      return arg;
    }
  );
}

console.log(format("%") === "%");
console.log(format("%%") === "%");
console.log(format("%%%") === "%%");

console.log(format("%s") === "undefined");
console.log(format("%d") === "NaN");
console.log(format("%f") === "NaN");
console.log(format("%x") === "NaN");
console.log(format("%X") === "NaN");
console.log(format("%j") === "undefined");

console.log(format("%20s") === "           undefined");
console.log(format("%20d") === "                 NaN");
console.log(format("% 20d") === "                 NaN");
console.log(format("%020d") === "                 NaN");
console.log(format("%20j") === "           undefined");

console.log(format(",%s,%d,%f,%x,%j,", "a", "2", "2.3", "10") === ",a,2,2.3,a,undefined,");
console.log(format(",%s,%d,%f,%X,%j,", "a", "2", "2.3", "10", {}) === ",a,2,2.3,A,{},");
console.log(format(",% 05s,%2d,%04f,%x,%(e)j,", "a", "2", "2.3", "10", {}) === ",    a, 2,02.3,a,%(e)j,");
console.log(format(",%2s,%02d,%04f,%x,%(e)j,", "abc", "2", "2.3", "10", {}) === ",abc,02,02.3,a,%(e)j,");
console.log(format(",%2s,% 02d,%04f,%x,%(e)j,", "abc", "2", "2.3", "10", {}) === ",abc, 2,02.3,a,%(e)j,");
console.log(format(",%(a)s,%(b)d,%(c)f,%(d)x,%(e)j,", {"a":"a","b":"2","c":"2.3","d":"10","e":{}}) === ",a,2,2.3,a,{},");
console.log(format(",%(a)s,%(b)d,%(c)f,%x,%j,", {"a":"a","b":"2","c":"2.3","d":"10","e":{}}) === ",a,2,2.3,%x,%j,");
console.log(format(",%(a)s,%%(b)d,%(c)f,%x,%%j,", {"a":"a","b":"2","c":"2.3","d":"10","e":{}}) === ",a,%(b)d,2.3,%x,%j,");
console.log(format(",%(a) 05s,%%(b)d,%(c)f,%x,%%j,", {"a":"a","b":"2","c":"2.3","d":"10","e":{}}) === ",    a,%(b)d,2.3,%x,%j,");
