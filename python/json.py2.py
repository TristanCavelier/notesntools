# -*- coding: utf-8 -*-

# keywords: python2, json encode utf-8, not unicode but str

import json

def UTF8DeepJsonEncoder(obj):
    """Convert all unicode to str in deep
    """
    # string -> unicode -> str
    if isinstance(obj, unicode):
        return obj.encode("UTF-8")
    # array -> list
    if isinstance(obj, list):
        for i in xrange(len(obj)):
            obj[i] = UTF8DeepJsonEncoder(obj[i])
        return obj
    # object -> dict
    if isinstance(obj, dict):
        for k, v in obj.items():
            v = UTF8DeepJsonEncoder(v)
            del obj[k]
            obj[UTF8DeepJsonEncoder(k)] = v
        return obj
    # number (int) -> int, long
    # true -> True
    # false -> False
    # null -> None
    return obj

j = json.loads('{"a":"b","c":[]}')

print(UTF8DeepJsonEncoder(j))
print(j)
