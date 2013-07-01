
### Browsers native error list

- `Error` - Generic error.
- `EvalError` - An error in the eval() function has occurred.
- `RangeError` - out of range number value has occured.
- `ReferenceError` - An illegal reference has occurred.
- `SyntaxError` - A syntax error within code inside the eval() function has occurred. All other syntax errors are not caught by try/catch/finally, and will trigger the default browser error message associated with the error. To catch actual syntax errors, you may use the onerror event.
- `TypeError` - An error in the expected variable type has occurred.
- `URIError` - An error when encoding or decoding the URI has occurred (ie: when calling encodeURI()).

### How to create errors

    function MyError(message) {
        this.message = (message || "");
    }
    MyError.prototype = new Error();
    MyError.prototype.name = 'MyError';
    MyError.prototype.constructor = MyError;

    throw new MyError("My Error Message");

### Try/catch/finally

    try {
        throw new TypeError(message);
        // or bad way: throw {"name": "TypeError", "message": message};
    } catch(e) {
        if (e.name === "TypeError") {
            console.warn('Catched', e.message);
        } else {
            throw e;
        }
    } finally {
        console.log('Error cought or not, this is executed.');
    }

### Visual Tests

    try {
        var e = new MyError("My message");
        throw e;
    } catch (ex1) {
        console.log(ex1.stack);
        console.log("ex1 instanceof MyError = " + (ex1 instanceof MyError));
        console.log("ex1 instanceof Error = " + (ex1 instanceof Error));
        console.log("ex1.name = " + ex1.name);
        console.log("ex1.message = " + ex1.message);
        console.log("ex1.constructor = " + ex1.constructor);
    } finally {
        console.log('end');
    }

- - -

Thanks to
<http://stackoverflow.com/questions/783818/how-do-i-create-a-custom-error-in-javascript>
and
<http://stackoverflow.com/questions/1382107/whats-a-good-way-to-extend-error-in-javascript>
