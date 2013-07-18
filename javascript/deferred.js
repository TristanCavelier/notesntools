/*jslint indent: 2 */

// keywords: js, javascript, deferred, promise, done, fail, then, always, resolve, reject

"use strict";

function Deferred() {
  var state = null, answer, onAnswer = [], promise;

  function Promise() {
    var that = this;

    that.done = function (callback) {
      if (state === null) {
        onAnswer.push(function () {
          if (state === "resolved") {
            callback.apply(that, arguments);
          }
        });
      } else if (state === "resolved") {
        setTimeout(function () {
          callback.apply(that, answer);
        });
      }
      return that;
    };

    that.fail = function (callback) {
      if (state === null) {
        onAnswer.push(function () {
          if (state === "rejected") {
            callback.apply(that, arguments);
          }
        });
      } else if (state === "rejected") {
        setTimeout(function () {
          callback.apply(that, answer);
        });
      }
      return that;
    };

    that.always = function (callback) {
      if (state !== null) {
        setTimeout(function () {
          callback.apply(that, answer);
        });
      } else {
        onAnswer.push(callback);
      }
      return that;
    };

    that.then = function (onSuccess, onError) {
      if (state === null) {
        onAnswer.push(function () {
          if (state === "resolved") {
            onSuccess.apply(that, arguments);
          } else if (state === "rejected") {
            onError.apply(that, arguments);
          }
        });
      } else if (state === "resolved") {
        setTimeout(function () {
          onSuccess.apply(that, answer);
        });
      } else if (state === "rejected") {
        setTimeout(function () {
          onError.apply(that, answer);
        });
      }
      return that;
    };
  }

  promise = new Promise();

  function triggerOnAnswer() {
    onAnswer.forEach(function (callback) {
      setTimeout(function () {
        callback.apply(promise, answer);
      });
    });
    onAnswer = undefined;
  }

  this.resolve = function () {
    if (state !== null) {
      return;
    }
    state = "resolved";
    answer = arguments;
    triggerOnAnswer();
  };

  this.reject = function () {
    if (state !== null) {
      return;
    }
    state = "rejected";
    answer = arguments;
    triggerOnAnswer();
  };

  this.promise = function () {
    return promise;
  };

  this.proxy = function () {
    return {
      "resolve": this.resolve,
      "reject": this.reject
    };
  };
}

Deferred.exec = function (callback) {
  var deferred = new Deferred();
  callback.call(deferred.proxy());
  return deferred.promise();
};

////////////////////////////////////////////////////////////////////////////////
// Tests


var promise = Deferred.exec(function () {
  var that = this;
  setTimeout(function () {
    that.resolve('a');
  }, 50);
}).done(function (a) {
  console.log(1, a);
});

setTimeout(function () {
  promise.done(function (a) {
    console.log(2, a);
  });
}, 100);
