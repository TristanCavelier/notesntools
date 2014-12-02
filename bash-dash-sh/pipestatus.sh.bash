#!/bin/bash
## also works with sh
echo "false | sed 's,a,b,g'"
echo 'echo "${PIPESTATUS[@]}"'

false | sed 's,a,b,g'
echo "${PIPESTATUS[@]}"
