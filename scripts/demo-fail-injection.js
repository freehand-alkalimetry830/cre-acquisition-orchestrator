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
    scenario: getArg('--scenario', 'value-add'),
    seed: getArg('--seed', '777'),
    failAgent: getArg('--agent', 'estoppel-tracker')
  };
}

function main() {
  const args = parseArgs();
  const orchestratePath = path.join(BASE_DIR, 'scripts', 'orchestrate.js');
  console.log(`[demo-fail-injection] Injecting failure at agent ${args.failAgent}`);
  const result = spawnSync(
    'node',
    [
      orchestratePath,
      '--deal',
      path.resolve(BASE_DIR, args.dealPath),
      '--scenario',
      args.scenario,
      '--seed',
      String(args.seed),
      '--fail-agent',
      args.failAgent
    ],
    { stdio: 'inherit' }
  );

  if (result.status === 0) {
    console.log('[demo-fail-injection] WARNING: run succeeded unexpectedly');
    process.exit(0);
  }

  console.log('[demo-fail-injection] Expected failure observed. Resume with:');
  console.log(
    `node scripts/orchestrate.js --deal ${args.dealPath} --scenario ${args.scenario} --seed ${args.seed} --resume`
  );
  process.exit(0);
}

main();
