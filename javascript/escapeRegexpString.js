#!/usr/bin/env node

/**
 * Escapes regexp special chars from a string.
 *
 * @param  {String} string The string to escape
 * @return {String} The escaped string
 */
function escapeRegexpString(string) {
  return string.replace(/([\\\.\$\[\]\(\)\{\}\^\?\*\+\-])/g, "\\$1");
}

exports.escapeRegexpString = escapeRegexpString;

//////////////////////////////
// Live cmd
if (!module.parent) {
  if (process.argv.length < 3) {
    console.log("Usage:\r\ncmd string");
    process.exit(1);
  }
  console.log(escapeRegexpString(process.argv[2]));
}
