# gulp-recipe
Reusable and sharable recipes for gulp

Many projects require the same gulp tasks with simple tweaks. This system is
designed to make it easy to share and reuse gulp tasks.


## Benefits
- Easily share recipes between projects and open source with other people.
- Smaller gulp file footprint.
- No need to manage gulp dev dependencies in package.json
- Auto download and install of recipe and npm dependencies of recipes.
- npm dependencies (except gulp) of each recipe are installed locally for each recipe. Allows for different 
version dependencies for each recipe.
 

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
gulp.task('lint', recipe.make('eslint', [
    'path/to/my/js',
    '!node_modules/**'
]));
```

## Quick Guides

- [publish a recipe](https://github.com/brianneisler/gulp-recipe/blob/master/doc/guides/guide-publish-recipe.md)


## Dependencies

gulp-recipe is dependent upon
- [bugcore](https://github.com/airbug/bugcore) (0.3.27)
- [commander](https://github.com/tj/commander.js) (2.9.0
- [email-validator](https://github.com/Sembiance/email-validator) (1.0.4)
- [firebase](https://github.com/firebase) (2.4.0) 
- [npm](https://github.com/npm/npm)
- [firebase-token-generator](https://github.com/firebase/firebase-token-generator-node) (2.0.0)
- [fireproof](https://github.com/casetext/fireproof) (3.1.0)
- [fs-extra](https://github.com/jprichardson/node-fs-extra) (0.26.5)
- [fs-promise](https://github.com/kevinbeaty/fs-promise) (0.4.1)
- [ignore](https://github.com/kaelzhang/node-ignore) (2.2.19)
- [lodash]( "4.0.1",
- [npm](https://github.com/npm/npm) (3.7.3)
- [prompt](https://github.com/flatiron/prompt) (1.0.0)
- [request](https://github.com/request/request) (2.69.0)
- [semver](https://github.com/npm/node-semver) (5.1.0)
- [tar-fs](https://github.com/mafintosh/tar-fs) (1.10.0)


## Download Source

The source is available for download from [GitHub](https://github.com/brianneisler/gulp-recipe)


## Install

For use in gulpfile, you can install using [npm](https://www.npmjs.org/package/gulp-recipe)

    npm install gulp-recipe

To publish your own recipes, install globally using [npm](https://www.npmjs.org/package/gulp-recipe)

    npm install -g gulp-recipe


## Usage

In gulpfile:

```javascript
var gulp            = require('gulp');
var recipe          = require('gulp-recipe');

gulp.task('lint', recipe.make('eslint', [
    'path/to/my/js',
    '!node_modules/**'
]));
```


## Usage - Command Line

    recipe [options] [command]


#### Global Options

    -h, --help        output usage information
    -V, --version     output the version number
    -ep, --exec-path  path to execute on


## Commands

### config 

    recipe config [cmd] 


This command lets you set, get, or delete config data from .reciperc config files

## Config Files
- config files are named '.reciperc OR .reciperc.json' and are all in JSON format 
- all config files must have 0600 perms set or they will be ignored
- locations of config files

    built-in: [/path/to/gulp-recipe/config/.reciperc]
    global: (ConfigController.get('prefix')[default: '/usr/local'])/etc/.reciperc
    per-user: '$HOME/.reciperc'
    per-project: '/path/to/project/.reciperc'


### config get

    recipe config get [options] <key>
    
    
get value in config file

#### Options:

    -g, --global   use global config file
    -p, --project  use project config file
    -u, --user     use user config file


#### key
The json path to the value you want to get

Examples
- get auth data from config

    recipe config get auth
 
