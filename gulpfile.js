var gulp            = require('gulp');
var recipe          = require('gulp-recipe');

gulp.task('lint', recipe.getRecipe('eslint', [
    'lib/**/*.js',
    'scripts/**/*.js',
    '!node_modules/**'
]));
