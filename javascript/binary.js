
// keywords: js, javascript, ajax binary file, manipulations

////////////////////////////////////////////////////////////////////////////////
// AJAX request for binary files

// with xhr, html5 compatible
// Recommended!
function ajaxGetBinaryString(url, onSuccess, onError, onProgress) {
  var data = null, xhr = new XMLHttpRequest(), f = new FileReader();
  xhr.open("GET", url, true);
  xhr.responseType = "blob";
  xhr.onload = function (e) {
    f.onload = function (e) {
      onSuccess(e.target.result);
      // just use .charCodeAt(0);
    };
    f.onerror = function (e) {
      onError(e);
    };
    f.onprogress = function () {
      onProgress((e.loaded / e.total) * 20 + 80); // between 80% and 100%
      // don't know why it is fired 3 times at 100%
    };
    f.readAsBinaryString(xhr.response);
  };
  xhr.onerror = function (e) {
    onError("Error " + e.target.status + " occurred during reception");
  };
  xhr.onprogress = function (e) {
    onProgress((e.loaded / e.total) * 80); // between 0% and 80%
  };
  xhr.send(data);
}
// with xhr, html5 compatible
function ajaxGetArrayBuffer(url, onSuccess, onError, onProgress) {
  var data = null, xhr = new XMLHttpRequest();
  xhr.open("GET", url, true);
  xhr.responseType = "arraybuffer";
  xhr.onload = function (e) {
    onSuccess(xhr.response);
  };
  xhr.onerror = function (e) {
    onError("Error " + e.target.status + " occurred during reception");
  };
  xhr.onprogress = function (e) {
    onProgress((e.loaded / e.total) * 100); // percentage
  };
  xhr.send(data);
}
// with jQuery, return a kind of binary string but chars can be > 255
// /!\ dangerous
function jQAjaxGetBinaryString(url, onSuccess, onError) {
  $.ajax({
    "url": url,
    "beforeSend": function (xhr) {
      xhr.overrideMimeType("text/plain; charset=x-user-defined");
    }
  }).always(function (one, state, three) {
    if (state != "success") {
      onError(one);
    }
    onSuccess("data:", one);
  });
}
// same as above without jQuery
function ajaxGetBinaryString(url, onSuccess, onError) {
  var data = null, xhr = new XMLHttpRequest();
  xhr.open("GET", url, true);
  xhr.responseType = "text";
  xhr.overrideMimeType("text/plain; charset=x-user-defined");
  xhr.onload = function (e) {
    //console.log(xhr.statusText);
    if (xhr.status >= 200 && xhr.status < 300) {
      onSuccess(xhr.response);
      // use `.charCodeAt(0) & 0xFF;` to get the byte value
    }
  };
  xhr.send(data);
}

////////////////////////////////////////////////////////////////////////////////
// Pseudo binary maniplation

function ord(character) {
  return character.charCodeAt(0) & 0xFF;
}
function stringToCodeArray(string) {
  return string.split("").map(ord);
}
function codeArrayToString(code_array) {
  return String.fromCharCode.apply(String.fromCharCode, code_array);
}
function stringToArrayBuffer(string) {
  var i, ab = new ArrayBuffer(string.length);
  for (i = 0; i < string.length; i += 1) {
    ab[i] = string.charCodeAt(i) & 0xFF;
  }
  return ab;
}
function arrayBufferToString(array_buffer) {
  var i, string = "";
  for (i = 0; i < array_buffer.byteLength; i += 1) {
    string += String.fromCharCode(array_buffer[i]);
  }
  return string;
}
