var gulp        = require('gulp');
var eslint      = require('gulp-eslint');
var gulpUtil    = require('gulp-util');

module.exports = function(callback, sources) {
    return gulp.src(sources)
        .pipe(eslint())
        .pipe(eslint.formatEach())
        .pipe(eslint.failOnError())
        .on('error', function(error) {
            gulpUtil.log('Stream Exiting With Error', error);
        });
};
