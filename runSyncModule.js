/**
 * Syncs the active commit ID of a locally modified git module with the
 * hash referenced in the working directory's package.json
 *
 * @package: git-package-cli
 * @author:  pospi <pospi@spadgos.com>
 * @since:   2020-06-08
 */

const fs = require('fs')
const path = require('path')
const { exec } = require('child_process')

const { getModuleGitUri, getPackageRootDir, getPackageFileContents, getDefaultWorkingDir } = require('./verifyPackageRef')

function runSyncModule(moduleId, options) {
  let { verbose, localdir, pkgroot } = options
  if (verbose) console.info(`[sync] Run sync for module: ${moduleId}`)

  if (!pkgroot) pkgroot = getPackageRootDir()
  if (!localdir) localdir = getDefaultWorkingDir()

  getActiveCommitId(localdir, verbose)
    .then(commitId => updatePackageFile(moduleId, pkgroot, commitId, verbose))
    .catch(console.error.bind(console))
}

function getActiveCommitId(localdir, verbose) {
  if (verbose) console.log(`[sync] read active commit ID`)

  return new Promise((resolve, reject) => {
    exec('git log -1 | grep ^commit | cut -d " " -f 2', {
      cwd: localdir,
    }, (err, commitId) => {
      if (err) {
        if (verbose) console.log(`[sync] error retrieving latest commit hash`)
        return reject(err)
      }
      if (verbose) console.log(`[sync] got active commit hash: ${commitId.trim()}`)
      resolve(commitId.trim())
    })
  })
}

function updatePackageFile(moduleId, pkgroot, commitId, verbose) {
  if (verbose) console.log(`[sync] update ref'd commit hash`)

  const pkgJSON = getPackageFileContents()
  const repoUri = getModuleGitUri().split('#')[0]

  if (pkgJSON.dependencies[moduleId]) {
    pkgJSON.dependencies[moduleId] = `${repoUri}#${commitId}`
  }
  if (pkgJSON.devDependencies[moduleId]) {
    pkgJSON.devDependencies[moduleId] = `${repoUri}#${commitId}`
  }

  if (verbose) console.log(`[sync] write updated package file`)
  fs.writeFileSync(path.join(pkgroot, 'package.json'), JSON.stringify(pkgJSON, undefined, 2))
  if (verbose) console.log(`[sync] package file updated OK`)
}

module.exports = runSyncModule
