
// keywords: js, javascript, json, deep clone
/*jslint indent: 2, maxlen: 80 */
(function () {
  "use strict";

  /**
   * Clones jsonable object in deep
   *
   * @param  {A} object The jsonable object to clone
   * @return {A} The cloned object
   */
  function jsonDeepClone(object) {
    var tmp = JSON.stringify(object);
    if (tmp === undefined) {
      return undefined;
    }
    return JSON.parse(tmp);
  }

  exports.jsonDeepClone = jsonDeepClone;
}());
