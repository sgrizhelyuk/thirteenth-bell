# The Thirteenth Bell

A mystical horror English quest for A2–B1 learners. A playable prototype built on the
engine of [Moonlit Evening Mystery](https://github.com/sgrizhelyuk/moonlit-evening-mystery).

> One rainy night. One island boarding school. Five rules you must not break.
> When the bell rings thirteen times, the school collects a voice.

**Play:** https://sgrizhelyuk.github.io/thirteenth-bell/

## Status

- Story script: complete (`scenario.md`)
- Engine: complete (10 scenes, choices, tasks, clues, notebook, badges, music, saves)
- Art: generated with a local SDXL pipeline — **manual revisions welcome** (see below)
- Music: placeholder set (Kevin MacLeod, CC BY 4.0) — to be re-picked later

## Run locally

```
python -m http.server 8124
# open http://localhost:8124/
```

## Tests

```
$env:NODE_PATH="...\node_modules"; node tools/prototype-test.js
```

8 suites: full playthrough, wrong answers/badges, translation toggle, save/continue,
soft-lock regression, hint-popup z-order, asset-preload ordering, clue-search cursor.

## Art workflow (manual edits)

The artist (you) can drop images in two ways — see `assets/_versions/README.md`:

- `assets/_versions/manual/` — finished files, same names as in `assets/` (applied as-is)
- `assets/_versions/new_sources/` — raw images (auto background removal + resize)

Pipeline commands:

```
python tools/art_pipeline.py manual     # apply your manual files
python tools/art_pipeline.py sources    # process raw sources
python tools/art_pipeline.py sheet      # rebuild contact sheets for review
```

Generation details (model, seeds, prompts): `art/PROMPTS.md`, `tools/art_manifest.json`.
Contact sheets of the current set: `art/contacts/`.

## Content & credits

- Script: hand-written, English with Russian support (translation toggle in game)
- Art: generated (SDXL / Animagine XL 3.1), pending manual polish
- Music: Kevin MacLeod (incompetech.com), licensed under Creative Commons BY 4.0
- Tone: dark fairy tale horror, 12+ — no gore; disappearances happen off-screen

## Structure

```
index.html          game shell
style.css           all styling
js/story.js         scenes, dialogue, tasks, clues (all content)
js/app.js           engine (screens, typing, choices, tasks, clues, music, saves)
assets/             final game assets (BG_*, CH_*, OBJ_*, UI_*, music/)
assets/_versions/   exchange folders for manual edits + backups
tools/              generation + processing + test scripts
art/                prompts and contact sheets
scenario.md         the full screenplay (source of truth for the story)
```
