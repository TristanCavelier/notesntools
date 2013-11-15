/*jslint indent: 2 */
/*global module, XMLHttpRequest */

if (typeof XMLHttpRequest === 'function') {

  module.exports = XMLHttpRequest;

} else {

  module.exports = (function () {
    "use strict";

    // Create XMLHttpRequest constructor if not defined.
    // Useful for nodejs libraries. Useless for browser app.
    // ...

    function XMLHttpRequest() {
      return;
    }

    XMLHttpRequest.prototype.open = function () {
      // ...
      return;
    };

    return XMLHttpRequest;

  }());
}
