#!/usr/bin/env python
# -*- coding: utf-8 -*-

# Copyright (c) 2014 Tristan Cavelier <t.cavelier@free.fr>
# This program is free software. It comes without any warranty, to
# the extent permitted by applicable law. You can redistribute it
# and/or modify it under the terms of the Do What The Fuck You Want
# To Public License, Version 2, as published by Sam Hocevar. See
# http://www.wtfpl.net/ for more details.

def sh_quote(*params):
    return " ".join(("'" + p.replace("'", "'\\''") + "'" for p in params))


### in bash you can do :
# eval -- "$(python sh_quote.py)"

### in python3 you can do :
# import os, sys
# out = os.popen(sh_quote(*['ls', '-1', "my'file;"]))
# out._proc.wait()
# sys.stdout.write(out.read())

######################################################################
# Tests

# prints if failure
def test(a, b):
    if a != b:
        print(a + " != " + b)

test(sh_quote(*['ls', '-1', "my'file;"]), "'ls' '-1' 'my'\\''file;'")
