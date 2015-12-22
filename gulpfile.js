var gulp            = require('gulp');
var recipe          = require('gulp-recipe');

gulp.task('lint', recipe.get('eslint', [
    'lib/**/*.js',
    'scripts/**/*.js',
    '!node_modules/**'
]));
