// Copyright (c) 2014 Tristan Cavelier <t.cavelier@free.fr>
// This program is free software. It comes without any warranty, to
// the extent permitted by applicable law. You can redistribute it
// and/or modify it under the terms of the Do What The Fuck You Want
// To Public License, Version 2, as published by Sam Hocevar. See
// http://www.wtfpl.net/ for more details.

/**
 *     filterMap(array, callback) : array
 *
 * Acts like `Array.prototype.map` but does not produces a new array, it
 * modifies the original array instead.
 *
 * @param  {Array} array The array to modify
 * @param  {Function} callback Called in each element being parsed
 * @return {Array} The modified array
 */
function filterMap(array, callback) {
  var i;
  for (i = 0; i < array.length; i += 1) {
    array[i] = callback(array[i], i, array);
  }
  return array;
}
