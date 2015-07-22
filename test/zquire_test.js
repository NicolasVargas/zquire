'use strict';

var expect = require('chai').expect;
var npm = require('npm');
var uuid = require('node-uuid');

var zquire = require('../lib/zquire.js');

function uninstall(mod, opt, cb) {
  var modules = (typeof mod === 'string') ? [mod] : mod;
  npm.load(opt, function(lErr) {
    if (lErr) {
      cb(new Error(lErr));
    } else {
      npm.commands.uninstall(modules, function(iErr) {
        if (iErr) {
          cb(new Error(iErr));
        } else {
          cb();
        }
      });
    }
  });
}

describe('Will test zquire by using its callback system.', function() {
  describe(
    'Will use zquire basically : zquire("path", callback);',
    function() {
      var path;

      it('Should require "path" with zquire and not fail.',
        function(
          done) {
          zquire('path', function(err, res) {
            expect(err).not.to.exist;
            path = res;
            done();
          });
        });

      it('Should have returned a defined result.', function() {
        expect(path).to.exist;
      });

      it('Should be able to use "path", for example .isAbsolute().',
        function() {
          expect(path.isAbsolute('.')).to.be.false;
        });
    });

  describe(
    'Will require "underscore" which is not installed, install it and use it : zquire("underscore", callback);',
    function() {
      var underscore;

      before(function(done) {
        uninstall('underscore', null, done);
      });

      it('Should require "underscore" with zquire and not fail.',
        function(done) {
          zquire('underscore', function(err, res) {
            expect(err).not.to.exist;
            underscore = res;
            done();
          });
        });

      it('Should have returned a defined result.', function() {
        expect(underscore).to.exist;
      });

      it('Should be able to use "underscore", for example .min().',
        function() {
          expect(underscore.min([10, 5])).to.equal(5);
        });

      after(function(done) {
        uninstall('underscore', null, done);
      });

    });

  describe(
    'Will use zquire with wrong syntax and return an error : zquire(254, callback);',
    function() {
      var mod;
      var zErr;
      it(
        'Should use zquire an return an error.',
        function(
          done) {
          zquire(254, function(err, res) {
            expect(err).to.exist;
            mod = res;
            zErr = err;
            done();
          });
        });

      it('Should have returned an error different from 404.',
        function() {
          expect(zErr.statusCode).not.to.equal(404);
        });

      it('Should have returned an undefined result.', function() {
        expect(mod).not.to.exist;
      });
    });

  describe(
    'Will require a module that does not exist, try to install it and return an error.',
    function() {
      var mod;
      var zErr;

      it('Should require an unknown module and return an error.',
        function(done) {
          zquire(uuid.v1(), function(err, res) {
            expect(err).to.exist;
            zErr = err;
            mod = res;
            done();
          });
        });

      it('Should have returned an error 404.', function() {
        expect(zErr.statusCode).to.equal(404);
      });

      it('Should have returned an undefined result.', function() {
        expect(mod).not.to.exist;
      });
    });


  describe(
    'Will require "async" which is not installed and install it with save flag : zquire("async", {save: true}, callback);',
    function() {
      var zErr;
      var dependencies;

      before(function(done) {
        uninstall('async', {
          save: true
        }, done);
      });

      before(function(done) {
        zquire('async', {
          save: true
        }, function(err) {
          zErr = err;
          done();
        });
      });

      before(function(done) {
        npm.load({
          parseable: true
        }, function(err) {
          if (err) {
            done(new Error(err));
          } else {
            npm.commands.ls(null, true, function(
              lsErr,
              res,
              lite) {
              if (err) {
                done(new Error(lsErr));
              } else {
                dependencies = lite.dependencies;
                done();
              }
            });
          }
        });
      });

      it('Should not have failed.', function() {
        expect(zErr).not.to.exist;
      });

      it('Should have saved "async" in package.json file.',
        function() {
          expect(dependencies.async).to.exist;
        });

      after(function(done) {
        uninstall('async', {
          'save': true
        }, done);
      });
    });

  describe('Will require multiple modules, install some and get all.',
    function() {
      var _accepts, _path, _fs, _vary;

      before(function(done) {
        uninstall(['accepts', 'vary'], {
          'save': true
        }, done);
      });

      it('Should require the modules and not fail.',
        function(done) {
          zquire(['accepts', 'path', 'fs', 'vary'], function(err,
            accepts, path, fs, vary) {
            expect(err).not.to.exist;
            _accepts = accepts;
            _path = path;
            _fs = fs;
            _vary = vary;
            done();
          });
        });

      it('Should have returned defined results.', function() {
        expect(_accepts).to.exist;
        expect(_path).to.exist;
        expect(_fs).to.exist;
        expect(_vary).to.exist;
      });

      after(function(done) {
        uninstall(['accepts', 'vary'], {
          'save': true
        }, done);
      });

    });

  describe('Will require multiple modules deduced with callback.',
    function() {
      var _accepts, _path, _fs, _vary;

      it('Should require the modules and not fail.',
        function(done) {
          zquire(function(err, accepts, path, fs, vary) {
            expect(err).not.to.exist;
            _accepts = accepts;
            _path = path;
            _fs = fs;
            _vary = vary;
            done();
          });
        });

      it('Should have returned defined results.', function() {
        expect(_accepts).to.exist;
        expect(_path).to.exist;
        expect(_fs).to.exist;
        expect(_vary).to.exist;
      });

    });

  describe(
    'Will require multiple modules wrapped into callback and fail because one is unknown',
    function() {
      var _wrongOne, _path;

      it('Should require the modules and not fail.',
        function(done) {
          zquire(function(err, path, unknown_01_module_1258hazn) {
            expect(err).to.exist;
            _wrongOne = unknown_01_module_1258hazn;
            _path = path;
            done();
          });
        });

      it('Should have returned undefined results.', function() {
        expect(_wrongOne).to.not.exist;
        expect(_path).to.not.exist;
      });

    });
});

describe('Will test zquire by using its promises system.', function() {

  describe(
    'Will use zquire basically : require "path" node core module and use it : zquire("path");',
    function() {
      var path;
      var zErr;

      it('Should require "path" with zquire and not fail.',
        function(done) {
          zquire('path')
            .then(function(res) {
              path = res[0];
              done();
            })
            .catch(function(err) {
              expect(zErr).not.to.exist;
              zErr = err;
              done();
            });
        });

      it('Should not have failed.', function() {
        expect(zErr).not.to.exist;
      });

      it('Should have return a defined result.', function() {
        expect(path).to.exist;
      });

      it('Should be able to use "path", for example .isAbsolute().',
        function() {
          expect(path.isAbsolute('.')).to.be.false;
        });
    });

  describe(
    'Will require "underscore" which is not installed, install it and use it : zquire("underscore");',
    function() {
      var underscore;
      var zErr;

      before(function(done) {
        uninstall('underscore', null, done);
      });

      before(function(done) {
        zquire('underscore')
          .then(function(res) {
            underscore = res[0];
            done();
          })
          .catch(function(err) {
            zErr = err;
            done();
          });
      });

      it('Should not have failed.', function() {
        expect(zErr).not.to.exist;
      });

      it('Should have return a defined result.', function() {
        expect(underscore).to.exist;
      });

      it('Should be able to use "underscore", for example .min().',
        function() {
          expect(underscore.min([10, 5])).to.equal(5);
        });

      after(function(done) {
        uninstall('underscore', null, done);
      });

    });

  describe(
    'Will require a module that does not exist, try to install it and return an zErr.',
    function() {
      var mod;
      var zErr;

      it('Should require an unknown module and fail.', function(
        done) {
        zquire(uuid.v1())
          .then(function(res) {
            mod = res;
            done();
          })
          .catch(function(err) {
            expect(err).to.exist;
            zErr = err;
            done();
          });
      });

      it('Should have returned an error 404.', function() {
        expect(zErr.statusCode).to.equal(404);
      });

      it('Should have returned an empty result.', function() {
        expect(mod).not.to.exist;
      });
    });


  describe(
    'Will require "array-flatten" which is not installed and install it with save flag : zquire("array-flatten", { save: true });',
    function() {
      var zErr;
      var dependencies;

      before(function(done) {
        uninstall('array-flatten', {
          save: true
        }, done);
      });

      before(function(done) {
        zquire('array-flatten', {
            save: true
          })
          .then(function() {
            done();
          })
          .catch(function(err) {
            zErr = err;
            done();
          });
      });

      before(function(done) {
        npm.load({
          parseable: true
        }, function(err) {
          if (err) {
            done(new Error(err));
          } else {
            npm.commands.ls(null, true, function(
              lsErr,
              res,
              lite) {
              if (err) {
                done(new Error(lsErr));
              } else {
                dependencies = lite.dependencies;
                done();
              }
            });
          }
        });
      });

      it('Should have returned an undefined error', function() {
        expect(zErr).not.to.exist;
      });

      it('Should have saved "array-flatten" in package.json file.',
        function() {
          expect(dependencies['array-flatten']).to.exist;
        });

      after(function(done) {
        uninstall('array-flatten', {
          'save': true
        }, done);
      });
    });

  describe(
    'Will require multiple modules, install some and get all.',
    function() {
      var _fresh, _path, _fs, _parseurl;


      before(function(done) {
        uninstall(['fresh', 'parseurl'], {
          'save': true
        }, done);
      });
      it('Should require the modules and not fail.',
        function(done) {
          zquire(['fresh', 'path', 'fs', 'parseurl'])
            .then(function(res) {
              _fresh = res[0];
              _path = res[1];
              _fs = res[2];
              _parseurl = res[3];
              done();
            })
            .catch(function(err) {
              expect(err).not.to.exist;
              done();
            });
        });

      it('Should have returned defined results.', function() {
        expect(_fresh).to.exist;
        expect(_path).to.exist;
        expect(_fs).to.exist;
        expect(_parseurl).to.exist;
      });


      after(function(done) {
        uninstall(['fresh', 'parseurl'], {
          'save': true
        }, done);
      });
    });
});
