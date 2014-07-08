
// keywords: js, javascript, json, deep clone

/*jslint indent: 2, maxlen: 80 */

(function (root) {
  "use strict";

  /**
   * Clones jsonable object in deep
   *
   * @param  {A} object The jsonable object to clone
   * @return {A} The cloned object
   */
  function jsonDeepClone(object, replacer) {
    var tmp = JSON.stringify(object, replacer);
    if (tmp === undefined) { return undefined; }
    return JSON.parse(tmp);
  }

  root.jsonDeepClone = jsonDeepClone;

}(this));
