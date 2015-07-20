'use strict';
require('es6-promise').polyfill();
var npm = require('npm');
var debug = require('debug')('zQuire');

function installIt(mod, config) {
  return new Promise(function(resolve, reject) {
    npm.load(config, function(loadError) {
      if (loadError) {
        reject(loadError);
      } else {
        debug('npm.load() success');
        npm.commands.install([mod], function(instError) {
          if (instError) {
            reject(instError);
          } else {
            debug('Module "' + mod + '" successfully installed');
            try {
              var res = require(mod);
              resolve(res);
            } catch (e) {
              reject(e);
            }
          }
        });
      }
    });
  });
}

function main(mod, config) {
  return new Promise(function(resolve, reject) {
    try {
      var tmp = require(mod);
      debug('Module "' + mod + '" already installed, returning it');
      resolve(tmp);
    } catch (e) {
      if (e.code !== 'MODULE_NOT_FOUND') {
        debug(e);
        reject(e);
      } else {
        debug('Module "' + mod + '" not found. Trying to install it');
        installIt(mod, config)
          .then(resolve)
          .catch(function(err) {
            debug(err);
            reject(err);
          });
      }
    }
  });
}

module.exports = function() {
  debug('Called');

  var mod, config, cb;

  if (arguments.length > 2) {
    mod = arguments[0];
    config = arguments[1];
    cb = arguments[2];
  } else {
    var toGuess;
    mod = arguments[0];
    toGuess = arguments[1];
    if ((typeof toGuess) === 'function') {
      cb = toGuess;
    } else if ((typeof toGuess) === 'object') {
      config = toGuess;
    }
  }
  if (!cb) {
    debug('Will return a promise');
    return main(mod, config);
  } else {
    debug('Will use callback');
    main(mod, config)
      .then(function(res) {
        return cb(null, res);
      })
      .catch(function(err) {
        return cb(err);
      });
  }
};
