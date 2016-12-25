const fs = require('fs-promise')
const { join } = require('path')
const yargs = require('yargs')
const registry = require('package-json')
const request = require('client-request/promise')

const cwd = process.cwd()

const args = exports.args = yargs.options({
  external: {
    alias: 'e',
    type: 'string'
  },
  greedy: {
    alias: 'G',
    type: 'boolean'
  },
  registry: {
    alias: 'r',
    type: 'boolean'
  },
  devDependencies: {
    alias: ['dev', 'D'],
    type: 'boolean'
  },
  optionalDependencies: {
    alias: ['optional'],
    type: 'boolean'
  },
  peerDependencies: {
    alias: ['peer'],
    type: 'boolean'
  },
  verbose: {
    alias: ['v'],
    type: 'count'
  },
  halt: {
    type: 'count'
  },
  help: {
    alias: ['h', '?'],
    type: 'boolean'
  },
}).argv

// const argv = process.argv.slice(2)
// const args = exports.args = {
//   has: arg => argv.join(' ').match(new RegExp('-[\\w]*' + arg + '|--' + arg)),
//   _: argv.filter(a => !a.startsWith('-')) // positional args
// }
// args.checkInRegistry = args.has('registry') || args.has('R')
// args.checkDevDependencies = args.has('dev') || args.has('D')
// args.checkOptionalDependencies = args.has('optional')
// args.checkPeerDependencies = args.has('peer')
// args.verbose = args.has('verbose') || args.has('v')
// args.haltOnErr = args.has('halt')
// args.help = args.has('help') || args.has('h') || args.has('\\?')

exports.fromCwd = a => (...path) => join(cwd, ...path)

exports.readJsonFromFileSync = file => JSON.parse(fs.readFileSync(file, 'utf8'))

const fileCache = {}
exports.readJsonFromFile = file => {
  if (!fileCache[file]) {
    // console.log('Reading', file, '...');
  }
  fileCache[file] = fileCache[file] || fs.readJSON(file)
  return fileCache[file]
}

const registryCache = {}
exports.readJsonFromRegistry = (packageName, version) => {
  if (!version) {
    version = 'latest'
  }
  const key = packageName + '@' + version;
  if (!registryCache[key]) {
    // console.log('Fetching', key, '...');
  }
  registryCache[key] = registryCache[key] || registry(packageName, version)
  return registryCache[key]
}

exports.readJsonFromGithubProject = (project) => {
  return request({uri: `https://raw.githubusercontent.com/${project}/master/package.json`}).then(JSON.parse)
}

exports.log = console.log.bind(console)
exports.print = process.stdout.write.bind(process.stdout)

// exports.readJsonFromRegistry = packageName =>
//   request({ uri: 'http://registry.npmjs.org/' + packageName }).then(JSON.parse)
