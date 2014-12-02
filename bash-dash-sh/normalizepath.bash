#!/bin/bash

# Copyright (c) 2014 Tristan Cavelier <t.cavelier@free.fr>
# This program is free software. It comes without any warranty, to
# the extent permitted by applicable law. You can redistribute it
# and/or modify it under the terms of the Do What The Fuck You Want
# To Public License, Version 2, as published by Sam Hocevar. See
# http://www.wtfpl.net/ for more details.

##
# SYNOPSIS
#     normalizepath PATH
#
# DESCRIPTION
#     Prints a normalized version of PATH taking care of ".." and "." parts. It
#     removes useless slashes including the ending one.
#
# EXAMPLE
#     Normalize path and keep ending slash
#         $ _path=test/
#         $ normalizepath "$_path"
#         $ [ "${_path:$((${#_path} - 1)):1}" = "/" ] && echo -n "/"
#
normalizepath() {
    local newpath="$1"
    local tmppath=
    newpath=$(echo "$newpath" | sed -e 's;\(/\|^\)\.\(/\|$\);\1;g' -e 's;/\+;/;g')
    while [ "$tmppath" != "$newpath" ] ; do
        tmppath="$newpath"
        newpath=$(echo "$newpath" | sed 's;\(/\|^\)\([^/]\|[^\./]\{2\}\|[^\./]\.\|\.[^\./]\|[^/]\{3,\}\)/\.\.\(\/\|$\);\1;g')
    done
    newpath=$(echo "$newpath" | sed -e 's;^/\(\.\./\)\(\.\.\(/\)\?\)\?;/;g' -e 's;\(.\)/$;\1;')
    echo -n "${newpath:-.}"
}

normalizepath_keep_ending_slash() {
    normalizepath "$1" || return $?
    [ "${#1}" -gt 1 -a "${1:$((${#1} - 1)):1}" = "/" ] && echo -n "/" || return 0
}

######################################################################
# Tests

# prints if failure
__test() {
    if [ "$1" != "$2" ] ; then
        echo "$1 != $2"
    fi
}

__test "$(normalizepath "")" "."
__test "$(normalizepath ".")" "."
__test "$(normalizepath "..")" ".."
__test "$(normalizepath "ab/..")" "."
__test "$(normalizepath "./ab")" "ab"
__test "$(normalizepath "ab")" "ab"
__test "$(normalizepath "/")" "/"
__test "$(normalizepath "/path/to/here")" "/path/to/here"
__test "$(normalizepath "/path/to/here/")" "/path/to/here"
__test "$(normalizepath "//path//to//here//")" "/path/to/here"
__test "$(normalizepath "/path/to/../here")" "/path/here"
__test "$(normalizepath "/path/to/../here/..")" "/path"
__test "$(normalizepath "/path/to/../here/../")" "/path"
__test "$(normalizepath "/path/to/../../here/..")" "/"
__test "$(normalizepath "/path/to/../../here")" "/here"
__test "$(normalizepath "/path/to/../../../here")" "/here"
__test "$(normalizepath "/path/to/..../here/..")" "/path/to/...."
__test "$(normalizepath "/path/.b/here/a./..")" "/path/.b/here"
__test "$(normalizepath "/path/b./here/.a/..")" "/path/b./here"
__test "$(normalizepath "/../path/to/here")" "/path/to/here"
__test "$(normalizepath "../path/to/here")" "../path/to/here"
__test "$(normalizepath "path/../../to/here")" "../to/here"

# __test "$(normalizepath_keep_ending_slash "./")" "./"
# __test "$(normalizepath_keep_ending_slash "../")" "../"
# __test "$(normalizepath_keep_ending_slash "ab/../")" "./"
# __test "$(normalizepath_keep_ending_slash "./ab/")" "ab/"
# __test "$(normalizepath_keep_ending_slash "ab/")" "ab/"
# __test "$(normalizepath_keep_ending_slash "/")" "/"
# __test "$(normalizepath_keep_ending_slash "/path/to/here/")" "/path/to/here/"
# __test "$(normalizepath_keep_ending_slash "//path//to//here//")" "/path/to/here/"
