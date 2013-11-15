var thirdparty = function () {
  // ...
  return;
};

if (typeof define === 'function' && define.amd) {
  define(function () {
    return thirdparty;
  });
} else if (typeof module === 'object' && typeof exports === 'object') {
  module.exports = thirdparty;
}
