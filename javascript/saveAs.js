/*jslint indent: 2 */
/*global window, document, Blob */

(function (root) {
  "use strict";

  // Copyright (c) 2014 Tristan Cavelier <t.cavelier@free.fr>
  // This program is free software. It comes without any warranty, to
  // the extent permitted by applicable law. You can redistribute it
  // and/or modify it under the terms of the Do What The Fuck You Want
  // To Public License, Version 2, as published by Sam Hocevar. See
  // http://www.wtfpl.net/ for more details.

  /**
   * Allows the user to download `data` as a file which name is defined by
   * `filename`. The `mimetype` will help the browser to choose the associated
   * application to open with.
   *
   * @param  {String} filename The file name.
   * @param  {String} mimetype The data type.
   * @param  {Any} data The data to download.
   */
  function saveAs(filename, mimetype, data) {
    data = window.URL.createObjectURL(new Blob([data], {"type": mimetype}));
    var a = document.createElement("a");
    if (a.download !== undefined) {
      a.download = filename;
      a.href = data;
      //a.textContent = 'Downloading...';
      document.body.appendChild(a);
      a.click();
      a.remove();
    } else {
      window.open(data);
    }
  }

  root.saveAs = saveAs;

}(this));
