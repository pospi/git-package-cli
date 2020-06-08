/**
 * Locates the nearest package.json and retrieves info for the given module ID
 *
 * Stores it all in global state for retrieval elsewhere, but that's cool, this
 * is a single-firing CLI process.
 *
 * @package: git-package-cli
 * @author:  pospi <pospi@spadgos.com>
 * @since:   2020-06-08
 */

const fs = require('fs')
const path = require('path')
const pkgUp = require('pkg-up')

let TARGET_MODULE_GIT_URI, PACKAGE_ROOT_DIR, DEFAULT_WORKING_DIR

function processAndVerify(moduleId, cwd, verbose) {
  if (verbose) console.log(`[verify] searching for package file from ${cwd}`)

  const closestPkgFile = pkgUp.sync({ cwd })
  if (!closestPkgFile) {
    throw new Error('no package.json file found')
  }
  if (verbose) console.log(`[verify] found package file: ${closestPkgFile}`)

  const pkgJSON = JSON.parse(fs.readFileSync(closestPkgFile))
  if (!pkgJSON) {
    throw new Error('malformed package.json file')
  }

  // assign git URI to global state as we read it from the package file
  TARGET_MODULE_GIT_URI = pkgJSON.dependencies[moduleId] || pkgJSON.devDependencies[moduleId]
  if (!TARGET_MODULE_GIT_URI) {
    throw new Error(`module ${moduleId} not found in package.json @ ${closestPkgFile}`)
  }
  if (verbose) console.log(`[verify] found git URI: ${TARGET_MODULE_GIT_URI}`)

  PACKAGE_ROOT_DIR = path.dirname(closestPkgFile)
  DEFAULT_WORKING_DIR = path.join(PACKAGE_ROOT_DIR, 'submodules', moduleId)

  return true // return success for yargs.check
}

module.exports = {
  processAndVerify,
  getModuleGitUri: () => TARGET_MODULE_GIT_URI,
  getPackageRootDir: () => PACKAGE_ROOT_DIR,
  getDefaultWorkingDir: () => DEFAULT_WORKING_DIR,
}
