
// keywords: js, javascript, uuid generator

/**
 * An Universal Unique ID generator
 *
 * @return {String} The new UUID.
 */
function uuid() {
  var s = (Math.random().toString(16) + "00000000").slice(2, 10);
  s += "-";
  s += (Math.random().toString(16) + "0000").slice(2, 6);
  s += "-";
  s += (Math.random().toString(16) + "0000").slice(2, 6);
  s += "-";
  s += (Math.random().toString(16) + "0000").slice(2, 6);
  s += "-";
  s += (Math.random().toString(16) + "000000").slice(2, 8);
  s += (Math.random().toString(16) + "000000").slice(2, 8);
  return s;
}
