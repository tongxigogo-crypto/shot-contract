# Evidence

A storyboard passes review when someone can point at frames and say what was
checked. "It looks good" is not a review, and neither is a green validator run —
the validator only proves the description is complete, never that the output is
right.

## Frame checkpoints

For every generated shot, inspect at least four frames:

| Frame | What it proves |
| --- | --- |
| first | the shot opens in the state the previous shot ended in |
| transition | the move or cut does not tear geometry, faces, or fabric |
| contact | the moment the beat lands — hand meets object, eyes meet eyes |
| last | the shot ends where the next one expects to start |

A shot that only reads correctly at its last frame has not passed. Most failures
live in the transition.

## What to check per frame

- **Identity**: the same face, same collar height, same hair length.
- **Geography**: characters keep their screen side; the axis holds.
- **Contact**: feet on the floor, hands on the object, no floating props.
- **Invention**: no signage, no extra people, no text the shot did not ask for.
- **Light**: the key direction did not flip between frames.
- **Framing**: safe areas hold at the target aspect, not just the preview.

## Record template

```markdown
# Shot S03 — iteration 2

- Rule(s): BLOCK-1, DOLLY-1
- Attempt: 2 of 3
- Prompt version: s03-v2
- Model / version:
- Frames checked: first / transition / contact / last
- Viewport or output size:
- Found: pillar clips B's shoulder at 00:03
- Changed: moved camera route 0.3 units left; added negative "pillar must not clip through B"
- Generalizes? yes — "lateral reveals need an occlusion check" added to library
- Status: accepted | provisional | rejected
```

`provisional` means it may be used in an edit but is not a rule yet. Only a
repeatable cause becomes a rule.

## Separating evidence classes

Keep these apart, in writing, in the same record:

| Class | Example | May be stated as |
| --- | --- | --- |
| storyboard fact | the axis is A-left / B-right | decided, written down |
| generation observation | attempt 2 kept the axis, attempt 1 did not | observed once, sample of two |
| model capability claim | "this model handles long lenses" | only after repeated, recorded attempts |
| final-cut acceptance | the shot is in the edit | only after the frame checkpoints above |

Mixing these is how a demo clip becomes a "capability", and then a promise to a
client.

## When you cannot inspect

If the frames cannot be inspected — no render, no viewport, no device — the shot
status is `not visually accepted`, regardless of how clean the prompt was. Report
it that way and move on. A skipped gate that is labelled is survivable; a skipped
gate that is reported as passed is not.
