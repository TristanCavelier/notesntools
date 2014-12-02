#!/bin/sh

#   Copyright (c) 2014 Tristan Cavelier <t.cavelier@free.fr>
#   This program is free software. It comes without any warranty, to
#   the extent permitted by applicable law. You can redistribute it
#   and/or modify it under the terms of the Do What The Fuck You Want
#   To Public License, Version 2, as published by Sam Hocevar. See
#   http://www.wtfpl.net/ for more details.

# depends on: echo, grep, base64, wc


# VARNAME should be `[a-zA-Z_][a-zA-Z0-9_]*`
# KEY should be `[a-zA-Z0-9_]+`


# dict_has_key VARNAME KEY || echo key not found
dict_has_key() { eval "echo \"\$$1\"" | grep -o "^$2 " >/dev/null ; }

# dict_get VARNAME KEY | cat
dict_get() { eval "echo \"\$$1\"" | grep "^$2 " | grep -o "[^ ]*\$" | base64 -d ; }

# number_of_keys=$(dict_length VARNAME)
dict_length() { eval "echo \"\$$1\"" | wc -l ; }

# dict_keys VARNAME | xargs echo
dict_keys() { eval "echo \"\$$1\"" | grep -o "^[a-zA-Z0-9_]*" ; }

# VARNAME=$(dict_remove VARNAME KEY)
dict_remove() { eval "echo \"\$$1\"" | grep -v "^$2 " ; }

# VARNAME=$(echo value | dict_put VARNAME KEY)
dict_put() { echo -n "$2 " ; base64 -w 0 ; echo ; eval "echo \"\$$1\"" | grep -v "^$2 " ; }

# # dict_remove VARNAME KEY
# dict_remove() { eval " $1=\$(echo '$(eval "echo \"\$$1\"" | grep -v "^$2 " | base64 -w 0)' | base64 -d)" ; }
