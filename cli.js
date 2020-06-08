#!/usr/bin/env node
/**
 * CLI commands for working with git-referenced NPM packages
 * easily in microfrontend-like app architectures.
 *
 * @package: git-package-cli
 * @author:  pospi <pospi@spadgos.com>
 * @since:   2020-06-08
 */

const runCheckoutModule = require('./runCheckoutModule')
const runSyncModule = require('./runSyncModule')
const { processAndVerify } = require('./verifyPackageRef')

function addModuleIdArg(yargs) {
  yargs.positional('moduleId', {
    describe: 'NPM module ID to checkout, as specified in the host repository\'s package.json',
    type: 'string',
  })
}

require('yargs') // eslint-disable-line
  .command('checkout [moduleId]', 'Checkout a git-referenced module as its own independent git repository for local modifications', (yargs) => {
    addModuleIdArg(yargs)
  }, (argv) => {
    runCheckoutModule(argv.moduleId, argv)
  })
  .command('sync [moduleId]', 'Updates the git URI for a referenced git module to match the currently active commit in its local working copy', (yargs) => {
    addModuleIdArg(yargs)
  }, (argv) => {
    runSyncModule(argv.moduleId, argv)
  })
  .option('localdir', {
    alias: 'd',
    type: 'string',
    description: 'Local working directory to clone target module into for development. ' +
                 'If unspecified, defaults to \'submodules/[moduleId]/\' in the same directory as package.json',
  })
  .option('pkgroot', {
    alias: 'r',
    type: 'string',
    description: 'Directory in which a package.json targeting the specified module as a dependency resides. ' +
                 'If unspecified, uses the current or parent directory containing the closest package.json file.',
  })
  .option('verbose', {
    alias: 'v',
    type: 'boolean',
    description: 'Run with verbose logging',
  })
  .demandOption(['moduleId'], 'Please provide the module ID to manage')
  .check((argv) => {
    return processAndVerify(argv.moduleId, process.cwd(), argv.verbose)
  })
  .argv
