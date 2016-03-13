# gulp-recipe
=============

Package manager for gulp recipes.

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
gulp.task('lint', recipe.make('eslint', {
    src: [
        'path/to/my/js',
        '!node_modules/**'
    ]
}));
```

## Quick Guides

- [publish a recipe](https://github.com/brianneisler/gulp-recipe/blob/master/doc/guides/guide-publish-recipe.md)


## Dependencies

gulp-recipe is dependent upon
- [babel-polyfill](https://github.com/babel/babel) (6.5.0)
- [bitpack](https://github.com/brianneisler/bitpack) (0.1.0)
- [bugcore](https://github.com/airbug/bugcore) (0.3.27)
- [commander](https://github.com/tj/commander.js) (2.9.0
- [lodash](https://github.com/lodash/lodash)(4.0.1)
- [prompt](https://github.com/flatiron/prompt) (1.0.0)


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

gulp.task('lint', recipe.make('eslint', {
    src: [
        'path/to/my/js',
        '!node_modules/**'
    ]
));
```


## Usage - Command Line

    recipe [options] [command]


#### Global Options

    -h, --help        output usage information
    -V, --version     output the version number
    -ep, --exec-path  path to execute on


<br />
------------------------------------------------------------------------------------

## Commands

### config 

    recipe config [cmd] 


This command lets you set, get, or delete config data from .reciperc config files

#### Config Files
- config files are named '.reciperc OR .reciperc.json' and are all in JSON format 
- all config files must have 0600 perms set or they will be ignored
- locations of config files
```
    global: (config.get('prefix')[default: '/usr/local'])/etc/.reciperc
    per-user: '$HOME/.reciperc'
    per-project: '/path/to/project/.reciperc'
```


<br />
------------------------------------------------------------------------------------

### config get

    recipe config get [options] <key>
    
    
get value in config file

#### Options:

    -g, --global   use global config file
    -p, --project  use project config file
    -u, --user     use user config file


#### Params:
    
    <key> The property path to the value you want to get
    

##### Examples

get auth data from config

    recipe config get auth


get deep path from config

    recipe config get some.path.in.config.object


<br />
------------------------------------------------------------------------------------

### config set

    recipe config set [options] <key> <value>
    
    
set value in config file

#### Options:

    -g, --global   use global config file
    -p, --project  use project config file
    -u, --user     use user config file


#### Params:
    
    <key> The property path to the value you want to set
    <value> The value you want to set
    

##### Examples

get auth data from config

    recipe config get auth


get deep path from config

    recipe config get some.path.in.config.object


<br />
------------------------------------------------------------------------------------

### config delete

    recipe config delete [options] <key>
    
    
delete value from config file

#### Options:

    -g, --global   use global config file
    -p, --project  use project config file
    -u, --user     use user config file


#### Params:
    
    <key> The property path to the value you want to delete
    

##### Examples

delete auth data from config

    recipe config delete auth


delete deep path from config

    recipe config delete some.path.in.config.object


<br />
------------------------------------------------------------------------------------

### publish

    recipe publish [options] <path>
    
    
publish a recipe

#### Options:

    -g, --global   use global config file
    -p, --project  use project config file
    -u, --user     use user config file


#### Params:
    
    <path> The file path to the package you want to publish
    

##### Examples

publish current working directory

    recipe publish


publish a specific directory

    recipe publish ./some/path/to/dir
