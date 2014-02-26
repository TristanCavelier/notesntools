#!/usr/bin/env node

// keywords: javascript, js, truth table

/*jslint indent: 2, forin: true */

function ifNotTest(key1, value1) {
  var string = "if (!" + key1 + ") -> ";
  if (!value1) {
    console.log(string + "true");
    return true;
  }
  //console.log(string + "false");
  return false;
}

function ifTest(key1, value1) {
  var string = "if (" + key1 + ") -> ";
  if (value1) {
    console.log(string + "true");
    return true;
  }
  //console.log(string + "false");
  return false;
}

function compareIfDoubleEqual(key1, value1, key2, value2) {
  var string = "if (" + key1 + " == " + key2 +") -> ";
  if (value1 == value2) {
    console.log(string + "true");
    return true;
  }
  //console.log(string + "false");
  return false;
}

function compareIfTripleEqual(key1, value1, key2, value2) {
  var string = "if (" + key1 + " === " + key2 +") -> ";
  if (value1 === value2) {
    console.log(string + "true");
    return true;
  }
  //console.log(string + "false");
  return false;
}

function exec1(dict1, test) {
  var key1;
  for (key1 in dict1) {
    test(key1, dict1[key1]);
  }
}

function exec2(dict1, dict2, compare) {
  var key1, key2;
  for (key1 in dict1) {
    for (key2 in dict2) {
      compare(key1, dict1[key1], key2, dict2[key2]);
    }
  }
}

function exec1_n(dict_list, test) {
  var i;
  for (i = 0; i < dict_list.length; i += 1) {
    exec1(dict_list[i], test);
  }
}

function exec2_n(dict_list, dict_list2, compare) {
  var i, j;
  for (i = 0; i < dict_list.length; i += 1) {
    for (j = 0; j < dict_list2.length; j += 1) {
      exec2(dict_list[i], dict_list2[j], compare);
    }
  }
}

//////////////////////////////////////////////////////////////////////

var global_empty_array = [];
var global_empty_object = {};
var global_function = function () { return; };

function generateLiterals() {
  return {
    // others
    "undefined": undefined,
    "null": null,

    // booleans
    "false": false,
    "true": true,

    // integers
    "0": 0,
    "1": 1,
    "-1": -1,

    // doubles
    "0.01": 0.01,
    "-0.01": -0.01,
    "Infinity": Infinity,
    "-Infinity": -Infinity,
    "NaN": NaN,

    // strings
    "\"\"": "",
    "\"0\"": "0",
    "\"1\"": "1",
    "\"-1\"": "-1",
    "\"a\"": "a",
    "\"\\x00\"": "\x00",

    // array
    "[]": [],
    "global_empty_array": global_empty_array,

    // object
    "{}": {},
    "global_empty_object": global_empty_object,

    // functions
    "function () { return; }": function () { return; },
    "global_function": global_function
  };
}

function generateArrayValuesLiterals() {
  var literals = generateLiterals();
  var dict = {};
  var key;

  for (key in literals) {
    dict["[" + key + "]"] = [literals[key]];
  }
  return dict;
}

function generateObjectValuesLiterals() {
  var literals = generateLiterals();
  var dict = {};
  var key;

  for (key in literals) {
    dict["{\"key\":" + key + "}"] = {};
    dict["{\"key\":" + key + "}"][key] = literals[key];
  }
  return dict;
}

function generateObjectKeysLiterals() {
  var literals = generateLiterals();
  var dict = {};
  var key;

  for (key in literals) {
    dict["{" + key + ":\"key\"}"] = {};
    dict["{" + key + ":\"key\"}"][literals[key]] = key;
  }
  return dict;
}

function generateObjectKeyValuesLiterals() {
  var literals = generateLiterals();
  var literals2 = generateLiterals();
  var dict = {};
  var key;

  for (key in literals) {
    dict["{" + key + ":" + key + "}"] = {};
    dict["{" + key + ":" + key + "}"][literals[key]] = literals2[key];
  }
  return dict;
}

function generateDictList() {
  return [
    generateLiterals(),
    generateArrayValuesLiterals(),
    generateObjectKeysLiterals(),
    generateObjectValuesLiterals(),
    generateObjectKeyValuesLiterals()
  ];
}

//////////////////////////////////////////////////////////////////////

exec1_n(generateDictList(), ifTest);
exec1_n(generateDictList(), ifNotTest);
exec2_n(generateDictList(), generateDictList(), compareIfDoubleEqual);
exec2_n(generateDictList(), generateDictList(), compareIfTripleEqual);

console.log("All the other tests are false");
