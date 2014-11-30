#!/usr/bin/env python
# -*- coding: utf-8 -*-

def get(l, i, d=None):
  "get(l, i[,d]) -> l[i] if i in list l, else d.  d defaults to None."
  try: return l[i]
  except IndexError: return d

if __name__ == "__main__":
  def test(a, b):
    print(str(a) + " == " + str(b) + ": " + str(a == b))
  test(get([1, 2, 3], 1), 2)
  test(get([1, 2, 3], 4), None)
  test(get([1, 2, 3], 4, 5), 5)
