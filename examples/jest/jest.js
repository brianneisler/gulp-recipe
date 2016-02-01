var gulp    = require('gulp');
var jest    = require('gulp-jest');

module.exports = function(callback, sources, jestOptions) {
    return gulp.src(sources)
        .pipe(jest(jestOptions));
};
