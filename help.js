const pkg = require('./package.json')
const { args } = require('./utils')

exports.showUsage = (showDescription) => {
  console.log(`${showDescription ? ('\n    '+pkg.description+'\n') : ''}
    Usage: findep <...dep(s)ToFind> [OPTION]
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
      findep node-gyp -r -e node-sass

      # Greedily checks if the project 'AngularClass/angular2-webpack-starter' has at least one of these dependencies including "devDependencies":
      $ findep he mime lodash ms -GDr -e AngularClass/angular2-webpack-starter
      Looking for [he, mime, lodash, ms] in AngularClass/angular2-webpack-starter...
      Found 16 dependencies that use [he, mime, lodash, ms]:
      assets-webpack-plugin > lodash
      string-replace-loader > lodash
      karma-coverage > lodash
      ...
  `)
}
exports.showErrors = (err) => {
  if (err instanceof Error && !args.verbose) {
    console.error('Error:', err.message)
  } else {
    console.error(err)
  }
}
