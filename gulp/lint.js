var gulp = require('gulp');
var eslint = require('gulp-eslint');

// The 'lint' task check that sources and test are compliant
gulp.task('lint', function() {
  return gulp.src(global.paths.sources.concat(global.paths.tests))
    .pipe(eslint())
    .pipe(eslint.format())
});
