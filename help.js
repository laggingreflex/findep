const pkg = require('./package.json')
const { args } = require('./utils')

exports.showUsage = (showDescription) => {
  console.log(`${showDescription ? ('\n    '+pkg.description+'\n') : ''}
    Usage: findep <...dep(s)ToFind> [OPTION]
      -r, --registry        Check npm registry (otherwise just checks './node_modules' directory). Required with '-e'
      -e, --external        Checks an external [npm/github] project (otherwise checks current './' directory). '-r' required
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

      # Checks if the github project 'AngularClass/angular2-webpack-starter' has these dependencies:
      $ findep he mime lodash ms -r -e AngularClass/angular2-webpack-starter
      Looking for [he, mime, lodash, ms] in AngularClass/angular2-webpack-starter...
      Found 4 dependencies that use [he, mime, lodash, ms]:
      http-server > ecstatic > he
      http-server > ecstatic > mime
      http-server > debug > ms
      http-server > async > lodash
  `)
}
exports.showErrors = (err) => {
  if (err instanceof Error && !args.verbose) {
    console.error('Error:', err.message)
  } else {
    console.error(err)
  }
}
