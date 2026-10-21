import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import { validateRuleset, validateStoryboard } from '../src/validate.mjs';

const repoRoot = fileURLToPath(new URL('..', import.meta.url));
const boardPath = path.join(repoRoot, 'examples/storyboard.json');
const rulesPath = path.join(repoRoot, 'examples/rules.sample.json');

const board = () => JSON.parse(fs.readFileSync(boardPath, 'utf8'));
const ruleset = () => JSON.parse(fs.readFileSync(rulesPath, 'utf8'));
const errorsOf = (result) => result.errors.join('\n');
const warningsOf = (result) => result.warnings.join('\n');

test('the example storyboard passes with its rule library', () => {
  const result = validateStoryboard(board(), { ruleset: ruleset() });
  assert.equal(result.valid, true, errorsOf(result));
  assert.equal(result.warnings.length, 0, warningsOf(result));
  assert.equal(result.summary.shots, 3);
  assert.equal(result.summary.ruleRefs, 4);
});

test('the example rule library is well formed', () => {
  const result = validateRuleset(ruleset());
  assert.equal(result.valid, true, errorsOf(result));
  assert.equal(result.count, 4);
});

test('impression words in purpose are rejected', () => {
  const doc = board();
  doc.shots[0].purpose = 'Make it feel cinematic and 高级感.';
  const result = validateStoryboard(doc, { ruleset: ruleset() });
  assert.equal(result.valid, false);
  assert.match(errorsOf(result), /relies on impression words/);
});

test('more than two rules in one shot is rejected', () => {
  const doc = board();
  doc.shots[0].ruleRefs = ['LOW-1', 'DOLLY-1', 'BLOCK-1'];
  const result = validateStoryboard(doc, { ruleset: ruleset() });
  assert.equal(result.valid, false);
  assert.match(errorsOf(result), /allows at most 2/);
});

test('an unknown rule reference is rejected when a ruleset is supplied', () => {
  const doc = board();
  doc.shots[0].ruleRefs = ['NOT-A-RULE'];
  const result = validateStoryboard(doc, { ruleset: ruleset() });
  assert.equal(result.valid, false);
  assert.match(errorsOf(result), /references unknown rule NOT-A-RULE/);
});

test('an empty negative list is rejected', () => {
  const doc = board();
  doc.shots[0].negative = [];
  const result = validateStoryboard(doc);
  assert.equal(result.valid, false);
  assert.match(errorsOf(result), /negative must contain at least one constraint/);
});

test('shot duration outside the window is rejected', () => {
  const doc = board();
  doc.shots[0].durationSec = 24;
  const result = validateStoryboard(doc);
  assert.equal(result.valid, false);
  assert.match(errorsOf(result), /is above 15s/);
});

test('dialogue without a two-character axis is rejected', () => {
  const doc = board();
  delete doc.shots[1].spatial.axis;
  const result = validateStoryboard(doc);
  assert.equal(result.valid, false);
  assert.match(errorsOf(result), /spatial\.axis must list two characters/);
});

test('three characters without a top-down map is rejected', () => {
  const doc = board();
  delete doc.shots[2].topDownMap;
  const result = validateStoryboard(doc);
  assert.equal(result.valid, false);
  assert.match(errorsOf(result), /no topDownMap/);
});

test('reversing the axis between shots produces a warning, not a hard failure', () => {
  const doc = board();
  doc.shots[2].spatial.axis = ['B', 'A'];
  const result = validateStoryboard(doc, { ruleset: ruleset() });
  assert.equal(result.valid, true, errorsOf(result));
  assert.match(warningsOf(result), /reverses S02/);
});

test('a timing gap produces a warning', () => {
  const doc = board();
  doc.shots[2].startSec = 13;
  const result = validateStoryboard(doc);
  assert.equal(result.valid, true);
  assert.match(warningsOf(result), /does not continue from 11/);
});

test('untimed content produces a warning', () => {
  const doc = board();
  doc.shots[0].content = 'A slow, atmospheric walk down the corridor.';
  const result = validateStoryboard(doc, { ruleset: ruleset() });
  assert.equal(result.valid, true, errorsOf(result));
  assert.match(warningsOf(result), /no timecode segments/);
});

test('a camera move without motivation produces a warning', () => {
  const doc = board();
  delete doc.shots[0].spatial.motivation;
  const result = validateStoryboard(doc, { ruleset: ruleset() });
  assert.equal(result.valid, true);
  assert.match(warningsOf(result), /move is declared without a motivation/);
});

test('duplicate shot ids are rejected', () => {
  const doc = board();
  doc.shots[1].id = 'S01';
  const result = validateStoryboard(doc);
  assert.equal(result.valid, false);
  assert.match(errorsOf(result), /duplicates S01/);
});

test('a local-import ruleset must explain its origin', () => {
  const library = ruleset();
  library.source = { kind: 'local-import' };
  const result = validateRuleset(library);
  assert.equal(result.valid, false);
  assert.match(errorsOf(result), /source\.note is required/);
});

test('a rule without a risk field is rejected', () => {
  const library = ruleset();
  delete library.rules[0].risk;
  const result = validateRuleset(library);
  assert.equal(result.valid, false);
  assert.match(errorsOf(result), /rules\[0\]\.risk must be a non-empty string/);
});

test('limits can be tightened per project', () => {
  const doc = board();
  doc.shots[0].ruleRefs = ['LOW-1'];
  doc.shots[2].ruleRefs = ['BLOCK-1', 'DOLLY-1'];
  const result = validateStoryboard(doc, { ruleset: ruleset(), maxRulesPerShot: 1 });
  assert.equal(result.valid, false);
  assert.match(errorsOf(result), /allows at most 1/);
});

test('the CLI exits 0 for the example storyboard', () => {
  const run = spawnSync(
    process.execPath,
    ['src/cli.mjs', 'validate', '--file', boardPath, '--rules', rulesPath],
    { cwd: repoRoot, encoding: 'utf8' },
  );
  assert.equal(run.status, 0, run.stderr);
  assert.match(run.stdout, /"shots": 3/);
});

test('the CLI exits 1 for an invalid storyboard', () => {
  const run = spawnSync(
    process.execPath,
    ['src/cli.mjs', 'validate', '--file', path.join(repoRoot, 'package.json')],
    { cwd: repoRoot, encoding: 'utf8' },
  );
  assert.equal(run.status, 1, run.stderr);
  assert.match(run.stderr, /Invalid storyboard/);
});

test('the CLI exits 2 without a file argument', () => {
  const run = spawnSync(process.execPath, ['src/cli.mjs', 'validate'], {
    cwd: repoRoot,
    encoding: 'utf8',
  });
  assert.equal(run.status, 2);
  assert.match(run.stderr, /Usage: shot validate/);
});
