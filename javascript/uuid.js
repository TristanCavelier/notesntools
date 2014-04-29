
// keywords: js, javascript, uuid generator

/**
 * An Universal Unique ID generator
 *
 * @return {String} The new UUID.
 */
function uuid() {
  function S4() {
    return ("0000" + Math.floor(
      Math.random() * 0x10000
    ).toString(16)).slice(-4);
  }
  function S8() {
    return ("00000000" + Math.floor(
      Math.random() * 0x100000000
    ).toString(16)).slice(-8);
  }
  return S8() + "-" +
    S4() + "-" +
    S4() + "-" +
    S4() + "-" +
    S8() + S4();
}
