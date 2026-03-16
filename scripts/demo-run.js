#!/usr/bin/env node
const path = require('path');
const { spawnSync } = require('child_process');

const BASE_DIR = path.resolve(__dirname, '..');

function parseArgs() {
  const args = process.argv.slice(2);
  function getArg(flag, fallback = null) {
    const index = args.indexOf(flag);
    return index !== -1 && args[index + 1] ? args[index + 1] : fallback;
  }
  return {
    dealPath: getArg('--deal', 'config/deal.json'),
    scenario: getArg('--scenario', 'core-plus'),
    seed: getArg('--seed', null)
  };
}

function runNodeScript(scriptName, scriptArgs) {
  const result = spawnSync('node', [path.join(BASE_DIR, 'scripts', scriptName), ...scriptArgs], {
    stdio: 'inherit'
  });
  if (result.status !== 0) {
    throw new Error(`${scriptName} failed with exit code ${result.status}`);
  }
}

function main() {
  const args = parseArgs();
  console.log('[demo-run] Step 1/3 - Ingesting deal documents');
  runNodeScript('ingest-deal.js', ['--deal', path.resolve(BASE_DIR, args.dealPath)]);

  console.log('[demo-run] Step 2/3 - Running autonomous simulated orchestration');
  const orchestrateArgs = [
    '--deal',
    path.resolve(BASE_DIR, args.dealPath),
    '--scenario',
    args.scenario
  ];
  if (args.seed != null) {
    orchestrateArgs.push('--seed', String(args.seed));
  }
  runNodeScript('orchestrate.js', orchestrateArgs);

  const dealConfig = require(path.resolve(BASE_DIR, args.dealPath));
  console.log('[demo-run] Step 3/3 - Validating contracts');
  runNodeScript('validate-contracts.js', ['--deal-id', dealConfig.dealId]);

  console.log('[demo-run] Complete');
}

try {
  main();
} catch (error) {
  console.error(`[demo-run] Failed: ${error.message}`);
  process.exit(1);
}
