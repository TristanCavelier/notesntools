
// keywords: js, javascript, avoid new operator

function A() {
  if (!(this instanceof A)) {
    return new A();
  }
  // ...
}
// end A

function B(p) {
  if (!(this instanceof B)) {
    return new B(p);
  }
  A.call(this);
  // ...
}

B.prototype = Object.create(A.prototype, {
  "constructor": {
    "configurable": true,
    "enumerable": false,
    "writable": true,
    "value": B
  }
});
// end B
