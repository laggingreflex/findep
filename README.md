# findep
[![npm](https://img.shields.io/npm/v/findep.svg)](https://www.npmjs.com/package/findep)
[![npm](https://img.shields.io/node/v/findep.svg)](http://nodejs.org)

Goes through a project's dependencies (and their dependencies recursively) to find a specified package.

Useful for finding out if a project has for eg. 'node-gyp' as a dependency.

A lot faster than `npm ls node-gyp` and even [`npm-remote-ls`][npm-remote-ls] (for remote packages) especially with the `--greedy` option.

It can also check a remote github project.

## Install

```sh
npm i -g findep
```

## Usage

```sh
-r, --registry        Check npm registry (otherwise just checks './node_modules' directory). Required with '-e'
-e, --external        Checks an external [npm/github] project (otherwise checks current './' directory). '-r' required
-G, --greedy          Stops as soon as it find any one of the specified dependencies
-D, --dev             Check "devDependencies" (otherwise just checks "dependencies")
--optional            Check "optionalDependencies"
--peer                Check "peerDependencies"
--halt                Halt on errors
-v, --verbose         Verbose output
-h, --help            Shows this help message

Examples:
  # Checks if current project has a 'node-gyp' dependency
  findep node-gyp

  # Checks if the npm package 'node-sass' has a 'node-gyp' dependency
  findep node-gyp -e node-sass

  # Greedily checks if the project 'AngularClass/angular2-webpack-starter' has at least one of these dependencies including "devDependencies":
  $ findep he mime lodash ms -GDr -e AngularClass/angular2-webpack-starter
  Looking for [he, mime, lodash, ms] in AngularClass/angular2-webpack-starter...
  Found 16 dependencies that use [he, mime, lodash, ms]:
  assets-webpack-plugin > lodash
  string-replace-loader > lodash
  karma-coverage > lodash
```
