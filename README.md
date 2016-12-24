# findep

Goes through your dependencies (and their dependencies recursively) to find a specified package.

For eg., find out if your project has a dependency on "node-gyp"

```sh
$ findep node-gyp -D
Looking for 'node-gyp'...
Checking in node_modules/**. Use `-R` option to check in npm registry
Checked 1344 packages...
---
Found 2 dependencies which use node-gyp:
hard-source-webpack-plugin > nan
hard-source-webpack-plugin > prebuild
```

## Install

```sh
npm i -g findep
```

## Usage

From your project dir
```sh
$ findep <dependency-to-find>

  Options
   -D     Check in devDependencies
```
