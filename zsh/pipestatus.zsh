#!/bin/zsh
echo "false | sed 's,a,b,g'"
echo 'echo "${pipestatus[@]}"'

false | sed 's,a,b,g'
echo "${pipestatus[@]}"
