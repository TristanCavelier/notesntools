# -*- coding: utf-8 -*-

# keywords: python2, json encode utf-8, not unicode but str

import json

def utf8_deep_json_encode(obj):
    """Convert all unicode to str in deep
    """
    # string -> unicode -> str
    if isinstance(obj, unicode):
        return obj.encode("UTF-8")
    # array -> list
    if isinstance(obj, list):
        for i in xrange(len(obj)):
            obj[i] = utf8_deep_json_encode(obj[i])
        return obj
    # object -> dict
    if isinstance(obj, dict):
        for k, v in obj.items():
            v = utf8_deep_json_encode(v)
            del obj[k]
            obj[utf8_deep_json_encode(k)] = v
        return obj
    # number (int) -> int, long
    # true -> True
    # false -> False
    # null -> None
    return obj

def json_loads(s):
    return utf8_deep_json_encoder(json.loads(s))

j = '{"a":"b","c":[]}'

print(json.loads(j))
print(json_loads(j))
