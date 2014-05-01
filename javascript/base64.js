/*jslint indent: 2 */

(function factory(root) {
  "use strict";

  // Copyright (c) 2014 Tristan Cavelier <t.cavelier@free.fr>
  // This program is free software. It comes without any warranty, to
  // the extent permitted by applicable law. You can redistribute it
  // and/or modify it under the terms of the Do What The Fuck You Want
  // To Public License, Version 2, as published by Sam Hocevar. See
  // http://www.wtfpl.net/ for more details.

  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Base64_encoding_and_decoding

  /*
   * Just include this file into your web page with a <script> tag.
   *
   * How to use:
   *
   *     var sB64 = base64.encodeText("my text");
   *     console.log(base64.decodeAsText(sB64)); // logs "my text"
   *
   * API:
   *
   * - base64.encodeText(sText) : sBase64
   * - base64.encodeBinaryString(sBinaryString) : sBase64
   * - base64.encodeBinaryArrayBuffer(aArrayBuffer) : sBase64
   * - base64.decodeAsText(sBase64, [nBlocksSize]) : sText
   * - base64.decodeAsBinaryString(sBase64, [nBlocksSize]) : sBinaryString
   * - base64.decodeAsArrayBuffer(sBase64, [nBlocksSize]) : aArrayBuffer
   * - base64.decodeAsDataURL(sBase64, [nBlocksSize]) : sDataURL
   */

  /*global Uint8Array, URL, Blob */

  var base64 = {};

  function charCodeToUint6(nChr) {
    return (
      nChr > 64 && nChr < 91 ? nChr - 65 : (
        nChr > 96 && nChr < 123 ? nChr - 71 : (
          nChr > 47 && nChr < 58 ? nChr + 4 : (
            nChr === 43 ? 62 : (
              nChr === 47 ? 63 : 0
            )
          )
        )
      )
    );
  }

  base64.charCodeToUint6 = charCodeToUint6;

  function base64DecodeAsUint8Array(sBase64, nBlocksSize) {
    /*jslint regexp: true, bitwise: true */
    var nMod3, nMod4, nUint24 = 0, nOutIdx = 0, nInIdx,
      sB64Enc = sBase64.replace(/[^A-Za-z0-9\+\/]/g, ""),
      nInLen = sB64Enc.length,
      nOutLen = nBlocksSize ? Math.ceil((nInLen * 3 + 1 >> 2) / nBlocksSize) * nBlocksSize : nInLen * 3 + 1 >> 2,
      taBytes = new Uint8Array(nOutLen);

    for (nInIdx = 0; nInIdx < nInLen; nInIdx += 1) {
      nMod4 = nInIdx & 3;
      nUint24 |= charCodeToUint6(sB64Enc.charCodeAt(nInIdx)) << 18 - 6 * nMod4;
      if (nMod4 === 3 || nInLen - nInIdx === 1) {
        for (nMod3 = 0; nMod3 < 3 && nOutIdx < nOutLen; nMod3 += 1, nOutIdx += 1) {
          taBytes[nOutIdx] = nUint24 >>> (16 >>> nMod3 & 24) & 255;
        }
        nUint24 = 0;
      }
    }

    return taBytes;
  }

  function base64DecodeAsArrayBuffer(sBase64, nBlocksSize) {
    return base64DecodeAsUint8Array(sBase64, nBlocksSize).buffer;
  }

  base64.decodeAsArrayBuffer = base64DecodeAsArrayBuffer;

  function base64DecodeAsBinaryString(sBase64, nBlocksSize) {
    var i, l, ua = base64DecodeAsUint8Array(sBase64, nBlocksSize), s = "";
    for (i = 0, l = ua.length; i < l; i += 1) {
      s += String.fromCharCode(ua[i]);
    }
    return s;
  }

  base64.decodeAsBinaryString = base64DecodeAsBinaryString;

  function base64DecodeAsDataURL(sBase64, nBlocksSize) {
    return URL.createObjectURL(new Blob([
      base64DecodeAsUint8Array(sBase64, nBlocksSize).buffer
    ], {"type": "application/octet-stream"}));
  }

  base64.decodeAsDataURL = base64DecodeAsDataURL;

  function utf8Uint8ArrayToString(aBytes) {
    /*jslint plusplus: true, bitwise: true */
    var sView = "", nPart, nLen = aBytes.length, nIdx;

    for (nIdx = 0; nIdx < nLen; ++nIdx) {
      nPart = aBytes[nIdx];
      sView += String.fromCharCode(
        nPart > 251 && nPart < 254 && nIdx + 5 < nLen ? /* six bytes */ (
          /* (nPart - 252 << 32) is not possible in ECMAScript! So...: */
          (nPart - 252) * 1073741824 + (aBytes[++nIdx] - 128 << 24) + (aBytes[++nIdx] - 128 << 18) + (aBytes[++nIdx] - 128 << 12) + (aBytes[++nIdx] - 128 << 6) + aBytes[++nIdx] - 128
        ) : nPart > 247 && nPart < 252 && nIdx + 4 < nLen ? /* five bytes */ (
          (nPart - 248 << 24) + (aBytes[++nIdx] - 128 << 18) + (aBytes[++nIdx] - 128 << 12) + (aBytes[++nIdx] - 128 << 6) + aBytes[++nIdx] - 128
        ) : nPart > 239 && nPart < 248 && nIdx + 3 < nLen ? /* four bytes */ (
          (nPart - 240 << 18) + (aBytes[++nIdx] - 128 << 12) + (aBytes[++nIdx] - 128 << 6) + aBytes[++nIdx] - 128
        ) : nPart > 223 && nPart < 240 && nIdx + 2 < nLen ? /* three bytes */ (
          (nPart - 224 << 12) + (aBytes[++nIdx] - 128 << 6) + aBytes[++nIdx] - 128
        ) : nPart > 191 && nPart < 224 && nIdx + 1 < nLen ? /* two bytes */ (
          (nPart - 192 << 6) + aBytes[++nIdx] - 128
        ) : /* nPart < 127 ? */ /* one byte */ nPart
      );
    }

    return sView;
  }

  base64.utf8Uint8ArrayToString = utf8Uint8ArrayToString;

  function base64DecodeAsText(sBase64, nBlocksSize) {
    return utf8Uint8ArrayToString(
      base64DecodeAsUint8Array(sBase64, nBlocksSize)
    );
  }

  base64.decodeAsText = base64DecodeAsText;

  function uint6ToCharCode(nUint6) {
    return (
      nUint6 < 26 ? nUint6 + 65 : (
        nUint6 < 52 ? nUint6 + 71 : (
          nUint6 < 62 ? nUint6 - 4 : (
            nUint6 === 62 ? 43 : (
              nUint6 === 63 ? 47 : 65
            )
          )
        )
      )
    );
  }

  base64.uint6ToCharCode = uint6ToCharCode;

  function base64EncodeUint8Array(aBytes) {
    /*jslint bitwise: true */
    var nMod3 = 2, sB64Enc = "", nLen = aBytes.length, nUint24 = 0, nIdx;

    for (nIdx = 0; nIdx < nLen; nIdx += 1) {
      nMod3 = nIdx % 3;
      if (nIdx > 0 && (nIdx * 4 / 3) % 76 === 0) { sB64Enc += "\r\n"; }
      nUint24 |= aBytes[nIdx] << (16 >>> nMod3 & 24);
      if (nMod3 === 2 || aBytes.length - nIdx === 1) {
        sB64Enc += String.fromCharCode(uint6ToCharCode(nUint24 >>> 18 & 63), uint6ToCharCode(nUint24 >>> 12 & 63), uint6ToCharCode(nUint24 >>> 6 & 63), uint6ToCharCode(nUint24 & 63));
        nUint24 = 0;
      }
    }

    return sB64Enc.substr(0, sB64Enc.length - 2 + nMod3) + (nMod3 === 2 ? '' : nMod3 === 1 ? '=' : '==');
  }

  function base64EncodeArrayBuffer(aBytes) {
    return base64EncodeUint8Array(new Uint8Array(aBytes));
  }

  base64.encodeArrayBuffer = base64EncodeArrayBuffer;

  function base64EncodeBinaryString(sBytes) {
    var i, l, ua = new Uint8Array(l);
    for (i = 0, l = sBytes.length; i < l; i += 1) {
      ua = sBytes.charCodeAt(i);
    }
    return base64EncodeUint8Array(ua);
  }

  base64.encodeBinaryString = base64EncodeBinaryString;

  function stringToUtf8Uint8Array(sDOMStr) {
    /*jslint plusplus: true, bitwise: true */

    var aBytes, nChr, nStrLen = sDOMStr.length, nArrLen = 0, nMapIdx, nIdx, nChrIdx;

    /* mapping... */

    for (nMapIdx = 0; nMapIdx < nStrLen; nMapIdx += 1) {
      nChr = sDOMStr.charCodeAt(nMapIdx);
      nArrLen += nChr < 0x80 ? 1 : nChr < 0x800 ? 2 : nChr < 0x10000 ? 3 : nChr < 0x200000 ? 4 : nChr < 0x4000000 ? 5 : 6;
    }

    aBytes = new Uint8Array(nArrLen);

    /* transcription... */

    for (nIdx = 0, nChrIdx = 0; nIdx < nArrLen; nChrIdx += 1) {
      nChr = sDOMStr.charCodeAt(nChrIdx);
      if (nChr < 128) {
        /* one byte */
        aBytes[nIdx++] = nChr;
      } else if (nChr < 0x800) {
        /* two bytes */
        aBytes[nIdx++] = 192 + (nChr >>> 6);
        aBytes[nIdx++] = 128 + (nChr & 63);
      } else if (nChr < 0x10000) {
        /* three bytes */
        aBytes[nIdx++] = 224 + (nChr >>> 12);
        aBytes[nIdx++] = 128 + (nChr >>> 6 & 63);
        aBytes[nIdx++] = 128 + (nChr & 63);
      } else if (nChr < 0x200000) {
        /* four bytes */
        aBytes[nIdx++] = 240 + (nChr >>> 18);
        aBytes[nIdx++] = 128 + (nChr >>> 12 & 63);
        aBytes[nIdx++] = 128 + (nChr >>> 6 & 63);
        aBytes[nIdx++] = 128 + (nChr & 63);
      } else if (nChr < 0x4000000) {
        /* five bytes */
        aBytes[nIdx++] = 248 + (nChr >>> 24);
        aBytes[nIdx++] = 128 + (nChr >>> 18 & 63);
        aBytes[nIdx++] = 128 + (nChr >>> 12 & 63);
        aBytes[nIdx++] = 128 + (nChr >>> 6 & 63);
        aBytes[nIdx++] = 128 + (nChr & 63);
      } else { /* if (nChr <= 0x7fffffff) */
        /* six bytes */
        aBytes[nIdx++] = 252 + /* (nChr >>> 32) is not possible in ECMAScript! So...: */ (nChr / 1073741824);
        aBytes[nIdx++] = 128 + (nChr >>> 24 & 63);
        aBytes[nIdx++] = 128 + (nChr >>> 18 & 63);
        aBytes[nIdx++] = 128 + (nChr >>> 12 & 63);
        aBytes[nIdx++] = 128 + (nChr >>> 6 & 63);
        aBytes[nIdx++] = 128 + (nChr & 63);
      }
    }

    return aBytes;
  }

  base64.stringToUtf8Uint8Array = stringToUtf8Uint8Array;

  function base64EncodeText(sText) {
    return base64EncodeUint8Array(stringToUtf8Uint8Array(sText));
  }

  base64.encodeText = base64EncodeText;

  Object.defineProperty(base64, "toScript", {
    "configurable": true,
    "enumerable": false,
    "writable": true,
    "value": function () {
      return "(" + factory.toString() + "(this));";
    }
  });

  root.base64 = base64;

}(this));
