# Contributing

## The one rule that matters

**Do not contribute a rule corpus you do not own.**

A library distilled from a published book, a paid course, or another person's
notes is a derivative work. It will be rejected, even if it is excellent. See
`references/rule-library-format.md`.

What is welcome:

| Contribution | Bar |
| --- | --- |
| An original rule (three fields filled) | describes camera behaviour in your own words, no copied selection or wording |
| A new validator rule | comes with a passing and a failing fixture, and a real failure it prevents |
| A storyboard example | passes `npm run validate:examples`, brand and client data removed |
| A doc correction | links the section and states what was wrong |
| An evidence record from a real shoot | frames inspected and what was found, not just the verdict |

## Before a PR

```sh
npm test
npm run validate:examples
```

No install step; there are no runtime dependencies.

## Style

- The contract stays model-neutral. A rule that only works because your model has
  that quirk belongs in `modelNotes`, not in the validator.
- One logical change per commit. Conventional Commits (`feat:`, `fix:`, `docs:`,
  `test:`, `chore:`).
- Do not reformat unrelated files.

## Reporting

Use the issue forms. For a storyboard that fails, include the minimal JSON and
the exact command. "The shot looks wrong" cannot be triaged — name the frame and
what you expected.

## License

Contributions are licensed under CC-BY-NC-4.0.
