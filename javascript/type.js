
// keywords: javascript, js, real type

/**
 * Get the real type of an object. So arrays are of type 'array'.
 *
 * @param  {Any} value The value to check
 * @return {String} The value type
 */
function type(value) {
  if (Array.isArray(value)) {
    return 'array';
  }
  return typeof value;
}

exports.type = type;
////////////////////////////////////////////////////////////////////////////////
// Tests
if (!module.parent) {
  console.log("type():", type({}) === "object");
  console.log("type():", type("") === "string");
  console.log("type():", type([]) === "array");
}
