#!/usr/bin/env node

const {
  args,
  fromCwd,
  readJsonFromFile,
  readJsonFromFileSync,
  readJsonFromRegistry,
  readJsonFromGithubProject,
  log,
  print,
  clearPrint,
  printSpinner
} = require('./utils')
const { showUsage, showErrors } = require('./help')

if (args.help) {
  showUsage(true)
  process.exit(0)
}

const depsToFind = args._
depsToFind.toString = () => '[' + depsToFind.join(', ') + ']'

if (!depsToFind.length) {
  showErrors('Need a dependency to find.')
  showUsage()
  process.exit(1)
}

if (args.external) {
  if (!args.registry) {
    showErrors('`-r` is required when checking an external package')
    process.exit(1)
  }
  log(`Looking for ${depsToFind} in ${args.external}...`);
} else {
  log(`Looking for ${depsToFind}...`);
}

if (args.registry) {
  log('Checking in npm registry, this may take a while...');
} else {
  log('Checking in node_modules/**. Use `-r` option to check in npm registry');
}

if (args.devDependencies) {
  log('Checking "devDependencies", this may take a while...');
} else {
  log('Checking "dependencies". Use `-D` option to check in "devDependencies"');
}

const getDeps = pkg => Object.assign({},
  pkg.dependencies,
  args.devDependencies ? pkg.devDependencies : {},
  args.optionalDependencies ? pkg.optionalDependencies : {},
  args.peerDependencies ? pkg.peerDependencies : {}, {}
)

const depsChecked = []
const depsWithNodeGyp = []

const loop = (deps, pDeps) => Promise.all(Object.entries(deps).map(([dep, ver]) => new Promise((resolve, reject) => {
  if (depsChecked.includes(dep)) {
    return resolve()
  } else {
    depsChecked.push(dep)
  }
  if (depsWithNodeGyp.length && args.greedy) {
    return resolve()
  }

  if (args.verbose) {
    print(dep + ', ')
  } else {
    printSpinner();
  }
  let getJson = Promise.resolve()
  if (args.external) {
    getJson = getJson.then(() => readJsonFromRegistry(dep))
  } else {
    getJson = getJson.then(() => readJsonFromFile(fromCwd('node_modules', dep, 'package.json')))
    if (args.registry) {
      getJson = getJson.catch(() => readJsonFromRegistry(dep))
    }
  }

  if (args.halt) {
    getJson = getJson.catch(err => {
      showErrors(err)
      process.exit(1)
    })
  } else {
    getJson = getJson.catch(err => ({}))
  }

  getJson.then(pkg => {
    // log(pkg);
    if (!pkg) {
      return resolve()
    }
    const deps = getDeps(pkg)
    Promise.all(depsToFind.map(depToFind => new Promise((resolve, reject) => {
      if (depToFind in deps) {
        const include = (pDeps ? pDeps.join(' > ') + ' > ' + dep : dep) + ' > ' + depToFind
        if (!depsWithNodeGyp.includes(include)) {
          depsWithNodeGyp.push(include)
        }
        if (args.greedy) {
          return resolve()
        }
      }
      if (depsWithNodeGyp.length && args.greedy) {
        return resolve()
      } else {
        return loop(deps, (pDeps || []).concat([dep])).then(resolve, reject)
      }
    }))).then(resolve, reject)
  })
})))


let lastLength = 0
let timeout = setTimeout(function repeat() {
  if (depsWithNodeGyp.length && args.greedy) {
    mainDone()
    process.exit(0)
  }
  const len = depsChecked.length;
  if (len && len !== lastLength) {
    clearPrint('Checked ' + len + ' packages  ');
  }
  lastLength = len;
  timeout = setTimeout(repeat, 1000)
}, 1000)


let mainPromise
if (args.external) {
  if (args.external.includes('/')) {
    mainPromise = readJsonFromGithubProject(args.external).then(getDeps).then(loop)
  } else {
    mainPromise = readJsonFromRegistry(args.external).then(getDeps).then(loop)
  }
} else {
  mainPromise = readJsonFromFile(fromCwd('package.json')).then(getDeps).then(loop)
}

mainPromise
  .catch(console.error)
  .then(mainDone)

function mainDone() {
  clearTimeout(timeout)
  log('\n---')
  if (depsWithNodeGyp.length) {
    log('Found', depsWithNodeGyp.length, 'dependencies that use', depsToFind + ':');
    depsWithNodeGyp.map(d => log(d))
  } else {
    log('Could not find any dependencies which use', depsToFind.toString());
    if (!args.checkDevDependencies) {
      log('Use `-D` option to check in devDependencies');
    }
  }
}

// process.on('unhandledRejection', console.error)
