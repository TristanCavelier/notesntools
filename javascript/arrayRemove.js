// keywords: js, javascript, remove, find, array
/*jslint indent: 2, maxlen: 80 */
"use strict";
//////////////////////////////////////////////////////////////////////

/**
 *     arrayRemove(array, value, from): boolean
 *
 * Like 'Array.indexOf()' in javascript, but if the value is found, then the
 * element is remove from the list.
 *
 * @param  {Array} array The array to browse
 * @param  {Any} value The value to find and remove
 * @param  {Number} from The index where to begin
 * @return {Boolean} true if one element is removed, else false
 */
function arrayRemove(array, value, from) {
  var index, length = array.length;
  from = from || 0;
  if (from < 0) {
    from += length;
  }
  for (index = from; index < length; index += 1) {
    if (array[index] === value) {
      array.splice(index, 1);
      return true;
    }
  }
  return false;
}

//////////////////////////////////////////////////////////////////////
module.exports = arrayRemove;
