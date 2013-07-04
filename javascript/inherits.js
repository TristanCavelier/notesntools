
// keywords: javascript, inherits, class, prototype

/**
 * Inherits the prototype methods from one constructor into another. The
 * prototype of `constructor` will be set to a new object created from
 * `superConstructor`.
 *
 * @param  {Function} constructor The constructor which inherits the super one
 * @param  {Function} superConstructor The super constructor
 */
function inherits(constructor, superConstructor) {
  constructor.super_ = superConstructor;
  constructor.prototype = Object.create(superConstructor.prototype, {
    "constructor": {
      "configurable": true,
      "enumerable": false,
      "writable": true,
      "value": constructor
    }
  });
}

exports.inherits = inherits

////////////////////////////////////////////////////////////////////////////////
// example

function A(a) {
  this.a = a || 2;
}
A.prototype = {
  "b": function () {
    console.log(this.a); // print a
  },
  "d": function () {
    console.log(this.a); // print a
  },
  "constructor": A
};

var a = new A();
a.b();

console.log('---');

function C(a, c) {
  A.call(this, a);
  this.c = c || 3;
}

inherits(C, A);

C.prototype.d = function () {
  A.prototype.d.apply(this, []); // print a
  this.b(); // print a
  console.log(this.c); // print c
}
C.prototype.constructor = C;

var c = new C(3, 4);
c.d();
