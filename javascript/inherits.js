
// keywords: javascript, inherits, class, prototype

/**
 * Inherits the prototype methods from one constructor into another. The
 * prototype of `constructor` will be set to a new object created from
 * `superConstructor`.
 */
function inherits(constructor, superConstructor) {
  constructor.super_ = superConstructor;
  constructor.prototype = Object.create(superConstructor.prototype, {});
}

exports.inherits = inherits

////////////////////////////////////////////////////////////////////////////////
// example

function A() {
  this.a = 2;
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

function C() {
  A.call(this);
  this.c = 3;
}

inherits(C, A);

C.prototype.d = function () {
  A.prototype.d.apply(this, []); // print a
  this.b(); // print a
  console.log(this.c); // print c
}
C.prototype.constructor = C;

var c = new C();
c.d();
