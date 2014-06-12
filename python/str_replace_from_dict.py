#!/usr/bin/env python
# -*- coding: utf-8 -*-

# Copyright (c) 2014 Tristan Cavelier <t.cavelier@free.fr>
# This program is free software. It comes without any warranty, to
# the extent permitted by applicable law. You can redistribute it
# and/or modify it under the terms of the Do What The Fuck You Want
# To Public License, Version 2, as published by Sam Hocevar. See
# http://www.wtfpl.net/ for more details.

def str_replace_from_dict(string, convertions):
    """    str_replace_from_dict(string, convertions)

    Returns a copy of `string` with some parts replaced following the
    `convertions` dict.

    Example:

        str_replace_from_dict("abcdef", {"a": "b", "b": "c", "c": "d"})
        str_replace_from_dict('<script>alert("XSS");</script>', {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            "'": "&apos;",
            "\"": "&quot;"
        })
    """
    def str_replace_from_dict_rec(string, tuple_list):
        if tuple_list == []: return string
        trans = tuple_list[0]
        split = string.split(trans[0])
        tuple_list = tuple_list[1:]
        i = 0
        for sub_string in split:
            split[i] = str_replace_from_dict_rec(sub_string, tuple_list)
            i += 1
        return trans[1].join(split)
    return str_replace_from_dict_rec(string, [x for x in convertions.items()])

if __name__ == "__main__":
    print(str_replace_from_dict('abcdef', {"a": "b", "b": "c", "c": "d"}))
    print(str_replace_from_dict('<script>alert("XSS");\'&invalid;</script>', {"&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&apos;", "\"": "&quot;"}))
