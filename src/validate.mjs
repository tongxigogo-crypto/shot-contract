import fs from 'node:fs';
import path from 'node:path';

/**
 * Defaults come from the selection principles: one shot carries one or two
 * rules, not a stack of them, and an AI video shot stays inside the length a
 * model can actually hold coherent.
 */
export const DEFAULT_LIMITS = {
  minDurationSec: 3,
  maxDurationSec: 15,
  maxRulesPerShot: 2,
};

/**
 * Words that describe an impression instead of a shot. They are the reason a
 * storyboard cannot be executed: nobody knows where the camera goes.
 */
export const VAGUE_TERMS = [
  '电影感',
  '高级感',
  '大气',
  '有质感',
  '氛围感',
  '大片感',
  '震撼',
  '唯美',
  'cinematic',
  'movie feel',
  'premium feel',
  'high-end feel',
  'epic',
  'vibey',
  'aesthetic',
];

const TIMECODE = /^\s*\d{1,2}:\d{2}\s*-\s*\d{1,2}:\d{2}\s/;
const isObject = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);
const isNonEmptyString = (value) => typeof value === 'string' && value.trim().length > 0;
const isFiniteNumber = (value) => typeof value === 'number' && Number.isFinite(value);

const findVagueTerms = (text) => {
  if (!isNonEmptyString(text)) return [];
  const lower = text.toLowerCase();
  return VAGUE_TERMS.filter((term) => lower.includes(term.toLowerCase()));
};

/**
 * Validate a storyboard against the shot contract.
 *
 * `errors` block a shoot. `warnings` are things a reviewer must acknowledge,
 * not silent passes.
 *
 * @param {object} board Parsed storyboard JSON.
 * @param {object} [options]
 * @param {object} [options.ruleset] Parsed rule library; when present, every
 *   `ruleRefs` entry must resolve to a rule id.
 * @param {number} [options.maxRulesPerShot]
 * @param {number} [options.minDurationSec]
 * @param {number} [options.maxDurationSec]
 * @returns {{ valid: boolean, errors: string[], warnings: string[], summary: object }}
 */
export function validateStoryboard(board, options = {}) {
  const limits = { ...DEFAULT_LIMITS, ...pickLimits(options) };
  const errors = [];
  const warnings = [];

  if (!isObject(board)) {
    return {
      valid: false,
      errors: ['storyboard root must be an object'],
      warnings: [],
      summary: { shots: 0 },
    };
  }

  if (!isNonEmptyString(board.schemaVersion)) errors.push('schemaVersion must be a non-empty string');
  if (!isNonEmptyString(board.projectId ?? board.content?.projectId)) {
    errors.push('projectId must be a non-empty string');
  }

  const shots = Array.isArray(board.shots) ? board.shots : null;
  if (!shots) {
    errors.push('shots must be an array');
    return { valid: false, errors, warnings, summary: { shots: 0 } };
  }
  if (shots.length === 0) errors.push('shots must not be empty');

  const knownRules = collectRuleIds(options.ruleset);
  const seenIds = new Set();
  let totalDuration = 0;
  let ruleCount = 0;

  for (const [index, shot] of shots.entries()) {
    const label = `shots[${index}]`;
    if (!isObject(shot)) {
      errors.push(`${label} must be an object`);
      continue;
    }

    if (!isNonEmptyString(shot.id)) {
      errors.push(`${label}.id must be a non-empty string`);
    } else if (seenIds.has(shot.id)) {
      errors.push(`${label}.id duplicates ${shot.id}`);
    } else {
      seenIds.add(shot.id);
    }

    // Duration: long enough to read, short enough for a model to hold.
    if (!isFiniteNumber(shot.durationSec)) {
      errors.push(`${label}.durationSec must be a number`);
    } else {
      totalDuration += shot.durationSec;
      if (shot.durationSec < limits.minDurationSec) {
        errors.push(`${label}.durationSec ${shot.durationSec} is below ${limits.minDurationSec}s`);
      }
      if (shot.durationSec > limits.maxDurationSec) {
        errors.push(`${label}.durationSec ${shot.durationSec} is above ${limits.maxDurationSec}s`);
      }
    }

    // Purpose: a dramatic motive, not an adjective.
    if (!isNonEmptyString(shot.purpose)) {
      errors.push(`${label}.purpose must be a non-empty string`);
    } else {
      const vague = findVagueTerms(shot.purpose);
      if (vague.length > 0) {
        errors.push(
          `${label}.purpose relies on impression words (${vague.join(', ')}); state the dramatic motive instead`,
        );
      }
    }

    // Rule references: restrained, and resolvable.
    const refs = shot.ruleRefs;
    if (!Array.isArray(refs) || refs.length === 0) {
      errors.push(`${label}.ruleRefs must contain at least one rule id`);
    } else {
      ruleCount += refs.length;
      if (refs.length > limits.maxRulesPerShot) {
        errors.push(
          `${label}.ruleRefs has ${refs.length} rules; the selection principle allows at most ${limits.maxRulesPerShot}`,
        );
      }
      for (const [refIndex, ref] of refs.entries()) {
        if (!isNonEmptyString(ref)) {
          errors.push(`${label}.ruleRefs[${refIndex}] must be a non-empty string`);
        } else if (knownRules && !knownRules.has(ref)) {
          errors.push(`${label}.ruleRefs references unknown rule ${ref} (not present in the ruleset)`);
        }
      }
    }

    // Negative constraints: what the model must not invent.
    if (!Array.isArray(shot.negative) || shot.negative.length === 0) {
      errors.push(`${label}.negative must contain at least one constraint`);
    }

    // Timed content: an AI shot needs a beat structure, not a mood.
    const content = shot.content;
    if (!isNonEmptyString(content)) {
      errors.push(`${label}.content must be a non-empty string`);
    } else if (!TIMECODE.test(content)) {
      warnings.push(
        `${label}.content has no timecode segments (expected "00:00-00:02 ..."); a model cannot pace an untimed description`,
      );
    }

    // Spatial anchors: dialogue needs an axis; crowded scenes need a map.
    const spatial = shot.spatial;
    const characters = Array.isArray(shot.characters) ? shot.characters : [];
    const hasDialogue = isNonEmptyString(shot.dialogue) || Array.isArray(shot.dialogue);
    if (hasDialogue) {
      if (!isObject(spatial) || !Array.isArray(spatial.axis) || spatial.axis.length < 2) {
        errors.push(`${label}.spatial.axis must list two characters when the shot has dialogue (prevents axis jumps)`);
      }
    }
    if (characters.length >= 3 && !isObject(shot.topDownMap)) {
      errors.push(
        `${label} has ${characters.length} characters and no topDownMap; map positions and camera route before writing the prompt`,
      );
    }
    if (isObject(spatial) && Array.isArray(spatial.axis) && spatial.axis.length >= 2) {
      const previous = shots[index - 1];
      const previousAxis = isObject(previous?.spatial) ? previous.spatial.axis : null;
      if (Array.isArray(previousAxis) && previousAxis.length >= 2) {
        if (axisReversed(previousAxis, spatial.axis)) {
          warnings.push(
            `${label}.spatial.axis reverses ${previous.id ?? 'the previous shot'} (${previousAxis.join('/')} → ${spatial.axis.join('/')}); confirm this is an intentional 180° break`,
          );
        }
      }
    }

    // Motivated camera: a move has to be triggered by something in frame.
    if (isObject(spatial) && isNonEmptyString(spatial.move) && !isNonEmptyString(spatial.motivation)) {
      warnings.push(`${label}.spatial.move is declared without a motivation (what in frame triggers it?)`);
    }
  }

  // Timeline continuity.
  let cursor = 0;
  for (const [index, shot] of shots.entries()) {
    if (!isObject(shot) || !isFiniteNumber(shot.durationSec)) continue;
    const start = isFiniteNumber(shot.startSec) ? shot.startSec : cursor;
    if (isFiniteNumber(shot.startSec) && Math.abs(shot.startSec - cursor) > 0.01) {
      warnings.push(
        `shots[${index}].startSec ${shot.startSec} does not continue from ${cursor}; check for a gap or overlap`,
      );
    }
    cursor = start + shot.durationSec;
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    summary: {
      projectId: board.projectId ?? board.content?.projectId,
      shots: shots.length,
      totalDurationSec: Number(totalDuration.toFixed(2)),
      ruleRefs: ruleCount,
      ruleset: options.ruleset ? `${knownRules.size} known rules` : 'not provided',
      limits,
    },
  };
}

/**
 * Validate a rule library. The library is user-supplied: this function checks
 * shape and completeness, never content quality.
 */
export function validateRuleset(ruleset) {
  const errors = [];
  if (!isObject(ruleset)) {
    return { valid: false, errors: ['ruleset root must be an object'] };
  }
  if (!isNonEmptyString(ruleset.schemaVersion)) errors.push('schemaVersion must be a non-empty string');
  if (!isObject(ruleset.source)) {
    errors.push('source must describe where the rules came from (local-import, original, licensed)');
  } else if (!isNonEmptyString(ruleset.source.kind)) {
    errors.push('source.kind must be a non-empty string');
  }
  if (isObject(ruleset.source) && ruleset.source.kind === 'local-import' && !isNonEmptyString(ruleset.source.note)) {
    errors.push('source.note is required for local-import rulesets so the origin stays auditable');
  }

  const rules = Array.isArray(ruleset.rules) ? ruleset.rules : null;
  if (!rules) {
    errors.push('rules must be an array');
    return { valid: false, errors };
  }

  const seen = new Set();
  for (const [index, rule] of rules.entries()) {
    const label = `rules[${index}]`;
    if (!isObject(rule)) {
      errors.push(`${label} must be an object`);
      continue;
    }
    if (!isNonEmptyString(rule.id)) {
      errors.push(`${label}.id must be a non-empty string`);
    } else if (seen.has(rule.id)) {
      errors.push(`${label}.id duplicates ${rule.id}`);
    } else {
      seen.add(rule.id);
    }
    for (const field of ['purpose', 'conditions', 'risk']) {
      if (!isNonEmptyString(rule[field])) errors.push(`${label}.${field} must be a non-empty string`);
    }
  }

  return { valid: errors.length === 0, errors, count: rules.length };
}

const pickLimits = (options) => {
  const limits = {};
  for (const key of ['minDurationSec', 'maxDurationSec', 'maxRulesPerShot']) {
    if (isFiniteNumber(options[key])) limits[key] = options[key];
  }
  return limits;
};

const collectRuleIds = (ruleset) => {
  if (!isObject(ruleset) || !Array.isArray(ruleset.rules)) return null;
  return new Set(ruleset.rules.map((rule) => rule?.id).filter(isNonEmptyString));
};

const axisReversed = (a, b) => {
  if (a.length < 2 || b.length < 2) return false;
  const left = [String(a[0]), String(a[1])];
  const right = [String(b[0]), String(b[1])];
  return left[0] === right[1] && left[1] === right[0];
};

const readJson = (file) => {
  const absolute = path.resolve(file);
  try {
    return { absolute, data: JSON.parse(fs.readFileSync(absolute, 'utf8')) };
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    const wrapped = new Error(`Cannot read JSON: ${absolute}\n${reason}`);
    wrapped.code = 'JSON_UNREADABLE';
    throw wrapped;
  }
};

const USAGE =
  'Usage: shot validate --file storyboard.json [--rules rules.json] [--max-rules 2] [--min-duration 3] [--max-duration 15]';

/** CLI entry point for `shot validate`. Exits 0 / 1 / 2. */
export function runValidateCli(args) {
  const rest = args[0] === 'validate' ? args.slice(1) : args;
  const valueOf = (flag) => {
    const index = rest.indexOf(flag);
    return index >= 0 ? rest[index + 1] : undefined;
  };

  const file = valueOf('--file') ?? rest.find((arg) => !arg.startsWith('--'));
  if (!file) {
    console.error(USAGE);
    process.exit(2);
  }

  const numeric = (flag, fallback) => {
    const raw = valueOf(flag);
    const parsed = Number(raw);
    return Number.isFinite(parsed) ? parsed : fallback;
  };

  const options = {
    maxRulesPerShot: numeric('--max-rules', DEFAULT_LIMITS.maxRulesPerShot),
    minDurationSec: numeric('--min-duration', DEFAULT_LIMITS.minDurationSec),
    maxDurationSec: numeric('--max-duration', DEFAULT_LIMITS.maxDurationSec),
  };

  let board;
  try {
    board = readJson(file).data;
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  }

  const rulesFile = valueOf('--rules');
  if (rulesFile) {
    try {
      const ruleset = readJson(rulesFile).data;
      const check = validateRuleset(ruleset);
      if (!check.valid) {
        console.error(`Invalid ruleset: ${path.resolve(rulesFile)}`);
        for (const error of check.errors) console.error(`- ${error}`);
        process.exit(1);
      }
      options.ruleset = ruleset;
    } catch (error) {
      console.error(error instanceof Error ? error.message : String(error));
      process.exit(1);
    }
  }

  const result = validateStoryboard(board, options);

  if (result.warnings.length > 0) {
    for (const warning of result.warnings) console.error(`warning: ${warning}`);
  }

  if (!result.valid) {
    console.error(`Invalid storyboard: ${path.resolve(file)}`);
    for (const error of result.errors) console.error(`- ${error}`);
    process.exit(1);
  }

  console.log(JSON.stringify({ file: path.resolve(file), ...result.summary, warnings: result.warnings.length }, null, 2));
}

/** CLI entry point for `shot rules`. */
export function runRulesCli(args) {
  const rest = args[0] === 'rules' ? args.slice(1) : args;
  const index = rest.indexOf('--file');
  const file = index >= 0 ? rest[index + 1] : rest[0];
  if (!file) {
    console.error('Usage: shot rules --file rules.json');
    process.exit(2);
  }
  let ruleset;
  try {
    ruleset = readJson(file).data;
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
  const result = validateRuleset(ruleset);
  if (!result.valid) {
    console.error(`Invalid ruleset: ${path.resolve(file)}`);
    for (const error of result.errors) console.error(`- ${error}`);
    process.exit(1);
  }
  console.log(JSON.stringify({ file: path.resolve(file), rules: result.count }, null, 2));
}
