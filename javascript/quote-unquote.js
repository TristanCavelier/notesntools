
// keywords: js, javascript, Douglas Crockford's json2.js quote


function quote(string) {
  var meta = {
    "\b": "\\b",
    "\t": "\\t",
    "\n": "\\n",
    "\f": "\\f",
    "\r": "\\r",
    "\"": "\\\"",
    "\\": "\\\\"
  };
  return '"' + string.replace(/[\\\"\x00-\x1f\x7f-\uffff]/g, function (a) {
    return meta[a] || '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
  }) + '"';
}

function unquote(string) {
  var meta = {
    "\\b": "\b",
    "\\t": "\t",
    "\\n": "\n",
    "\\f": "\f",
    "\\r": "\r",
    "\\\"": "\"",
    "\\\\": "\\"
  };
  return string.slice(
    1,
    (-1)
  ).replace(/(?:\\[\\btnfr"]|\\u[0-9a-fA-F]{4}|\\x[0-9a-fA-F])/g, function (a) {
    var c = meta[a];
    if (c !== undefined) {
      return c;
    }
    if (a[1] === 'u' || a[1] === 'x') {
      return String.fromCharCode(parseInt(a.slice(2), 16));
    }
    //  "\\\\" "\\\""
    return a[1];
  });
}

exports.quote = quote;
exports.unquote = unquote;
////////////////////////////////////////////////////////////////////////////////
// Tests
if (!module.parent) {
  console.log('Doppelgänger!\r\n');
  console.log(quote('Doppelgänger!\r\n'));
  console.log(unquote(quote('Doppelgänger!\r\n')));
  console.log('Doppelgänger!\r\n' === unquote(quote('Doppelgänger!\r\n')));
}

// var escapable = /[\\\"\x00-\x1f\x7f-\uffff]/g, meta = {
//   "\b": "\\b",
//   "\t": "\\t",
//   "\n": "\\n",
//   "\f": "\\f",
//   "\r": "\\r",
//   "\"": "\\\"",
//   "\\": "\\\\",

//   "\\b": "\b",
//   "\\t": "\t",
//   "\\n": "\n",
//   "\\f": "\f",
//   "\\r": "\r",
//   "\\\"": "\"",
//   "\\\\": "\\"
// };

// function quote(string) {
//   //escapable.lastIndex = 0;
//   return escapable.test(string) ?
//     '"' + string.replace(escapable, function (a) {
//       var c = meta[a];
//       return typeof c === 'string' ? c :
//         '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
//     }) + '"' : '"' + string + '"';
// }
