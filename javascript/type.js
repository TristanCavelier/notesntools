
// keywords: javascript, js, real type

/**
 * Get the real type of an object
 *
 * @param  {Any} value The value to check
 * @return {String} The value type
 */
function type(value) {
  // returns "String", "Object", "Array", "RegExp", ...
  return (/^\[object ([a-zA-Z]+)\]$/).exec(
    Object.prototype.toString.call(value)
  )[1];
}

exports.type = type;

////////////////////////////////////////////////////////////////////////////////
// Tests

console.log("type():", type({}) === "Object");
console.log("type():", type("") === "String");
console.log("type():", type([]) === "Array")
