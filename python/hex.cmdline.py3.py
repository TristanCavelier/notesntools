#!/usr/bin/env python3

# Copyright (c) 2014 Tristan Cavelier <t.cavelier@free.fr>
# This program is free software. It comes without any warranty, to
# the extent permitted by applicable law. You can redistribute it
# and/or modify it under the terms of the Do What The Fuck You Want
# To Public License, Version 2, as published by Sam Hocevar. See
# http://www.wtfpl.net/ for more details.

"""usage: hex [-h] [-d] [-i] [-w COLS] [FILE]

Hex encode or decode FILE, or standard input, to standard output.

positional arguments:
  FILE

optional arguments:
  -h, --help            show this help message and exit
  -d, --decode          decode data
  -i, --ignore-garbage  when decoding, ignore non-hex digits
  -w COLS, --wrap COLS  wrap encoded lines after COLS character (default 76).
                        Use 0 to disable line wrapping
"""

import sys, os
import argparse
import binascii

def pipe_encode_no_wrap():
  while True:
    chunk = os.read(sys.stdin.fileno(), 1024)
    if len(chunk) == 0: return 0
    sys.stdout.write("".join("%02X" % b for b in chunk))

def pipe_encode_wrap(wrap):
  byte_length = int(wrap / 2)
  while True:
    chunk = os.read(sys.stdin.fileno(), byte_length)
    if len(chunk) == 0: return 0
    sys.stdout.write("".join("%02X" % b for b in chunk) + "\n")

def pipe_decode_ignore_garbage():
  remain = None
  while True:
    chunk = os.read(sys.stdin.fileno(), 1024)
    if len(chunk) == 0: break
    for b in chunk:
      if (b >= 48 and b <= 57) or (b >= 97 and b <= 102) or (b >= 65 and b <= 70):
        if remain is None: remain = b
        else:
          os.write(sys.stdout.fileno(), binascii.unhexlify(chr(remain) + chr(b)))
          remain = None
  if remain is None: return 0
  sys.stderr.write("hex: invalid input\n")
  return 1

def pipe_decode():
  remain = None
  while True:
    chunk = os.read(sys.stdin.fileno(), 1024)
    if len(chunk) == 0: break
    for b in chunk:
      if b in (0x0D, 0x0A): continue
      if remain is None: remain = b
      else:
        os.write(sys.stdout.fileno(), binascii.unhexlify(chr(remain) + chr(b)))
        remain = None
  if remain is None: return 0
  sys.stderr.write("hex: invalid input\n")
  return 1

def main():
  parser = argparse.ArgumentParser(description='Hex encode or decode FILE, or standard input, to standard output.')
  parser.add_argument("-d", "--decode", dest="decode", default=False, action="store_true", help="decode data")
  parser.add_argument("-i", "--ignore-garbage", dest="ignore_garbage", default=False, action="store_true", help="when decoding, ignore non-hex digits")
  parser.add_argument("-w", "--wrap", metavar="COLS", dest="wrap", default=76, type=int, help="wrap encoded lines after COLS character (default 76). Use 0 to disable line wrapping")
  parser.add_argument("file", metavar="FILE", nargs="?", default=None)
  args = parser.parse_args()
  if args.file is not None:
    sys.stdin = open(args.file, "rb")
  if args.decode:
    if args.ignore_garbage:
      return pipe_decode_ignore_garbage()
    return pipe_decode()
  if args.wrap == 0:
    return pipe_encode_no_wrap()
  if args.wrap % 2 == 0:
    return pipe_encode_wrap(args.wrap)
  return pipe_encode_clever_wrap(args.wrap)

if __name__ == "__main__":
  sys.exit(main())
