module.exports = {
    dependencies: [
        'gulp-jest'
    ],
    recipe: function(callback, sources, jestOptions) {
        var gulp    = require('gulp');
        var jest    = require('gulp-jest');

        return gulp.src(sources)
            .pipe(jest(jestOptions));
    }
};
