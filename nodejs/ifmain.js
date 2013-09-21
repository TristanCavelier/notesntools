#!/usr/bin/env node

function func() {
  console.log(2);
}

if (module.parent) {
  exports.providedValue = func;
  console.log('This is used a library');
} else {
  func();
  console.log('This is not used as a library');
}
