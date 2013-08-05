
// keywords: js, javascript, is date tester

/**
 * Test if the a value is a date
 *
 * @method <method_name>
 * @param  {String,Number,Date} date The date to test
 * @return {Boolean} true if success, else false
 */
function isDate(date) {
  if (!isNaN((new Date(date)).getTime())) {
    return true;
  }
  return false;
}

console.log(isDate('2013'));
console.log(isDate(new Date('2013')));
console.log(isDate(1234));
