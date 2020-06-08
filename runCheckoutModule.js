/**
 * Checks out a local working copy of a git-referenced NPM module
 *
 * @package: git-package-cli
 * @author:  pospi <pospi@spadgos.com>
 * @since:   2020-06-08
 */

const fs = require('fs')
const path = require('path')
const spawn = require('child_process').spawn
const mkdirp = require('mkdirp')
const clone = require('git-clone')

const { getModuleGitUri, getPackageRootDir, getDefaultWorkingDir } = require('./verifyPackageRef')

function checkoutModule(moduleId, options) {
  let { verbose, localdir, pkgroot } = options
  if (verbose) console.info(`[checkout] Run checkout on module: ${moduleId}`)

  if (!pkgroot) pkgroot = getPackageRootDir()
  if (!localdir) localdir = getDefaultWorkingDir()

  const repoUri = getModuleGitUri().split('#')[0]
  if (verbose) console.log(`[checkout] cloning ${repoUri} to ${localdir}`)

  if (verbose) console.log(`[checkout] ensure directory exists`)
  mkdirp.sync(localdir)

  if (verbose) console.log(`[checkout] run clone operation...`)
  clone(repoUri, localdir, async (err) => {
    if (err) {
      if (!err.message.match(/128$/)) {
        throw err // message ends with 'status 128' if folder already exists
      }
      if (verbose) console.log(`[checkout] directory already present, assuming success`)
    }
    if (verbose) console.log(`[checkout] clone succeeded.`)

    checkPackageId(moduleId, localdir, verbose)
    await linkModule(localdir, verbose)
    await linkDependency(moduleId, pkgroot)
  })
}

function checkPackageId(moduleId, localdir, verbose) {
  if (verbose) console.log(`[checkout] validate package ID`)

  const localPkg = JSON.parse(fs.readFileSync(path.join(localdir, 'package.json')))
  if (!localPkg || localPkg['name'] !== moduleId) {
    throw new Error('package name in referenced git repository does not match package name given in package.json')
  }
  if (verbose) console.log(`[checkout] package ID matches`)
}

function linkModule(localdir, verbose) {
  if (verbose) console.log(`[checkout] register cloned working copy with NPM...`)

  return new Promise((resolve, reject) => {
    const proc = spawn('npm', ['link'], {
      cwd: localdir,
    })
    proc.on('close', (status) => {
      if (status === 0) {
        if (verbose) console.log(`[checkout] dependency NPM link succeeded.`)
        resolve()
      } else {
        reject(new Error('failed linking module: unable to wire cloned repository to NPM'))
      }
    })
  })
}

function linkDependency(moduleId, pkgroot, verbose) {
  if (verbose) console.log(`[checkout] wire cloned working copy into host project`)

  return new Promise((resolve, reject) => {
    const proc = spawn('npm', ['link', moduleId], {
      cwd: pkgroot,
    })
    proc.on('close', (status) => {
      if (status === 0) {
        if (verbose) console.log(`[checkout] npm linkage into host project succeeded`)
        resolve()
      } else {
        reject(new Error('failed linking module: unable to wire NPM links into host project'))
      }
    })
  })
}

module.exports = checkoutModule
