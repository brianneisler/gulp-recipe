# gulp-recipe
Reusable and sharable recipes for gulp

Many projects require the same gulp tasks with simple tweaks. This system is
designed to make it easy to share and reuse gulp tasks.


NOTE: This documentation is still being written. If you click on a link and it
doesn't go anywhere, it's likely because that portion of the docs hasn't been
written yet. If there are parts of the docs you'd like us to focus on, feel
free to ask!

## Build Status

[![npm version](https://badge.fury.io/js/gulp-recipe.svg)](https://badge.fury.io/js/gulp-recipe)<br />
[![Code Climate](https://codeclimate.com/github/brianneisler/gulp-recipe/badges/gpa.svg)](https://codeclimate.com/github/brianneisler/gulp-recipe)<br />
[![Build Status](https://travis-ci.org/brianneisler/gulp-recipe.svg)](https://travis-ci.org/brianneisler/gulp-recipe)<br />
[![NPM](https://nodei.co/npm/gulp-recipe.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/gulp-recipe/)


## Quick Examples

gulpfile.js
```javascript
var gulp            = require('gulp');
var recipe          = require('gulp-recipe');

// No defining dependencies in package.json or writing of basic gulp tasks.
// gulp-recipe will download and install the task and all dependencies for you!
gulp.task('lint', recipe.get('eslint', [
    'path/to/my/js',
    '!node_modules/**'
]));
```


## Dependencies

gulp-recipe is dependent upon
- [bugcore](https://github.com/airbug/bugcore)
- [npm](https://github.com/npm/npm)


## Download Source

The source is available for download from [GitHub](https://github.com/brianneisler/gulp-recipe)


## Install

For node js, you can install using Node Package Manager [npm](https://www.npmjs.org/package/gulp-recipe)

    npm install gulp-recipe


## Usage

In node js:


```javascript
var gulp            = require('gulp');
var recipe          = require('gulp-recipe');

gulp.task('lint', recipe.get('eslint', [
    'path/to/my/js',
    '!node_modules/**'
]));
```

## Config
* Config files are named '.reciperc OR .reciperc.json' and are all in JSON format 
* All config files must have 0600 perms set or they will be ignored
* Locations of config files
```
built-in: [/path/to/gulp-recipe/config/.reciperc]
global: (ConfigController.get('prefix')[default: '/usr/local'])/etc/.reciperc
per-user: '$HOME/.reciperc'
per-project: '/path/to/project/.reciperc'
```
