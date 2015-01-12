/*jslint indent: 2 */

(function factory(root) {
  "use strict";

  /*
   Copyright (c) 2015 Tristan Cavelier <t.cavelier@free.fr>

   This program is free software. It comes without any warranty, to
   the extent permitted by applicable law. You can redistribute it
   and/or modify it under the terms of the Do What The Fuck You Want
   To Public License, Version 2, as published by Sam Hocevar. See
   below for more details.

   ___________________________________________________________________
  |                                                                   |
  |           DO WHAT THE FUCK YOU WANT TO PUBLIC LICENSE             |
  |                   Version 2, December 2004                        |
  |                                                                   |
  |Copyright (C) 2004 Sam Hocevar <sam@hocevar.net>                   |
  |                                                                   |
  |Everyone is permitted to copy and distribute verbatim or modified  |
  |copies of this license document, and changing it is allowed as long|
  |as the name is changed.                                            |
  |                                                                   |
  |           DO WHAT THE FUCK YOU WANT TO PUBLIC LICENSE             |
  |  TERMS AND CONDITIONS FOR COPYING, DISTRIBUTION AND MODIFICATION  |
  |                                                                   |
  | 0. You just DO WHAT THE FUCK YOU WANT TO.                         |
  |___________________________________________________________________|

  */

  /*jslint indent: 2, nomen: true */

  // dependency: Promise

  // Can cancel promises with `promise.cancel();`.
  function CancellableChain(promise, previous) {
    this._promise = promise || root.Promise.resolve();
    if (previous) { this._previous = previous; }
  }
  CancellableChain.prototype._cancelled = false;
  CancellableChain.prototype._promise = null;
  CancellableChain.prototype._previous = null;
  CancellableChain.prototype._thenValue = null;
  CancellableChain.prototype.then = function (onDone, onFail) {
    var it = this, cc = new CancellableChain(this._promise.then(function (v) {
      delete it._previous;
      if (cc._cancelled) {
        //if (typeof onFail !== "function") { return root.Promise.reject(new Error("Cancelled")); }
        //it._thenValue = onFail(new Error("Cancelled"));
        //return it._thenValue;
        return root.Promise.reject(new Error("Cancelled"));
      }
      if (typeof onDone !== "function") { return v; }
      it._thenValue = onDone(v);
      if (it._cancelled && it._thenValue && typeof it._thenValue.then === "function" && typeof it._thenValue.cancel === "function") {
        try { it._thenValue.cancel(); } catch (ignore) {}
      }
      return it._thenValue;
    }, function (e) {
      delete it._previous;
      if (cc._cancelled) {
        //if (typeof onFail !== "function") { return root.Promise.reject(new Error("Cancelled")); }
        //it._thenValue = onFail(new Error("Cancelled"));
        //return it._thenValue;
        return root.Promise.reject(new Error("Cancelled"));
      }
      if (typeof onFail !== "function") { return root.Promise.reject(e); }
      it._thenValue = onFail(e);
      if (it._cancelled && it._thenValue && typeof it._thenValue.then === "function" && typeof it._thenValue.cancel === "function") {
        try { it._thenValue.cancel(); } catch (ignore) {}
      }
      return it._thenValue;
    }), this);
    return cc;
  };
  CancellableChain.prototype.catch = function (onFail) {
    return this.then(null, onFail);
  };
  CancellableChain.prototype.cancel = function () {
    this._cancelled = true;
    if (this._thenValue && typeof this._thenValue.then === "function" && typeof this._thenValue.cancel === "function") {
      try { this._thenValue.cancel(); } catch (ignore) {}
    }
    if (this._previous && typeof this._previous.then === "function" && typeof this._previous.cancel === "function") {
      try { this._previous.cancel(); } catch (ignore) {}
    }
  };
  CancellableChain.prototype.detach = function () {
    return new CancellableChain(this._promise);
  };
  // var globalChain = new CancellableChain();


  //////////////////////////////////////////////////////////////////////
  // TESTS
  /*global setTimeout, console */
  (function () {
    /*jslint vars: true */
    // should not cancel fulfilled CancellableChain
    var c1 = new CancellableChain(), t = "";
    c1.cancel();
    c1.then(function () { t += 1; }, function (e) { t += 1 + e; });
    setTimeout(function () {
      console.log(t === "1");
    }, 1000);
  }());
  (function () {
    /*jslint vars: true */
    // should not call cancelled then
    var c1 = new CancellableChain(), t = "";
    c1 = c1.then(function () { t += 1; }, function (e) { t += 1 + e; });
    c1.cancel();
    setTimeout(function () {
      console.log(t === "");
    }, 1000);
  }());
  (function () {
    /*jslint vars: true */
    // should pass Error Cancelled to new then
    var c1 = new CancellableChain(), t = "";
    c1 = c1.then(function () { t += 1; }, function (e) { t += 1 + e; });
    c1.cancel();
    c1.then(function () { t += 2; }, function (e) { t += 2 + e; });
    setTimeout(function () {
      console.log(t === "2Error: Cancelled");
    }, 1000);
  }());
  (function () {
    /*jslint vars: true */
    // should traverse empty then()
    var c1 = new CancellableChain(), t = "";
    c1 = c1.then();
    c1.then().then(function () { t += 1; }, function (e) { t += 1 + e; });
    c1.cancel();
    setTimeout(function () {
      console.log(t === "1Error: Cancelled");
    }, 1000);
  }());
  (function () {
    /*jslint vars: true */
    // inner promise should be cancelled
    var c1 = new CancellableChain(), t = "";
    c1 = c1.then(function () {
      c1.cancel();
      var cc = new CancellableChain().then();
      cc.then(function () {
        t += 1;
      }, function (e) {
        t += 1 + e;
      });
      return cc;
    });
    setTimeout(function () {
      console.log(t === "1Error: Cancelled");
    }, 1000);
  }());
  (function () {
    /*jslint vars: true */
    // all cancelled then should pass Error Cancelled to no cancelled then
    var c1 = new CancellableChain(), c2, t = "";
    c1 = c1.then(function () {
      t += "1";
    }, function (e) {
      t += "1" + e;
    });
    c2 = c1.then(function () {
      t += "2";
    }, function (e) {
      t += "2" + e;
    });
    c2.then(function () {
      t += "3";
    }, function (e) {
      t += "3" + e;
    }).then(function () {
      t += "4";
    }, function () {
      t += "4e";
    });
    c2.cancel();
    c1.then(function () {
      t += "5";
    }, function (e) {
      t += "5" + e;
    });
    setTimeout(function () {
      console.log(t === "5Error: Cancelled3Error: Cancelled4");
    }, 1000);
  }());

}(this));
