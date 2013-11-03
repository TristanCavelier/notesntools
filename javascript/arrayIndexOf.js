// keywords: js, javascript, benchmark, indexOf, find, array, faster
/*jslint indent: 2, maxlen: 80 */
"use strict";
//////////////////////////////////////////////////////////////////////

/**
 *     arrayIndexOf(array, value, from): number
 *
 * Like 'Array.indexOf()' in javascript, but 5-7 times faster.
 *
 * @param  {Array} array The array to browse
 * @param  {Any} value The value to find
 * @param  {Number} from The index where to begin
 * @return {Number} -1 if not found, else the index of the first value found
 */
function arrayIndexOf(array, value, from) {
  var index, length = array.length;
  from = from || 0;
  if (from < 0) {
    from += length;
  }
  for (index = from; index < length; index += 1) {
    if (array[index] === value) {
      return index;
    }
  }
  return -1;
}

//////////////////////////////////////////////////////////////////////
module.exports = arrayIndexOf;
