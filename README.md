# zQuire

## Description

Node module that enables modules requirement and their runtime installation if not found. Modules are returned through a callbacks or promises.

## Installation

## Running
```Bash
npm install --save zQuire
```

## API Documentation

### Basic usage
Example with [Express](http://expressjs.com/)

If ```'express'``` is already installed, it will require and return it. If it is not installed, it will install it and return it in the callback.

```Javascript
var zQuire = require('zQuire');

zQuire('express', function(err, express) {
    if (err) {
       throw err;
    } else {
        var app = express();
        app.get('/', function (req, res) {
            res.send('Hello World!');
        });
        var server = app.listen(3000, function () {
            var host = server.address().address;
            var port = server.address().port;
            console.log('Example app listening at http://%s:%s', host, port);
        });
    }
});
```
*From [Express Hello World example](http://expressjs.com/starter/hello-world.html)*

### Polyfill
```zQuire``` includes [es6-promise](https://github.com/jakearchibald/es6-promise) polyfill to allow the use of es6 promise.

```javascript
var zQuire = require('zQuire');

zQuire('express')
 .then(function(express) {
    var app = express();
    app.get('/', function (req, res) {
        res.send('Hello World!');
    });
    var server = app.listen(3000, function () {
        var port = server.address().port;
        console.log('Example app listening at http://localhost:%s', port);
    });
 })
 .catch(function(err) {
    throw err;
 });
```

## Development
```Bash
gulp
```

## Run Tests

```Bash
gulp test
```
