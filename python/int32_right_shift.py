#!/usr/bin/env python
# -*- coding: utf-8 -*-

def int32_right_shift(X, n):
    """
    Acts like '>>>' operator in javascript, int32 right shift.

        X              n
        -1         >>> 1 = 2147483647 (0x7FFFFFFF)
        0xFFFFFFFF >>> 1 = 2147483647 (0x7FFFFFFF)
    """
    if X < 0: X = ((-X) ^ 0xFFFFFFFF) + 1
    return ((X & 0xFFFFFFFF) >> n)

if __name__ == "__main__":
    def test(a, b, c):
        r = int32_right_shift(a, b)
        if r != c:
            print("(" + hex(a) + ", " + hex(b) + ") " + hex(r) + " != " + hex(c))
    test(-1, 1, 0x7FFFFFFF)
    test(1, 1, 0)
    test(0xFFFFFFFFFFF, 1, 0x7FFFFFFF)
    test(-0xFFFFFFFFFFF, 1, 0)
