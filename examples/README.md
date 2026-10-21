# Examples

| File | What it is |
| --- | --- |
| `storyboard.json` | Three shots for a corridor scene: a low-angle approach, an over-the-shoulder argument, and a foreground reveal that brings in a third character. Passes with 0 warnings. |
| `rules.sample.json` | Four rules written for this repository as format samples: `OTS-1`, `LOW-1`, `DOLLY-1`, `BLOCK-1`. |

## About the rules

These four describe common camera grammar in the author's own words. They are
**not** reproduced from any published rule collection, and they are not
exhaustive — they exist so the validator has something to resolve against and so
the file shape is obvious.

Replace them with your own library. Keep a library you do not own out of the
repository; `references/rule-library-format.md` explains the boundary.

## Check them

```sh
npm run validate:examples

# or individually
node src/cli.mjs rules    --file examples/rules.sample.json
node src/cli.mjs validate --file examples/storyboard.json --rules examples/rules.sample.json
```

## Reading the storyboard

`S03` is the useful one. It has three characters, so it needs a `topDownMap`, and
it cites two rules (`BLOCK-1` for the reveal, `DOLLY-1` for the push). Two is the
ceiling — a third rule would be rejected rather than silently accepted.
