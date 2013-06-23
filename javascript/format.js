
// keywords: js, javascript, format string, printf

/**
 * Returns a formatted string using the first arguments as a `printf`-like
 * format.
 *
 * The first argument is a string that contains zero or more *placeholders*.
 * Each placeholder is replaced with the converted value from its corresponding
 * argument. Supported placeholders are:
 *
 * - `%s` - String.
 * - `%d` - Number (both integer and float).
 * - `%j` - JSON.
 * - `%` - single percent sign ('`%`'). This does not consume an argument.
 *
 * If the placeholder does not have a corresponding argument, the placeholder is
 * not replaced.
 *
 *     format('%s:%s', 'foo'); // 'foo:%s'
 *
 * If there are more arguments than placeholders, the extra arguments are
 * converted to strings with JSON.stringify if argument is not a string
 * and these strings and concatenated, delimited by a space.
 *
 *     format('%s:%s', 'foo', 'bar', 'baz'); // 'foo:bar baz'
 *
 * If the first argument is not a format string then `format()` returns a string
 * that is the concatenation of all its arguments separated by spaces. Each
 * argument is converted to a string with JSON.stringify if argument is not a
 * string.
 *
 *     format(1, 2, 3); // '1 2 3'
 *
 * @param  {String} format_string The string to format
 * @param  {Any} [args]* The arguments to consume
 * @return {String} The format string
 */
function format(format_string) {
  var i, args = [], new_string = "";
  for (i = 1; i < arguments.length; i += 1) {
    args.push(arguments[i]);
  }
  if (typeof format_string === "string") {
    for (i = 0; i < format_string.length && args.length > 0; i += 1) {
      if (format_string[i] === "%") {
        i += 1;
        switch (format_string[i]) {
        case "s":
          new_string += args.shift().toString();
          break;
        case "d":
          new_string += parseFloat(args.shift()).toString();
          break;
        case "j":
          new_string += JSON.stringify(args.shift());
          break;
        case "%":
          new_string += "%";
          break;
        default:
          new_string += "%" + format_string[i];
          break;
        }
      } else {
        new_string += format_string[i];
      }
    }
    while (i < format_string.length) {
      new_string += format_string[i];
      i += 1;
    }
  } else {
    new_string += JSON.stringify(format_string);
  }
  while (args.length > 0) {
    i = args.shift();
    if (typeof i === "string") {
      new_string += " " + i;
    } else {
      new_string += " " + JSON.stringify(i);
    }
  }
  return new_string;
}
