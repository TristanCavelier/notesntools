/**
 * Converts a Utf8 raw string (0 <= char <= 255) into a real string
 *
 * @param  {String} input Utf8 encoded Bytes to convert
 * @return {String} Real string
 */
function utf8ByteStringToString(input) {
  var output = "", i, x, l = input.length;

  for (i = 0; i < l; i += 1) {
    x = input.charCodeAt(i);
    if ((x & 0xF0) === 0xF0) {
      i += 1;
      x = ((x & 0x07) << 18) | (
        i < l ? (input.charCodeAt(i) & 0x3F) << 12 : 0
      );
      i += 1;
      x = x | (
        i < l ? (input.charCodeAt(i) & 0x3F) << 6 : 0
      );
      i += 1;
      x = x | (
        i < l ? input.charCodeAt(i) & 0x3F : 0
      );
      if (0x10000 <= x <= 0x10FFFF) {
        output += String.fromCharCode(
          (((x - 0x10000) >>> 10) & 0x03FF) | 0xD800,
          (x & 0x03FF) | 0xDC00
        );
      } else {
        output += String.fromCharCode(x);
      }
    } else if ((x & 0xE0) === 0xE0) {
      i += 1;
      x = ((x & 0x0F) << 12) | (
        i < l ? (input.charCodeAt(i) & 0x3F) << 6 : 0
      );
      i += 1;
      output += String.fromCharCode(x | (
        i < l ? input.charCodeAt(i) & 0x3F : 0
      ));
    } else if ((x & 0xC0) === 0xC0) {
      i += 1;
      output += String.fromCharCode(((x & 0x1F) << 6) | (
        i < l ? input.charCodeAt(i) & 0x3F : 0
      ));
    } else {
      output += String.fromCharCode(x);
    }
  }
  return output;
}

/**
 * Converts a Utf8 number array (0 <= number <= 255) into a real string
 *
 * @param  {Array} input Utf8 encoded Bytes to convert
 * @return {String} Real string
 */
function utf8ByteArrayToString(input) {
  var output = "", i, x, l = input.length;

  for (i = 0; i < l; i += 1) {
    x = input[i];
    if ((x & 0xF0) === 0xF0) {
      i += 1;
      x = ((x & 0x07) << 18) | (
        i < l ? (input[i] & 0x3F) << 12 : 0
      );
      i += 1;
      x = x | (
        i < l ? (input[i] & 0x3F) << 6 : 0
      );
      i += 1;
      x = x | (
        i < l ? input[i] & 0x3F : 0
      );
      if (0x10000 <= x <= 0x10FFFF) {
        output += String.fromCharCode(
          (((x - 0x10000) >>> 10) & 0x03FF) | 0xD800,
          (x & 0x03FF) | 0xDC00
        );
      } else {
        output += String.fromCharCode(x);
      }
    } else if ((x & 0xE0) === 0xE0) {
      i += 1;
      x = ((x & 0x0F) << 12) | (
        i < l ? (input[i] & 0x3F) << 6 : 0
      );
      i += 1;
      output += String.fromCharCode(x | (
        i < l ? input[i] & 0x3F : 0
      ));
    } else if ((x & 0xC0) === 0xC0) {
      i += 1;
      output += String.fromCharCode(((x & 0x1F) << 6) | (
        i < l ? input[i] & 0x3F : 0
      ));
    } else {
      output += String.fromCharCode(x);
    }
  }
  return output;
}
