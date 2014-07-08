<?php

// php4, php5

// Copyright (c) 2014 Tristan Cavelier <t.cavelier@free.fr>
// This program is free software. It comes without any warranty, to
// the extent permitted by applicable law. You can redistribute it
// and/or modify it under the terms of the Do What The Fuck You Want
// To Public License, Version 2, as published by Sam Hocevar. See
// http://www.wtfpl.net/ for more details.

/**
 *     normalize($path)
 *
 * Returns a normalized version of `path` taking care of ".." and "." parts. It
 * removes all useless "/" but keeps the trailing one.
 *
 * Examples:
 *
 *     // normalize path and remove trailing slashes
 *     $path = normalize($path . "/.")
 *     // normalize path in a chroot
 *     $realpath = CHROOT_REALPATH . normalize("/" . $path)
 *
 * @arg $path The path to normalize
 */
function normalize($path) {
    if ($path == "." or $path == "") {
        return ".";
    }
    if ($path == "..") {
        return "..";
    }

    $split = explode("/", $path);
    $skip = 0;
    $res = "";
    $sep = "";
    $length = count($split);
    $i = $length - 1;

    if ($i > 0) {
        if ($split[$i] === "") {
            $sep = "/";
            $i--;
        }
    }

    while ($i > 0) {
        if ($split[$i] == "..") {
            $skip++;
        } elseif ($split[$i] != "." and $split[$i] != "") {
            if ($skip > 0) {
                $skip--;
            } else {
                $res = $split[$i] . $sep . $res;
                $sep = "/";
            }
        }
        $i--;
    }

    if ($split[0] == "") {
        $res = "/" . $res;
    } else {
        if ($split[0] == "..") {
            $skip++;
        } elseif ($split[0] != ".") {
            if ($skip > 0) {
                $skip--;
            } else {
                $res = $split[0] . $sep . $res;
            }
        }

        while ($skip > 0) {
            $res = ".." . $sep . $res;
            $sep = "/";
            $skip--;
        }
    }

    if ($res == "") { return "." . $sep; }
    return $res;
}

//////////////////////////////////////////////////////////////////////
// Tests

// prints if failure
function test($a, $b) {
    if ($a != $b) {
        echo($a . " != " . $b . "\n");
    }
}

test(normalize(""), ".");
test(normalize("."), ".");
test(normalize("./"), "./");
test(normalize(".."), "..");
test(normalize("../"), "../");
test(normalize("ab/.."), ".");
test(normalize("ab/../"), "./");
test(normalize("./ab"), "ab");
test(normalize("./ab/"), "ab/");
test(normalize("ab"), "ab");
test(normalize("ab/"), "ab/");
test(normalize("/"), "/");
test(normalize("/path/to/here"), "/path/to/here");
test(normalize("/path/to/here/"), "/path/to/here/");
test(normalize("//path//to//here//"), "/path/to/here/");
test(normalize("/path/to/../here"), "/path/here");
test(normalize("/path/to/../here/.."), "/path");
test(normalize("/path/to/../here/../"), "/path/");
test(normalize("/path/to/../../here/.."), "/");
test(normalize("/path/to/../../here"), "/here");
test(normalize("/path/to/../../../here"), "/here");
test(normalize("/path/to/..../here/.."), "/path/to/....");
test(normalize("/path/.b/here/a./.."), "/path/.b/here");
test(normalize("/path/b./here/.a/.."), "/path/b./here");
test(normalize("/../path/to/here"), "/path/to/here");
test(normalize("../path/to/here"), "../path/to/here");
test(normalize("path/../../to/here"), "../to/here");

?>