var gulp = require('gulp');
var mocha = require('gulp-mocha');
var istanbul = require('gulp-istanbul');

// The 'test' task runs mocha's test and uses istanbul's coverage report
// If running in continous Integration environnement, test and coverage report are in xml files
gulp.task('test', ['lint'], function(done) {
  var isCI = process.env.CI != null;

  var coverageReporters = ['text', isCI ? 'lcov' : 'html'];
  var testOpts = isCI ? {
    reporter: 'xunit',
    reporterOptions: {
      output: global.paths.ciOutput
    }
  } : {
    reporter: 'spec',
    useColors: true,
    timeout: 15000
  };

  var coverageOpts = {
    includeUntested: true,
  };

  process.env.NODE_ENV = 'test';
  gulp.src(global.paths.sources)
    .pipe(istanbul(coverageOpts))
    .pipe(istanbul.hookRequire())
    .on('finish', function() {
      gulp.src(global.paths.tests, {
          read: false
        })
        .pipe(mocha(testOpts))
        .on('error', done)
        .pipe(istanbul.writeReports({
          reporters: coverageReporters,
          reportOpts: {
            watermarks: global.thresholds,
            dir: global.paths.coverage
          }
        })).on('end', function() {
          var coverage = istanbul.summarizeCoverage();
          var errs = [];
          for (var kind in global.thresholds) {
            if (coverage[kind].pct < global.thresholds[kind][0]) {
              errs.push(kind + ' are below ' + global.thresholds[kind][
                0
              ] + '%');
            }
          }
          if (errs.length === 0) {
            return done();
          }
          var err = new Error('Insuffisient coverage: ' + errs.join(
            ', '));
          err.showStack = false;
          done(err);
        });
    });
});
