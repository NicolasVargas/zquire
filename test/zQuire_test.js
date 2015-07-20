'use strict';

var expect = require('chai').expect;
var npm = require('npm');
var uuid = require('node-uuid');

var zQuire = require('../src/zQuire.js');

function uninstall(mod, opt, cb) {
  npm.load(opt, function(lErr) {
    if (lErr) {
      cb(new Error(lErr));
    } else {
      npm.commands.uninstall([mod], function(iErr) {
        if (iErr) {
          cb(new Error(iErr));
        } else {
          cb();
        }
      });
    }
  });
}

describe(
  'Will test zQuire and its two result methods : by callback and by promise.',
  function() {
    describe('Will use callback system of zQuire.', function() {
      describe(
        'Will use zQuire basically : require "path" node core module and use it.',
        function() {
          var path;
          var error;

          before(function(done) {
            zQuire('path', function(err, res) {
              error = err;
              path = res;
              done();
            });
          });

          it('Should not have failed.', function(done) {
            expect(error).not.to.exist;
            done();
          });

          it('Should be able to use "path".', function(done) {
            expect(path.isAbsolute('.')).to.be.false;
            done();
          });
        });

      describe(
        'Will require "underscore" which is not installed, install it and use it.',
        function() {
          var underscore;
          var error;

          before(function(done) {
            uninstall('underscore', null, done);
          });

          before(function(done) {
            zQuire('underscore', function(err, res) {
              error = err;
              underscore = res;
              done();
            });
          });

          it('Should not have failed.', function(done) {
            expect(error).not.to.exist;
            done();
          });

          it('Should be able to use "underscore".', function(done) {
            expect(underscore.min([10, 5])).to.equal(5);
            done();
          });

          after(function(done) {
            uninstall('underscore', null, done);
          });

        });

      describe('Will use zQuire with wrong syntax', function() {
        var mod;
        var error;

        before(function(done) {
          zQuire(['path'], function(err, res) {
            error = err;
            mod = res;
            done();
          });
        });

        it('Should have returned an error', function(done) {
          expect(error).to.exist;
          done();
        });

        it('Should have returned an error different from 404',
          function(done) {
            expect(error.statusCode).not.to.equal(404);
            done();
          });

        it('Should not have returned a result', function(done) {
          expect(mod).not.to.exist;
          done();
        });
      });

      describe(
        'Will require a module that does not exist, try to install it and return an error.',
        function() {
          var mod;
          var error;

          before(function(done) {
            zQuire(uuid.v1(), function(err, res) {
              error = err;
              mod = res;
              done();
            });
          });

          it('Should have returned an empty result.', function(done) {
            expect(mod).not.to.exist;
            done();
          });

          it('Should have returned an error 404.', function(done) {
            expect(error.statusCode).to.equal(404);
            done();
          });
        });


      describe(
        'Will require "async" which is not installed and install it with save flag .',
        function() {
          var error;
          var dependencies;

          before(function(done) {
            uninstall('async', {
              save: true
            }, done);
          });

          before(function(done) {
            zQuire('async', {
              save: true
            }, function(err) {
              error = err;
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
                npm.commands.ls(null, true, function(lsErr,
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

          it('Should not have failed.', function(done) {
            expect(error).not.to.exist;
            done();
          });

          it('Should have saved "async" in package.json file.',
            function(done) {
              expect(dependencies.async).to.exist;
              done();
            });

          after(function(done) {
            uninstall('async', {
              'save': true
            }, done);
          });
        });
    });


    describe('Will use promises system of zQuire.', function() {

      describe(
        'Will use zQuire basically : require "path" node core module and use it.',
        function() {
          var path;
          var error;

          before(function(done) {
            zQuire('path')
              .then(function(res) {
                path = res;
                done();
              })
              .catch(function(err) {
                error = err;
                done();
              });
          });

          it('Should not have failed.', function(done) {
            expect(error).not.to.exist;
            done();
          });

          it('Should be able to use "path".', function(done) {
            expect(path.isAbsolute('.')).to.be.false;
            done();
          });
        });

      describe(
        'Will require "underscore" which is not installed, install it and use it.',
        function() {
          var underscore;
          var error;

          before(function(done) {
            uninstall('underscore', null, done);
          });

          before(function(done) {
            zQuire('underscore')
              .then(function(res) {
                underscore = res;
                done();
              })
              .catch(function(err) {
                error = err;
                done();
              });
          });

          it('Should not have failed.', function(done) {
            expect(error).not.to.exist;
            done();
          });

          it('Should be able to use "underscore".', function(done) {
            expect(underscore.min([10, 5])).to.equal(5);
            done();
          });

          after(function(done) {
            uninstall('underscore', null, done);
          });

        });

      describe(
        'Will require a module that does not exist, try to install it and return an error.',
        function() {
          var mod;
          var error;

          before(function(done) {
            zQuire(uuid.v1())
              .then(function(res) {
                mod = res;
                done();
              })
              .catch(function(err) {
                error = err;
                done();
              });
          });

          it('Should have returned an empty result.', function(done) {
            expect(mod).not.to.exist;
            done();
          });

          it('Should have returned an error 404.', function(done) {
            expect(error.statusCode).to.equal(404);
            done();
          });
        });


      describe(
        'Will require "array-flatten" which is not installed and install it with save flag .',
        function() {
          var error;
          var dependencies;

          before(function(done) {
            uninstall('array-flatten', {
              save: true
            }, done);
          });

          before(function(done) {
            zQuire('array-flatten', {
                save: true
              })
              .then(function() {
                done();
              })
              .catch(function(err) {
                error = err;
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
                npm.commands.ls(null, true, function(lsErr,
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

          it('Should not have failed.', function(done) {
            expect(error).not.to.exist;
            done();
          });

          it('Should have saved "array-flatten" in package.json file.',
            function(done) {
              expect(dependencies['array-flatten']).to.exist;
              done();
            });

          after(function(done) {
            uninstall('array-flatten', {
              'save': true
            }, done);
          });
        });
    });
  });
