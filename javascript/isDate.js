
// keywords: js, javascript, is date tester

/**
 * Test if the a value can be converted to Date
 *
 * @method <method_name>
 * @param  {String,Number,Date} date The date to test
 * @return {Boolean} true if success, else false
 */
function isDate(date) {
  if (date instanceof Date) {
    return true;
  }
  if (!isNaN((new Date(date)).getTime())) {
    return true;
  }
  return false;
}

console.log(isDate('2013'));
console.log(isDate(new Date()));
console.log(isDate(1234));
