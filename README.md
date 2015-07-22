# zquire
## Description
Node module that enables modules requirement and their runtime installation if not found. Modules are returned through a callback or a promise.

## Installation
## Running

```sh
npm install --save zquire
```

## API Documentation
### Basic usage
Example with [Express](http://expressjs.com/)

If `'express'` is already installed, it will require and return it. If it is not installed, it will install it and return it in the callback.

```javascript
var zquire = require('zquire');

zquire('express', function(err, express) {
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

From [Express Hello World example](http://expressjs.com/starter/hello-world.html)

### Deduced modules
If you only give a callback to `zquire`, it will deduce the modules you require with the arguments of your callback by parsing your callback arguments

```javascript
var zquire = require('zquire');

zquire(function(err, express, path, fs, npm) {
    if (err) {
       throw err;
    } else {
        // Use expres, path, fs & npm here
    }
});
```

### Promise Polyfill
`zquire` includes [es6-promise](https://github.com/jakearchibald/es6-promise) polyfill to allow the use of es6 promise.

```javascript
var zquire = require('zquire');

zquire('express')
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

### Command-line config params
You can add npm CLI config params to `zquire`. For example to save the module you require in your `package.json` file if it needs to be installed.

More info about [npm config params](https://docs.npmjs.com/misc/config)

```javascript
var conf = {
  save: true
};

//Callback's style
zquire('async', conf,  function(err, async) {
    if (!err) {
        //use async here
    }
});

//Promise's style
zquire('async', conf)
.then(function(async) {
    //use async here
});
```

## Run Tests

```sh
npm test
```
