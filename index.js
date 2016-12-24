#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const {
  ifArg,
  readJsonFromFile,
  readJsonFromFileSync,
  readJsonFromRegistry
} = require('./utils')

const cwd = process.cwd()
const argv = process.argv.slice(2)

const fromCwd = (...p) => path.join(cwd, ...p)

const depToFind = argv.find(a => !a.startsWith('-'))

if (depToFind) {
  console.log('Looking for \'' + depToFind + '\'...');
} else {
  console.error('Error: Need a dependency to find. Eg.: findep node-gyp')
  process.exit(1)
}

const checkInRegistry = ifArg('registry') || ifArg('R')
if (checkInRegistry) {
  console.log('Checking in npm registry, this may take a while...');
} else {
  console.log('Checking in node_modules/**. Use `-R` option to check in npm registry');
}

const getDeps = pkg => Object.assign({},
  pkg.dependencies,
  ifArg('dev') || ifArg('D') ? pkg.devDependencies : {},
  ifArg('optional') ? pkg.optionalDependencies : {},
  ifArg('peer') ? pkg.peerDependencies : {}, {}
)

const depsChecked = []
const depsWithNodeGyp = []

const loop = (deps, pDep) => Promise.all(Object.entries(deps).map(([dep, ver]) => new Promise((resolve, reject) => {
  if (ifArg('verbose') || ifArg('v')) {
    console.log('Checking', dep, '...');
  }
  if (depsChecked.includes(dep)) {
    return resolve(depsWithNodeGyp)
  } else {
    depsChecked.push(dep)
  }
  let getJsonFromFile = readJsonFromFile(fromCwd('node_modules', dep, 'package.json'))
  let getJson = getJsonFromFile;
  if (checkInRegistry) {
    getJson = getJson.catch(() => readJsonFromRegistry(dep))
  }
  getJson = getJson.catch(err => {
    if (ifArg('verbose') || ifArg('v')) {
      // console.error(err);
    }
  })

  // if (!ifArg('halt')) {
  //   getJsonFromFile = getJsonFromFile.catch(err => {
  //     if (ifArg('verbose') || ifArg('v')) {
  //       console.error(err);
  //     }
  //   })
  // }
  getJson.then(pkg => {
    // console.log(pkg);
    if (!pkg) {
      return resolve()
    }
    const deps = getDeps(pkg)
    if (depToFind in deps) {
      const include = pDep ? pDep + ' > ' + dep : dep
      if (!depsWithNodeGyp.includes(include)) {
        depsWithNodeGyp.push(include)
      }
      return resolve()
    } else {
      // deeper
      return loop(deps, (pDep || dep)).then(resolve, reject)
    }
  })
})))


let timeout = setTimeout(function repeat() {
  console.log('Checked', depsChecked.length, 'packages...');
  timeout = setTimeout(repeat, 1000)
}, 1000)

loop(getDeps(readJsonFromFileSync(fromCwd('package.json'))))
  .then(() => {
    clearTimeout(timeout)
    console.log('---')
    if (depsWithNodeGyp.length) {
      console.log('Found', depsWithNodeGyp.length, 'dependencies which use', depToFind + ':');
      depsWithNodeGyp.map(d => console.log(d))
    } else {
      console.log('Could not find any dependencies which use', depToFind);
    }
  })
  .catch(console.error)

// process.on('unhandledRejection', console.error)
