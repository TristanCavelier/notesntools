/*jslint indent: 2, maxlen: 80 */

// keywords: js, javascript, secure prototype class
"use strict";

/**
 * Secure class prototype to avoid any prototype modifications
 *
 * @param  {Function} Constructor The constructor to secure
 */
function secureClass(Constructor) {
  var k, d = {
    "constructor": Constructor.prototype.constructor
  };
  for (k in Constructor) {
    if (Constructor.hasOwnProperty(k)) {
      Object.defineProperty(Constructor, k, {
        "configurable": false,
        "enumerable": false,
        "writable": false,
        "value": Constructor[k]
      });
    }
  }
  for (k in Constructor.prototype) {
    if (Constructor.prototype.hasOwnProperty(k)) {
      d[k] = Constructor.prototype[k];
    }
  }
  Object.defineProperty(Constructor, "prototype", {
    "configurable": false,
    "enumerable": false,
    "writable": false,
    "value": {}
  });
  for (k in d) {
    if (d.hasOwnProperty(k)) {
      Object.defineProperty(Constructor.prototype, k, {
        "configurable": false,
        "enumerable": false,
        "writable": false,
        "value": d[k]
      });
    }
  }
}

////////////////////////////////////////////////////////////////////////////////
// Example: class definition
function Lol() {

}
Lol.prototype.blue = function () {
  console.log('blue');
};

function Lal() {
  Lol.call(this);
}

Lal.super_ = Lol;
Lal.prototype = Object.create(Lol.prototype, {
  "constructor": {
    "configurable": true,
    "enumerable": false,
    "writable": true,
    "value": Lal
  }
});

Lal.prototype.blue = function () {
  console.log('blue2');
};

// do it at the end of all definitions
secureClass(Lol);
secureClass(Lal);
////////////////////////////////////////////////////////////////////////////////
// Try to break prototypes

Lal.prototype.blue = function () {
  console.log('green');
}
Lal.prototype = {
  "blue": function () {
    console.log('green');
  }
};
Lal.prototype.constructor = function () {}

console.log(new Lol().constructor);
new Lol().blue();
console.log(Lol.name);


console.log(new Lal().constructor);
new Lal().blue();
console.log(Lal.name);
