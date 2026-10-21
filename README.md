# shot-contract

A checkable contract for AI video storyboards.

It does not generate video. It stops a storyboard from being a paragraph of
adjectives that a model has to guess its way through.

```sh
shot validate --file storyboard.json --rules rules.json
```

## The problem

An AI video prompt usually fails for one of five reasons, and none of them are
"the model isn't good enough":

| What happens | Missing in the storyboard |
| --- | --- |
| The shot drifts; nobody knows where to cut | no timecode, no beat structure |
| Everyone ends up on the same screen side | no axis between characters |
| The camera moves for no reason | no in-frame trigger for the move |
| Faces morph, extra people appear, signage is invented | no negative constraints |
| It looks expensive and means nothing | "purpose" was an adjective |

`shot-contract` makes each of those a validation failure instead of a note in a
review you never wrote down.

## What it checks

| Rule | Why |
| --- | --- |
| Every shot carries at least one `ruleRefs` entry, at most two by default | Three camera ideas in a ten-second generation produces a shot that compromises all three |
| `purpose` must not rely on impression words (`电影感`, `高级感`, `cinematic`, `epic`, …) | An adjective cannot be executed |
| Shot duration stays inside 3–15s by default | Outside that window an AI shot stops holding coherence |
| `negative` must contain at least one constraint | The model fills silence with invention |
| Dialogue shots must declare a two-character `spatial.axis` | The most common avoidable failure is an axis jump on the cut |
| Three or more characters require a `topDownMap` | Geography decided in the prompt is geography decided too late |
| `ruleRefs` must resolve against the supplied rule library | A shot citing a rule that does not exist is a shot with no spatial setup |
| Adjacent shots with reversed axes, timing gaps, untimed content, or unmotivated moves raise warnings | Warnings are decisions a reviewer must acknowledge |

Errors block the shoot. Warnings are printed and counted.

## Quick start

```sh
git clone https://github.com/tongxigogo-crypto/shot-contract.git
cd shot-contract
npm test                    # 20 contract tests, no install step
npm run validate:examples
```

Point it at your own storyboard:

```sh
node src/cli.mjs validate --file path/to/storyboard.json --rules path/to/rules.json
```

## The rule library is yours, not shipped here

This repository contains **format and tooling only**. It does not include a rule
corpus, and it will not accept a pull request that adds one copied from a book,
a paid course, or another person's notes.

```json
{
  "schemaVersion": "0.1",
  "source": { "kind": "original", "note": "..." },
  "rules": [
    {
      "id": "OTS-1",
      "title": "Over-the-shoulder reverse",
      "purpose": "…",
      "conditions": "…",
      "risk": "…"
    }
  ]
}
```

`source.kind` is `original`, `licensed`, or `local-import`. A `local-import`
library must explain its origin and stay out of the repository:

```gitignore
rules.local.json
*.corpus.json
```

`--rules` reads any path, so a private library works identically to a committed
one. `references/rule-library-format.md` covers the boundary between publishable
camera grammar and someone else's protected selection and wording.

## Files

```
SKILL.md                        agent procedure for a storyboard task
references/
  prompt-mapping.md             one contract field → one prompt section
  selection-principles.md       one or two rules, map before prompt, motivated moves
  rule-library-format.md        schema, provenance, what you may publish
  evidence.md                   frame checkpoints and the evidence record
src/                            validator and CLI (no dependencies)
examples/                       a three-shot storyboard and four original rules
test/                           contract tests
```

## Status

Honest scope, at `0.1.0`:

- Validator and tests are implemented; 20 contract tests pass on Node 20 and 22.
- The contract has been used on one short-video workflow. The project is private;
  no unverifiable metric is claimed here.
- The four rules in `examples/` were written for this repository as format
  samples, not copied from any published source.
- There is no renderer integration and no prompt-to-video runner. The output is a
  validated storyboard, which any tool can consume.

## License

MIT. See `references/rule-library-format.md` before adding a rule library.
