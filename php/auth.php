<?php
/*

 Copyright (c) 2015 Tristan Cavelier <t.cavelier@free.fr>

 This program is free software. It comes without any warranty, to
 the extent permitted by applicable law. You can redistribute it
 and/or modify it under the terms of the Do What The Fuck You Want
 To Public License, Version 2, as published by Sam Hocevar. See
 below for more details.

 ___________________________________________________________________
|                                                                   |
|           DO WHAT THE FUCK YOU WANT TO PUBLIC LICENSE             |
|                   Version 2, December 2004                        |
|                                                                   |
|Copyright (C) 2004 Sam Hocevar <sam@hocevar.net>                   |
|                                                                   |
|Everyone is permitted to copy and distribute verbatim or modified  |
|copies of this license document, and changing it is allowed as long|
|as the name is changed.                                            |
|                                                                   |
|           DO WHAT THE FUCK YOU WANT TO PUBLIC LICENSE             |
|  TERMS AND CONDITIONS FOR COPYING, DISTRIBUTION AND MODIFICATION  |
|                                                                   |
| 0. You just DO WHAT THE FUCK YOU WANT TO.                         |
|___________________________________________________________________|

*/

//////////////////////////////////////////////////////////////////////

// AUTHENTICATIONTYPE (required)
// - "Digest" is good for http
// - "Basic" is good for https
$AUTHENTICATIONTYPE = "Digest";

// REALM (required)
$REALM = "Private area";
//$REALM = "Free private area";

// USERS (required)
$USERS = array(
  // "Digest:$username:$REALM" = md5("$username:$REALM:$password")
  "Digest:admin:Private area" => "16f67c9cc28c46d6cd12568ec173f90a", // admin:admin
  // "Digest:$username:$REALM" = md5("$username:$REALM-33:$password")
  "Digest:admin:Free private area" => "cac5fb5bf4825f59b4b0512fc59108eb", // admin:admin
  // "Basic:$username" => sha1("$password")
  "Basic:admin" => "d033e22ae348aeb5660fc2140aec35850c4da997" // admin:admin
);

//////////////////////////////////////////////////////////////////////

function send_basic_challenge() { // can be used to log out
  global $REALM;
  header("HTTP/1.0 401 Unauthorized");
  header("WWW-Authenticate: Basic realm=\"$REALM\"");
  exit;
}

function test_basic_auth() {
  // http://evertpot.com/223/
  $username = null;
  $password = null;
  // mod_php
  if (isset($_SERVER['PHP_AUTH_USER'])) {
    $username = $_SERVER['PHP_AUTH_USER'];
    $password = $_SERVER['PHP_AUTH_PW'];
  // most other servers
  } elseif (isset($_SERVER['HTTP_AUTHORIZATION'])) {
    if (strpos(strtolower($_SERVER['HTTP_AUTHORIZATION']),'basic') === 0) {
      list($username, $password) = explode(':', base64_decode(substr($_SERVER['HTTP_AUTHORIZATION'], 6)));
    }
  }
  global $USERS;
  global $REALM;
  global $_USER;
  if ($USERS["Basic:$username"] != sha1($password)) {
    return false;
  }
  $_USER = $username;
  return true;
}

function validate_basic_auth() {
  if (test_basic_auth()) { return; }
  send_basic_challenge();
}


function extract_digest() {
  // http://evertpot.com/223/
  // mod_php
  if (isset($_SERVER['PHP_AUTH_DIGEST'])) {
    $digest = $_SERVER['PHP_AUTH_DIGEST'];
    preg_match_all("@(\\w+)=(?:\"([^\"]+)\"|([^\\s,$]+))@", $digest, $matches, PREG_SET_ORDER);
  // most other servers
  } elseif (isset($_SERVER['HTTP_AUTHORIZATION'])) {
    if (strpos(strtolower($_SERVER['HTTP_AUTHORIZATION']),'digest') === 0) {
      $digest = substr($_SERVER['HTTP_AUTHORIZATION'], 7);
      preg_match_all("@(\\w+)=(?:\\\\\"([^\"]+)\\\\\"|([^\\s,$]+))@", $digest, $matches, PREG_SET_ORDER);
    } else {
      return null;
    }
  } else {
    return null;
  }
  $needed_parts = array('nonce'=>1, 'nc'=>1, 'cnonce'=>1, 'qop'=>1, 'username'=>1, 'uri'=>1, 'response'=>1);
  $data = array();
  foreach ($matches as $m) {
    $data[$m[1]] = $m[2] ? $m[2] : $m[3];
    unset($needed_parts[$m[1]]);
  }
  return $needed_parts ? false : $data;
}

function send_digest_challenge() { // can be used to log out
  global $REALM;
  // $nonce = bin2hex($timestamp . md5("$timestamp:$ETAG:$PRIVATEKEY"));
  // $opaque = bin2hex($randomchars);
  $nonce = uniqid("");
  $opaque = uniqid("");
  header("HTTP/1.0 401 Unauthorized");
  header("WWW-Authenticate: Digest realm=\"$REALM\", qop=\"auth\", nonce=\"$nonce\", opaque=\"$opaque\"");
  exit;
}

function test_digest_auth() {
  $digest_parts = extract_digest();
  if (is_null($digest_parts)) { return false; }
  global $USERS;
  global $REALM;
  // $HA1 = md5("$username:$REALM:$password");
  $username = $digest_parts["username"];
  $HA1 = $USERS["Digest:$username:$REALM"];
  if (is_null($HA1)) { return false; }
  $HA2 = md5("{$_SERVER["REQUEST_METHOD"]}:{$digest_parts["uri"]}"); // or $_SERVER["REQUEST_URI"] or $_SERVER["PATH_INFO"] ?
  $real_response = md5("$HA1:{$digest_parts["nonce"]}:{$digest_parts["nc"]}:{$digest_parts["cnonce"]}:auth:$HA2"); // force qop to auth
  if ($real_response != $digest_parts["response"]) { return false; }
  global $_USER;
  $_USER = $username;
  return true;
}

function validate_digest_auth() {
  if (test_digest_auth()) { return; }
  send_digest_challenge();
}

function test_auth() {
  global $AUTHENTICATIONTYPE;
  if ($AUTHENTICATIONTYPE == "Digest") {
    return test_digest_auth();
  }
  if ($AUTHENTICATIONTYPE == "Basic") {
    return test_basic_auth();
  }
  header("HTTP/1.0 500 Internal Server Error");
  exit;
}

function validate_auth() {
  global $AUTHENTICATIONTYPE;
  if ($AUTHENTICATIONTYPE == "Digest") {
    validate_digest_auth();
  } elseif ($AUTHENTICATIONTYPE == "Basic") {
    validate_basic_auth();
  } else {
    header("HTTP/1.0 500 Internal Server Error");
    exit;
  }
}

/*
  include "auth.php";
  $AUTHENTICATIONTYPE = "Digest";
  $REALM = "You shall not pass";
  $USERS = array("Digest:admin:You shall not pass" => "<see on top of this file>");
  validate_auth();
  echo "Logged in as $_USER";
*/
?>
