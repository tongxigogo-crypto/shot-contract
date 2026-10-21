# Selection principles

These four principles came from repeatedly over-stuffing single AI shots and then
having to guess which instruction caused the artifact. They are constraints on
the storyboard, not on the model.

## 1. One or two rules per shot

A five-to-fifteen second generation holds roughly one camera idea. Two compatible
ideas can coexist when one is static and the other is not (a long lens with a
slow push). Three or more competing ideas produce a shot where the model
compromises all of them.

Test: can you name the single thing the camera is doing? If the answer is "it
kind of does both", the shot is overloaded.

## 2. The top-down map comes before the prompt

For three or more characters, a corridor chase, or a one-take reveal, draw the
floor plan first:

```text
A ──────────────── B
      ↑
   camera route

pillar        stairwell
   ▓              ▓
```

Record four things: anchor positions, camera route, focus handoff points, and the
time beat each handoff lands on. A prompt written before the map will produce a
scene whose geography changes between generations, and no amount of negative
constraint fixes geography that was never decided.

Skip the map for one or two characters standing still. It is a tool for spatial
complexity, not a ritual.

## 3. The camera move is triggered by something in frame

A move without a trigger reads as drift, and drift is the most common reason a
generation looks like stock footage. Valid triggers:

- a hand closes, a head turns, a line finishes;
- a figure enters or stops;
- an object is picked up, set down, or dropped.

Invalid triggers: "to add energy", "to keep it dynamic", "because the beat
changes". Those describe your intent, not anything the camera can see.

## 4. Restraint is a production decision, not a taste

Every additional instruction costs reliability. When a shot fails, the first
question is not "what should I add" but "which instruction can I remove without
losing the beat". Remove, regenerate, compare. A shot that works with two
instructions is better than a shot that works one time in eight with five.

## Anti-patterns

| Pattern | Why it fails |
| --- | --- |
| Stacking rules to look advanced | The model resolves conflicts arbitrarily; you cannot tell which rule broke |
| Building the prompt from adjectives | Nothing in the prompt constrains camera position |
| Adding a rule after every failed generation | The prompt becomes a record of failures, not an instruction |
| Reusing another project's rule constants | The rule was tuned for a different lens, space, and model version |
| Treating a lucky clip as a rule | One success is a sample; a rule needs a repeatable cause |
