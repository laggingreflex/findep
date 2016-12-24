const fs = require('fs-promise')
const registry = require('package-json')

// const ifArg = a => argv.includes(a)
exports.ifArg = a => process.argv.join(' ').match(new RegExp('-[\\w]*' + a + '|--' + a))

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

// exports.readJsonFromRegistry = packageName =>
//   request({ uri: 'http://registry.npmjs.org/' + packageName }).then(JSON.parse)


