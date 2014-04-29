
// keywords: js, javascript, uuid generator

/**
 * An Universal Unique ID generator
 *
 * @return {String} The new UUID.
 */
function uuid() {
  return ("00000000" + Math.floor(
    Math.random() * 0x100000000
  ).toString(16)).slice(-8) + "-" + ("0000" + Math.floor(
    Math.random() * 0x10000
  ).toString(16)).slice(-4) + "-" + ("0000" + Math.floor(
    Math.random() * 0x10000
  ).toString(16)).slice(-4) + "-" + ("0000" + Math.floor(
    Math.random() * 0x10000
  ).toString(16)).slice(-4) + "-" + ("0000" + Math.floor(
    Math.random() * 0x10000
  ).toString(16)).slice(-4) + ("00000000" + Math.floor(
    Math.random() * 0x100000000
  ).toString(16)).slice(-8);
}
