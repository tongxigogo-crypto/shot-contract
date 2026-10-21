# Rule library format

The rule library is the part of this toolkit that is **yours**. This repository
ships the format and the checker, not a rule corpus.

## Shape

```json
{
  "schemaVersion": "0.1",
  "source": {
    "kind": "original",
    "note": "Written for this project between 2026-01 and 2026-06."
  },
  "rules": [
    {
      "id": "OTS-1",
      "title": "Over-the-shoulder reverse",
      "purpose": "Hold two speakers in one spatial relationship while the audience tracks who holds the floor.",
      "conditions": "Two characters at a stable distance. Camera behind and beside the listener's shoulder.",
      "risk": "Swapping shoulders without a cut reads as a jump."
    }
  ]
}
```

Three fields are mandatory per rule: `purpose`, `conditions`, `risk`. They are the
same three the storyboard consumes, so a shot can cite a rule and inherit a
spatial setup instead of restating it.

| Field | Meaning |
| --- | --- |
| `purpose` | the dramatic function the rule serves |
| `conditions` | the spatial and optical setup that makes it readable |
| `risk` | the failure mode to watch for, which becomes negative constraints |

Optional but useful: `tags`, `examples` (film references you can legally cite),
`modelNotes` (what a specific model does with it — keep versioned), `deprecated`.

## Provenance is mandatory

`source.kind` is one of:

| Kind | Meaning | What it requires |
| --- | --- | --- |
| `original` | you wrote it from your own work or observation | nothing extra |
| `licensed` | you have permission, a licence, or a public-domain source | `source.note` naming the licence, plus a link or document reference |
| `local-import` | imported from material you may use privately but not redistribute | `source.note` describing the origin, **and the file must stay out of the repository** |

The validator rejects a `local-import` library without a note, because an
untraceable rule corpus is how a project ends up unable to answer "where did this
come from" two years later.

## Do not commit a corpus you do not own

A rule library distilled from a published book, a paid course, or someone else's
notes is a derivative work. Publishing it creates three problems that no
disclaimer fixes:

1. it reproduces protected expression at volume;
2. it is usually also a translation, which is a separate right;
3. a takedown removes the repository you were using as evidence of your work.

Keep that library local. The repository holds:

- this format;
- the validator;
- your own original rules;
- a `.gitignore` entry for the private library.

```gitignore
# Private rule libraries stay local.
rules.local.json
rules/*.private.json
*.corpus.json
```

`shot validate --rules <path>` reads any path, inside the repository or not, so a
private library works exactly the same as a committed one.

## Writing rules you can publish

A rule is publishable when it describes a camera behaviour in your own words and
does not depend on a specific work's protected expression:

| Publishable | Not publishable |
| --- | --- |
| "Long lens compresses the gap between a thrown punch and the reaction." | A numbered rule reproduced from a book's table of contents, with its title and explanation |
| "Low angle plus a subject walking toward the lens exaggerates approach." | A scene-by-scene breakdown copied from a film-analysis chapter |
| "Push in only after the trigger, or the move reads as drift." | A translated list of another author's 100 rules |

Common camera grammar — over-the-shoulder, low angle, motivated push, foreground
reveal — is shared vocabulary. A specific author's selection, ordering, wording,
and examples are not.

## Growing the library

1. Write the rule when a shot fails for a reason that generalizes.
2. State the failure in `risk` before stating the fix in `conditions`.
3. Add `modelNotes` with the model version; behaviour changes between versions.
4. Deprecate rather than delete. A rule you stopped using is evidence about your
   process, and deleting it loses the reason.
5. Re-run `shot rules --file <library>` after every edit; duplicate ids are the
   most common breakage.
