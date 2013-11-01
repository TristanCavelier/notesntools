
// keywords: js, javascript, is date tester

/**
 * Test if the a value is a date
 *
 * @param  {String,Number,Date} date The date to test
 * @return {Boolean} true if success, else false
 */
function isDate(date) {
  if (!isNaN((new Date(date === null ? undefined : date)).getTime())) {
    return true;
  }
  return false;
}

//////////////////////////////
// Tests
if (!module.parent) {
  console.log(isDate('2013') === true);
  console.log(isDate(new Date('2013')) === true);
  console.log(isDate(1234) === true);

  console.log(isDate(new Date('lolol')) === false);
  console.log(isDate('lolol') === false);
  console.log(isDate(null) === false);
  console.log(isDate() === false);
}
