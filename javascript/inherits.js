
// keywords: javascript, inherits, class, prototype

/**
 * Inherits the prototype methods from one constructor into another. The
 * prototype of `constructor` will be set to a new object created from
 * `superConstructor`.
 */
function inherits(constructor, superConstructor) {
  constructor.super_ = superConstructor;
  superConstructor.prototype = constructor.prototype;
}

exports.inherits = inherits

////////////////////////////////////////////////////////////////////////////////
// example

function A() {
  this.a = 2;
}
A.prototype = {
  "b": function () {
    console.log(this.a);
  }
};

var a = new A();
console.log(a.a);
a.b();



function C() {
  A.call(this);
  this.c = 3;
}

inherits(A, C);

C.prototype.d = function () {
  console.log(this.a);
  this.b();
}

var c = new C();
console.log(c.a);
console.log(c.c);
c.d();
