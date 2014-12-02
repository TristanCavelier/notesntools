#!/bin/sh

#   Copyright (c) 2014 Tristan Cavelier <t.cavelier@free.fr>
#   This program is free software. It comes without any warranty, to
#   the extent permitted by applicable law. You can redistribute it
#   and/or modify it under the terms of the Do What The Fuck You Want
#   To Public License, Version 2, as published by Sam Hocevar. See
#   http://www.wtfpl.net/ for more details.

# depends on: echo, base64, wc, tail, head


# Example:
# $ a=$(echo value | array_push a)
# $ array_get a 1
# value
# $ a=$(echo test | array_push a)
# $ array_get a 2
# test
# $ a=$(array_slice 1 -1) # pop last value
# $ array_length a
# 1


# VARNAME should be `[a-zA-Z_][a-zA-Z0-9_]*`
# INDEX should be `[0-9]+`


# array_get VARNAME INDEX | cat
array_get() { eval "echo \"\$$1\"" | tail -n +2 | head -n $2 | tail -n 1 | base64 -d ; }

# length=$(array_length VARNAME)
array_length() { eval "echo \"\$$1\"" | tail -n +2 | wc -l ; }

# other_arary=$(array_slice VARNAME INDEX INDEX)
# other_array=$(array_slice VARNAME 2 10) # from second to 10th
# other_array=$(array_slice VARNAME 1 -0) # from first to last
# other_array=$(array_slice VARNAME -10 -1) # from 10th to second from the end of the array
array_slice() { echo ; eval "echo \"\$$1\"" | tail -n +2 | { tail -n +$2 2>/dev/null || tail -n $2 ; } | head -n $3 ; }

# VARNAME=$(echo value | array_push VARNAME)
array_push() { eval "echo \"\$$1\"" ; base64 -w 0 ; echo ; }
