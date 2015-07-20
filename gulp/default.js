var gulp = require('gulp');

function reportChange(event) {
  console.log('File ' + event.path + ' was ' + event.type +
    ', running tasks...');
}
gulp.task('default', ['lint'], function() {
  return gulp.watch(global.paths.sources, ['lint']).on('change',
    reportChange);;
});
