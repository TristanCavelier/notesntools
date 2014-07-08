#!/usr/bin/env python
# -*- coding: utf-8 -*-

# Copyright (c) 2014 Tristan Cavelier <t.cavelier@free.fr>
# This program is free software. It comes without any warranty, to
# the extent permitted by applicable law. You can redistribute it
# and/or modify it under the terms of the Do What The Fuck You Want
# To Public License, Version 2, as published by Sam Hocevar. See
# http://www.wtfpl.net/ for more details.

def normalize(path):
    """    normalize(path)

    Returns a normalized version of `path` taking care of ".." and "." parts. It
    removes all useless "/" but keeps the trailing one.

    Examples:

        # normalize path and remove trailing slashes
        path = normalize(path + "/.")
        # normalize path in a chroot
        realpath = CHROOT_REALPATH + normalize("/" + path)
    """
    if path == "." or path == "": return "."
    if path == "..": return ".."

    split = path.split("/")
    skip = 0
    i = len(split) - 1
    res = ""
    sep = ""

    if i > 0:
        if split[i] == "":
            sep = "/"
            i -= 1

    while i > 0:
        if split[i] == "..":
            skip += 1
        elif split[i] != "." and split[i] != "":
            if skip > 0:
                skip -= 1
            else:
                res = split[i] + sep + res
                sep = "/"
        i -= 1

    if split[0] == "":
        res = "/" + res
    else:
        if split[0] == "..":
            skip += 1
        elif split[0] != ".":
            if skip > 0: skip -= 1
            else: res = split[0] + sep + res

        while skip > 0:
            res = ".." + sep + res
            sep = "/"
            skip -= 1

    if res == "": return "." + sep
    return res

######################################################################
# Tests

# prints if failure
def test(a, b):
    if a != b:
        print(a + " != " + b)

test(normalize(""), ".")
test(normalize("."), ".")
test(normalize("./"), "./")
test(normalize(".."), "..")
test(normalize("../"), "../")
test(normalize("ab/.."), ".")
test(normalize("ab/../"), "./")
test(normalize("./ab"), "ab")
test(normalize("./ab/"), "ab/")
test(normalize("ab"), "ab")
test(normalize("ab/"), "ab/")
test(normalize("/"), "/")
test(normalize("/path/to/here"), "/path/to/here")
test(normalize("/path/to/here/"), "/path/to/here/")
test(normalize("//path//to//here//"), "/path/to/here/")
test(normalize("/path/to/../here"), "/path/here")
test(normalize("/path/to/../here/.."), "/path")
test(normalize("/path/to/../here/../"), "/path/")
test(normalize("/path/to/../../here/.."), "/")
test(normalize("/path/to/../../here"), "/here")
test(normalize("/path/to/../../../here"), "/here")
test(normalize("/path/to/..../here/.."), "/path/to/....")
test(normalize("/path/.b/here/a./.."), "/path/.b/here")
test(normalize("/path/b./here/.a/.."), "/path/b./here")
test(normalize("/../path/to/here"), "/path/to/here")
test(normalize("../path/to/here"), "../path/to/here")
test(normalize("path/../../to/here"), "../to/here")
