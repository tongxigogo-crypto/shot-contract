#!/usr/bin/env node
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { runRulesCli, runValidateCli } from './validate.mjs';

const readVersion = () => {
  try {
    const packagePath = fileURLToPath(new URL('../package.json', import.meta.url));
    return JSON.parse(fs.readFileSync(packagePath, 'utf8')).version ?? '0.0.0';
  } catch {
    return '0.0.0';
  }
};

const USAGE = `shot — a contract for AI video storyboards

Usage:
  shot validate --file storyboard.json [options]
  shot rules    --file rules.json
  shot --version
  shot --help

validate options:
  --rules <file>          Rule library used to resolve every ruleRefs entry.
  --max-rules <n>         Rules allowed per shot (default 2).
  --min-duration <sec>    Shortest allowed shot (default 3).
  --max-duration <sec>    Longest allowed shot (default 15).

Exit codes:
  0  passed (warnings may still be printed)
  1  failed
  2  usage error
`;

const [command, ...rest] = process.argv.slice(2);

switch (command) {
  case 'validate':
    runValidateCli(rest);
    break;
  case 'rules':
    runRulesCli(rest);
    break;
  case '--version':
  case '-v':
    console.log(readVersion());
    break;
  case 'help':
  case '--help':
  case '-h':
  case undefined:
    console.log(USAGE);
    break;
  default:
    console.error(`Unknown command: ${command}\n`);
    console.error(USAGE);
    process.exit(2);
}
