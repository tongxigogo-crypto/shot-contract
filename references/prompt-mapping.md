# Prompt mapping

A contract field with no destination in the prompt is decoration. This page fixes
one destination per field so the storyboard and the generation stay comparable.

## Mapping table

| Contract field | Prompt section | What it becomes |
| --- | --- | --- |
| `purpose` | opening intent line | a short statement of dramatic function. Never pasted as mood text; it steers choice of shot size and pacing |
| rule `conditions` | camera block | shot size, lens intent (wide / long / macro), camera height, occluders, subject distance |
| `spatial.axis` | camera block | the line between characters, and which shoulder the camera sits behind |
| `spatial.move` + `spatial.motivation` | camera block | the move, and the in-frame trigger that starts it |
| `content` | action block | one line per timecode segment, in chronological order |
| `characters` | subject block | who is in frame, what they wear, what they hold |
| `negative` | negative block | explicit exclusions, one per line |
| `topDownMap` | not in the prompt | it decides the camera and blocking; pasting a map into a text prompt wastes tokens |

## Assembly order

Write the prompt in this order. It matches how a model weights a long
description: subject identity degrades if the action block runs first.

```text
[intent]      one line: what this shot must accomplish
[subject]     who, wearing what, holding what, at what distance
[camera]      size, lens intent, height, position, move, trigger
[action]      00:00-00:02 ... / 00:02-00:05 ...
[light]       only what the shot needs; do not restate the scene default
[negative]    one constraint per line
```

## Segment writing rules

- Each segment names one change. Two changes in one segment means the model has
  to invent their order.
- Start times are absolute inside the shot, not the sequence. `00:00` is the first
  frame of this shot.
- Never describe an internal state as visible action. "She realizes" is not
  filmable; "her eyes lift from the floor" is.
- If a segment needs a reference image, say which one and what it is responsible
  for: silhouette, material, or blocking. One image, one job.

## Negative constraints that actually help

Effective exclusions are specific to a failure you have seen or can predict:

| Weak | Effective |
| --- | --- |
| "no bad anatomy" | "hands keep five fingers through the turn" |
| "no artifacts" | "no text invented on the wall signage" |
| "consistent character" | "the same jacket collar height in every frame" |
| "no jump" | "A stays frame-left across the cut" |

A generic negative list teaches the model nothing and hides which failure you
were actually worried about.

## How the fields fail together

| Symptom on screen | Field that was probably empty |
| --- | --- |
| The shot drifts, no one knows when to cut | `content` had no timecode |
| Everyone ends up on the same screen side | `spatial.axis` was missing |
| The camera moves for no reason | `spatial.motivation` was missing |
| The face changes identity mid-turn | `negative` did not name the turn |
| Everything is legible but nothing lands | `purpose` was an adjective |
| Extra people or invented signage | `negative` was generic |
