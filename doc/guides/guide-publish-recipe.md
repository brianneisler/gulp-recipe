# Publish Recipe Guide

<br />
------------------------------------------------------------------------------------

## Create a recipe

First you will need to create your recipe. 


### Anatomy of a 'recipe'

A recipe contains:

- a recipe.json file
- a folder containing the recipe source
- a main file that will return the correct recipe interface


#### recipe.json file

The recipe.json file describes your recipe.

Minimum requirements for a recipe.json

- name:
    unique string that is the name of your recipe
  
- version:
    a semver version number

- main:
    this is the entry point to your recipe

- npmDependencies: (optional)
    a list of npm dependencies that this recipe requires

Example
```json
{
    "name": "eslint",
    "version": "0.0.1",
    "main": "relative/path/to/some-file-in-recipe.js",
    "npmDependencies": {
        "gulp-eslint": "^1.1.1",
        "gulp-util": "^3.0.7"
    }
}
```


### Excluding files from your recipes

A `.recipeignore` file is used to exclude files from your recipe during publish.

`.recipeignore` files follow the same [rules](https://git-scm.com/book/en/v2/Git-Basics-Recording-Changes-to-the-Repository#Ignoring-Files)
as `.gitignore` files:

The following paths are ignored by default

- `.*.swp`
- `._*`
- `.DS_Store`
- `.git`
- `.hg`
- `.lock-wscript`
- `.npmrc`
- `.recipe`
- `.reciperc`
- `.svn`
- `.wafpickle-*`
- `config.gypi`
- `CVS`
- 'node_modules'
- `npm-debug.log`


### Create an Account 

- signup using the `recipe signip` command
```bash
recipe signup
```
- follow prompts on screen


### Publish your recipe

- cd to the base path of your recipe
```bash
cd path/to/recipe
```
- publish your recipe
```bash
recipe publish
```
