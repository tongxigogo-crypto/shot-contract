# Changelog

All notable changes are documented here. Format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/); versioning follows
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2026-10-21

First public release. Tooling only: no rule corpus ships with this repository.

### Added

- `shot validate` CLI: checks shot ids, duration window, rule-reference count,
  rule resolution against a supplied library, impression-word detection in
  `purpose`, negative-constraint presence, dialogue axis, top-down map for crowded
  scenes, and timed content. Warnings cover axis reversal, timing gaps, untimed
  content, and moves without a motivation.
- `shot rules` CLI: validates a rule library's shape, duplicate ids, required
  `purpose` / `conditions` / `risk` fields, and provenance.
- `validateStoryboard` / `validateRuleset` programmatic API and a configurable
  limit set (`maxRulesPerShot`, `minDurationSec`, `maxDurationSec`).
- `references/prompt-mapping.md`, `selection-principles.md`,
  `rule-library-format.md`, `evidence.md`.
- `SKILL.md` agent procedure: fix inputs, beat table, four fields per shot, space
  before motion, prompt assembly, validation, frame-level acceptance.
- A three-shot example storyboard and four original example rules.
- 20 contract tests.

### Notes

- Provenance is enforced structurally: a `local-import` library without a
  `source.note` is rejected, and the `.gitignore` keeps private libraries out.
- The validator checks completeness, never rule quality. Quality is the library
  owner's judgement.
