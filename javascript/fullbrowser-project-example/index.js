/*jslint indent: 2, node: true */

"use strict";

var fileList = [
  // root
  "index.html",
  "index.js",
  "license.txt",
  "tests.html",
  "tests.manifest",
  // src
  "src/hasOwnProperty.js",
  "src/toString.js",
  "src/isObject.js",
  // wrapper
  "src/wrapper/footer.js",
  "src/wrapper/header.js",
  // tests
  "tests/jslint.js",
  "tests/MYLIB.js"
];

var toLint = [
  "src/hasOwnProperty.js",
  "src/toString.js",
  "src/isObject.js"
];

var toConcat = [
  "license.txt",
  "src/wrapper/header.js",
  "src/hasOwnProperty.js",
  "src/toString.js",
  "src/isObject.js",
  "src/wrapper/footer.js"
];
