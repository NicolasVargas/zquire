'use strict';
require('es6-promise').polyfill();
var npm = require('npm');
var debug = require('debug')('zquire');
var introspect = require('introspect-fun');

function installThem(modules, config) {
  return new Promise(function(resolve, reject) {
    npm.load(config, function(loadError) {
      if (loadError) {
        reject(loadError);
      } else {
        debug('npm.load() success. Will install module(s) ' + modules);
        npm.commands.install(modules, function(instError) {
          if (instError) {
            reject(instError);
          } else {
            debug('Module(s) ' + modules +
              ' successfully installed');
            resolve(modules);
          }
        });
      }
    });
  });
}

function requireAll(modules) {
  return modules.map(function(mod) {
    return require(mod);
  });
}

function main(modules, config) {
  return new Promise(function(resolve, reject) {
    var errors = [],
      accu = [],
      toInstall = [];

    modules.forEach(function(mod) {
      try {
        require.resolve(mod);
      } catch (e) {
        errors.push(e);
        toInstall.push(mod);
      }
    });

    if (errors.length === 0) {
      debug('Module(s) ' + modules + ' successfully loaded.');
      resolve(requireAll(modules));
    } else {
      // Ensure all errors are "MODULE_NOT_FOUND"
      errors.forEach(function(current) {
        if (current && current.code !== 'MODULE_NOT_FOUND') {
          reject(current);
        }
      });
      debug('Module(s) ' + toInstall +
        ' were not found. Will install them.');

      installThem(toInstall, config)
        .then(function(installed) {
          accu = accu.map(function(curr) {
            return (curr ? curr : require.resolve(installed.shift()));
          });
          debug('Module(s) ' + toInstall +
            ' successfully installed and require. Will return all modules loaded.'
          );
          resolve(requireAll(modules));
        })
        .catch(function(reason) {
          debug('Even after install, require failed : ' + reason);
          reject(reason);
        });
    }
  });
}
function parseArgs() {
  var modules, config, cb;
  var len = arguments.length;

  if ((typeof arguments[0] === 'function') && (len === 1)) {
    // RequireJS style : simplified commonJS wrapper
    modules = introspect(arguments[0]);
    //First arg is error, need to remove it
    modules.shift();
    cb = arguments[0];
  } else {
    //Modules must be under array form
    modules = (typeof arguments[0] === 'string') ? [arguments[0]] : arguments[0];
    if (len === 2) {
      if (typeof arguments[1] === 'function') {
        cb = arguments[1];
      } else if (typeof arguments[1] === 'object') {
        config = arguments[1];
      }
    } else if (len > 2) {
      config = arguments[1];
      cb = arguments[2];
    }
  }

  return [modules, config, cb];
}

function mainProxy(modules, config, cb) {
  if (!cb) {
    debug('Will return a promise');
    return main(modules, config);
  } else {
    debug('Will use callback');
    main(modules, config)
      .then(function(res) {
        setImmediate(function() {
          cb.apply(null, [null].concat(res));
        });
      })
      .catch(function(err) {
        return cb(err);
      });
  }
}

module.exports = function() {
  var res = parseArgs.apply(null, arguments);
  return mainProxy.apply(null, res);
};
