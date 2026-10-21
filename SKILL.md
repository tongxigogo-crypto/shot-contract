---
name: shot-contract
description: Use when turning a scene into an AI video storyboard, or when a generated shot looks wrong and the prompt has no spatial or timing structure to fix.
---

# Shot Contract

## Outcome

A storyboard that a model can actually execute: every shot states why it exists,
which rule it uses, where the camera and people are, what happens second by
second, and what must not appear.

Use it for:

- a short-video or micro-drama sequence built from AI video generations;
- diagnosing a shot that "looks wrong" but has no obvious cause;
- handing a scene to another person or agent without a meeting;
- keeping a rule library that you have the right to use.

## Non-negotiable rules

1. **One or two rules per shot.** A shot that stacks long lens, orbit, and a
   dolly zoom gives the model three incompatible instructions. Pick the rule that
   serves the dramatic beat and drop the rest.
2. **Purpose before adjectives.** "Cinematic", "premium", "大气" are not
   instructions. Write what the shot must accomplish: who gains power, what the
   audience learns, what the cut costs. The validator rejects impression words.
3. **Space is a fact, not a mood.** Record camera height, lens intent, and the
   axis between characters. A dialogue shot without an axis will jump on the cut.
4. **Three or more characters require a top-down map.** Positions, route, and
   focus handoff get decided on paper before the prompt is written.
5. **Timed beats, not a paragraph.** `00:00-00:02` forces you to decide when the
   head turns. Untimed description is a wish.
6. **Every shot carries negative constraints.** The model fills silence with
   invention: extra people, invented signage, faces that morph on a turn. Name
   the failures you refuse.
7. **A move needs a motivation in frame.** A hand closing, a line ending, a
   figure entering. If nothing triggers the move, the camera is drifting.
8. **Do not redistribute a rule library you do not own.** See
   `references/rule-library-format.md`. A library imported from a published book
   or someone else's notes stays local; the repository ships the format, not
   their content.

## Workflow

### 0. Fix the inputs

Before writing shots, record:

- the scene intent in one sentence (who wants what, and what blocks it);
- the format (aspect, fps, target length, platform);
- the rule library and its provenance (`original` / `licensed` / `local-import`);
- what the target model has actually been observed to do, and what is assumed.

Keep "the model can do this" separate from "this project generated it". A demo
reel is not evidence about your shot.

### 1. Write the beat table first

List beats, not shots. A beat is a change: someone decides, learns, loses, or
arrives. Estimate seconds per beat. Only then assign shots — one beat may need
two shots, and three shots may carry one beat.

### 2. Fill the four fields per shot

| Field | Question it answers | Goes into the prompt as |
| --- | --- | --- |
| `purpose` | Why does this shot exist in the story? | tone and dramatic intent, not literal text |
| `conditions` (in the rule) | What spatial and optical setup makes it readable? | shot size, lens intent, camera height, occluders |
| `content` | What happens, in what order, over what seconds? | time-coded action beats |
| `negative` | What must not appear or change? | negative constraints and continuity checks |

A shot missing any of the four is not ready.

### 3. Decide space before motion

Two characters: name the axis. Three or more: draw the top-down map with
positions, camera route, and where focus hands off. Do this before choosing
camera moves, because a move that crosses the axis costs you the geography you
just established.

### 4. Assemble the prompt

Follow `references/prompt-mapping.md`. Keep the mapping mechanical: each contract
field has one destination in the prompt. If you find yourself adding a sentence
that belongs to no field, the shot description is incomplete — fix the shot, not
the prompt.

### 5. Validate

```sh
shot validate --file storyboard.json --rules rules.json
```

Errors block the shoot. Warnings are decisions a reviewer must acknowledge:

- an axis reversal between adjacent shots;
- a timing gap or overlap;
- content with no timecode;
- a camera move with no motivation.

### 6. Accept the output in frames, not in impressions

Check the first frame, the transition frame, the contact frame, and the last
frame. Record what was checked and at what viewport. A shot that only looks right
in its final frame has not passed. See `references/evidence.md`.

### 7. Close the loop

For each shot, record: rule used, generation attempt count, what failed, what was
changed, and whether the fix generalizes or was specific to this clip. Only the
generalizable finding goes into the rule library.

## What this skill will not do

- It will not tell you a rule is good. Quality is the library owner's judgement.
- It will not generate video. It produces the contract the generation runs on.
- It will not certify a shot as finished. Frame-level inspection does that.
