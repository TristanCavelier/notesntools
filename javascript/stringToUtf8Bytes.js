/*jslint indent: 2, maxlen: 80, sloppy: true */

/**
 * Converts a string into a Utf8 raw string (0 <= char <= 255)
 *
 * @param  {String} input String to convert
 * @return {String} Utf8 byte string
 */
function stringToUtf8ByteString(input) {
  /*jslint bitwise: true */
  var output = "", i, x, y, l = input.length;

  for (i = 0; i < l; i += 1) {
    /* Decode utf-16 surrogate pairs */
    x = input.charCodeAt(i);
    y = i + 1 < l ? input.charCodeAt(i + 1) : 0;
    if (0xD800 <= x && x <= 0xDBFF && 0xDC00 <= y && y <= 0xDFFF) {
      x = 0x10000 + ((x & 0x03FF) << 10) + (y & 0x03FF);
      i += 1;
    }

    /* Encode output as utf-8 */
    if (x <= 0x7F) {
      output += String.fromCharCode(x);
    } else if (x <= 0x7FF) {
      output += String.fromCharCode(
        0xC0 | ((x >>> 6) & 0x1F),
        0x80 | (x & 0x3F)
      );
    } else if (x <= 0xFFFF) {
      output += String.fromCharCode(
        0xE0 | ((x >>> 12) & 0x0F),
        0x80 | ((x >>> 6) & 0x3F),
        0x80 | (x & 0x3F)
      );
    } else if (x <= 0x1FFFFF) {
      output += String.fromCharCode(
        0xF0 | ((x >>> 18) & 0x07),
        0x80 | ((x >>> 12) & 0x3F),
        0x80 | ((x >>> 6) & 0x3F),
        0x80 | (x & 0x3F)
      );
    }
  }
  return output;
}

/**
 * Converts a string into a Utf8 array of numbers < 256 and >= 0
 *
 * @param  {String} input String to convert
 * @return {Array} Array of octets (number)
 */
function stringToUtf8ByteArray(input) {
  /*jslint bitwise: true */
  var output = [], i, x, y, l = input.length;

  for (i = 0; i < l; i += 1) {
    /* Decode utf-16 surrogate pairs */
    x = input.charCodeAt(i);
    y = i + 1 < l ? input.charCodeAt(i + 1) : 0;
    if (0xD800 <= x && x <= 0xDBFF && 0xDC00 <= y && y <= 0xDFFF) {
      x = 0x10000 + ((x & 0x03FF) << 10) + (y & 0x03FF);
      i += 1;
    }

    /* Encode output as utf-8 */
    if (x <= 0x7F) {
      output[output.length] = x;
    } else if (x <= 0x7FF) {
      output[output.length] = 0xC0 | ((x >>> 6) & 0x1F);
      output[output.length] = 0x80 | (x & 0x3F);
    } else if (x <= 0xFFFF) {
      output[output.length] = 0xE0 | ((x >>> 12) & 0x0F);
      output[output.length] = 0x80 | ((x >>> 6) & 0x3F);
      output[output.length] = 0x80 | (x & 0x3F);
    } else if (x <= 0x1FFFFF) {
      output[output.length] = 0xF0 | ((x >>> 18) & 0x07);
      output[output.length] = 0x80 | ((x >>> 12) & 0x3F);
      output[output.length] = 0x80 | ((x >>> 6) & 0x3F);
      output[output.length] = 0x80 | (x & 0x3F);
    }
  }
  return output;
}
