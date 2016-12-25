#!/usr/bin/env node

const {
  args,
  fromCwd,
  readJsonFromFile,
  readJsonFromFileSync,
  readJsonFromRegistry,
  readJsonFromGithubProject,
  log,
  print
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

const loop = (deps, pDep) => Promise.all(Object.entries(deps).map(([dep, ver]) => new Promise((resolve, reject) => {
  if (depsChecked.includes(dep)) {
    return resolve(depsWithNodeGyp)
  } else {
    depsChecked.push(dep)
  }
  if (args.verbose) {
    print(dep + ', ')
  } else {
    print('.')
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

  getJson = getJson.catch(err => {
    if (args.verbose) {
      // console.error(err);
    }
  })

  // if (!args.haltOnErr) {
  //   getJsonFromFile = getJsonFromFile.catch(err => {
  //     if (args.verbose) {
  //       console.error(err);
  //     }
  //   })
  // }
  getJson.then(pkg => {
    // log(pkg);
    if (!pkg) {
      return resolve()
    }
    const deps = getDeps(pkg)
    Promise.all(depsToFind.map(depToFind => new Promise((resolve, reject) => {
      if (depToFind in deps) {
        const include = (pDep ? pDep + ' > ' + dep : dep) + ' > ' + depToFind
        if (!depsWithNodeGyp.includes(include)) {
          depsWithNodeGyp.push(include)
        }
        // return resolve()
      } else {
        // deeper
        // return loop(deps, (pDep || dep)).then(resolve, reject)
      }
      return loop(deps, (pDep || dep)).then(resolve, reject)
    }))).then(resolve, reject)

    // depsToFind.forEach(depToFind => {
    //   if (depToFind in deps) {
    //     const include = pDep ? pDep + ' > ' + dep : dep
    //     if (!depsWithNodeGyp.includes(include)) {
    //       depsWithNodeGyp.push(include)
    //     }
    //     return resolve()
    //   } else {
    //     // deeper
    //     return loop(deps, (pDep || dep)).then(resolve, reject)
    //   }
    // })

  })
})))


let lastLength = 0
let timeout = setTimeout(function repeat() {
  const len = depsChecked.length;
  if (len && len !== lastLength) {
    print('\nChecked ' + len + ' packages ');
  }
  lastLength = len;
  timeout = setTimeout(repeat, 1000)
}, 1000)


let done
if (args.external) {
  if (args.external.includes('/')) {
    done = readJsonFromGithubProject(args.external).then(getDeps).then(loop)
  } else {
    done = readJsonFromRegistry(args.external).then(getDeps).then(loop)
  }
} else {
  done = loop(getDeps(readJsonFromFileSync(fromCwd('package.json'))))
}

done
  .then(() => {
    clearTimeout(timeout)
    log('\n---')
    if (depsWithNodeGyp.length) {
      log('Found', depsWithNodeGyp.length, 'dependencies that use', depsToFind + ':');
      depsWithNodeGyp.map(d => log(d))
    } else {
      log('Could not find any dependencies which use', depsToFind);
      if (!args.checkDevDependencies) {
        log('Use `-D` option to check in devDependencies');
      }
    }
  })
  .catch(console.error)

// process.on('unhandledRejection', console.error)
