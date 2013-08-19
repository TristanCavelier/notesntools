/*jslint indent: 2, maxlen: 80 */

// keywords: js, javascript, lock, secure prototype class
"use strict";

// This tool is not really necessary because a bad script can override the class
// or the module anyway.

/**
 * Lock class prototype to avoid any prototype modifications and future
 * inheritance.
 *
 * @param  {Function} Constructor The constructor to secure
 */
function lockClass(Constructor) {
  var k;
  // lock static methods
  for (k in Constructor) {
    if (Constructor.hasOwnProperty(k)) {
      Object.defineProperty(Constructor, k, {
        "configurable": false,
        "enumerable": true,
        "writable": false,
        "value": Constructor[k]
      });
    }
  }
  // lock 'prototype' to 'Constructor'
  Object.defineProperty(Constructor, "prototype", {
    "configurable": false,
    "enumerable": false,
    "writable": false,
    "value": {}
  });
  // lock 'constructor' to 'prototype' if not overriden
  if (!Constructor.prototype.hasOwnProperty('consturctor')) {
    Object.defineProperty(Constructor.prototype, "constructor", {
      "configurable": false,
      "enumerable": false,
      "writable": false,
      "value": Constructor.prototype.constructor
    });
  }
  // lock defined 'prototype.methods' to 'prototype'
  for (k in Constructor.prototype) {
    if (Constructor.prototype.hasOwnProperty(k)) {
      Object.defineProperty(Constructor.prototype, k, {
        "configurable": false,
        "enumerable": true,
        "writable": false,
        "value": Constructor.prototype[k]
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

Lol.inherits = function (Constructor) {

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
lockClass(Lol);
lockClass(Lal);
////////////////////////////////////////////////////////////////////////////////
// Inheritance

function makeFakeCons(Constructor_, Constructor) {
  var k;
  for (k in Constructor.prototype) {
    if (Constructor.prototype.hasOwnProperty(k)) {
      Constructor_.prototype[k] = Constructor.prototype[k];
    }
  }

  Constructor.prototype = Object.create(Constructor_.prototype, {
    "constructor": {
      "configurable": true,
      "enumerable": false,
      "writable": true,
      "value": Constructor
    }
  });
}

// inside library scope
function A() {
  this._a = 2;
}
A.prototype.b = function () {
  console.log('b');
};

function A_() {
  A.call(this);
}
makeFakeCons(A_, A);

// (new A()) instanceof A_ -> true

// library provided tools
function createA() {
  return new A_();
}
function initA(that) {
  A.call(that);
}
function inheritsFromA(Constructor) {
  Constructor.prototype = Object.create(A_.prototype, {
    "constructor": {
      "configurable": true,
      "enumerable": false,
      "writable": true,
      "value": Constructor
    }
  });
}
function instanceofA(object) {
  return object instanceof A_;
}

// outside

function B() {
  initA(this);
}
inheritsFromA(B);
new B().b();

console.log(instanceofA(new B()));

// //////////////////////////////////////////////////////////////////////
// // Try to break prototypes

// Lal.prototype.blue = function () {
//   console.log('green');
// };
// Lal.prototype = {
//   "blue": function () {
//     console.log('green');
//   }
// };
// Lal.prototype.constructor = function () {};

// console.log(new Lol().constructor);
// new Lol().blue();
// console.log(Lol.name);


// console.log(new Lal().constructor);
// new Lal().blue();
// console.log(Lal.name);
