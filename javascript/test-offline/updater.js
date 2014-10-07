/*jslint indent: 2 */
(function (root) {
  "use strict";

  /*
   Copyright (c) 2014 Tristan Cavelier <t.cavelier@free.fr>

   This program is free software. It comes without any warranty, to
   the extent permitted by applicable law. You can redistribute it
   and/or modify it under the terms of the Do What The Fuck You Want
   To Public License, Version 2, as published by Sam Hocevar. See
   below for more details.

   ___________________________________________________________________
  |                                                                   |
  |           DO WHAT THE FUCK YOU WANT TO PUBLIC LICENSE             |
  |                   Version 2, December 2004                        |
  |                                                                   |
  |Copyright (C) 2004 Sam Hocevar <sam@hocevar.net>                   |
  |                                                                   |
  |Everyone is permitted to copy and distribute verbatim or modified  |
  |copies of this license document, and changing it is allowed as long|
  |as the name is changed.                                            |
  |                                                                   |
  |           DO WHAT THE FUCK YOU WANT TO PUBLIC LICENSE             |
  |  TERMS AND CONDITIONS FOR COPYING, DISTRIBUTION AND MODIFICATION  |
  |                                                                   |
  | 0. You just DO WHAT THE FUCK YOU WANT TO.                         |
  |___________________________________________________________________|

  */

  /*jslint indent: 2 */

  // dependencies:
  // - applicationCache
  // - console

  var ac = root.applicationCache, c = root.console;

  root.addEventListener('load', function () { ac.update(); }, false);
  ac.addEventListener("checking", function () { c.info("application cache checking for update"); });
  ac.addEventListener("noupdate", function () { c.info("application cache is up to date"); });
  ac.addEventListener("downloading", function () { c.info("application cache downloading new content"); });
  ac.addEventListener("progress", function () { c.info("application cache progressing"); });
  ac.addEventListener("cached", function () { c.info("application cached successfuly"); });
  ac.addEventListener('updateready', function () { ac.swapCache(); c.info("application cache ready to update"); }, false);
  ac.addEventListener("obsolete", function () { c.warn("application is no longer cached!"); });
  ac.addEventListener("error", function (e) { c.error("application cannot be cached"); c.error(e); });

}(this));
