/*jslint indent: 2, maxlen: 80 */
"use strict";

/**
 * Splits the version into an array of numbers and separators
 *
 * @param {String} str The string to split
 * @return {Array} The splited version
 */
function versionSplit(str) {
  var part, res = [];
  if (str === undefined || str === null) {
    return [];
  }
  str = str.toString().trim();
  while (part !== null && str !== '') {
    part = /([0-9]+)?([^0-9]+)?/.exec(str);
    if (part[1] !== undefined) {
      res[res.length] = parseInt(part[1], 10);
    }
    res[res.length] = part[2];
    str = str.slice(part[0].length);
  }
  return res;
}

/**
 * Comparison function to compare version string.  This function can be used in
 * the Array.prototype.sort method.
 *
 * @param  {String} a The first value to compare
 * @param  {String} b The second value to compare
 * @return {Number} if a < b: -1, if a > b: 1, else 0
 */
function compareVersion(a, b) {
  var i, l;
  a = versionSplit(a);
  b = versionSplit(b);
  l = Math.min(a.length, b.length);
  for (i = 0; i < l; i += 1) {
    if (a[i] < b[i]) {
      return -1;
    }
    if (a[i] > b[i]) {
      return 1;
    }
  }
  if (i < a.length) {
    return 1;
  }
  if (i < b.length) {
    return -1;
  }
  return 0;
}

//////////////////////////////////////////////////////////////////////
// Tests
if (!module.parent) {
  console.log(compareVersion('1.9.3ab', '1.10.3ab') === -1);
  console.log(
    JSON.stringify(['1.10.3c', null, '', '1.9.3ab', '1.10.3'].
                   sort(compareVersion)) ===
      JSON.stringify([null, '', '1.9.3ab', '1.10.3', '1.10.3c'])
  ); // false !!!
}
