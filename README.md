# TypeFlow

A typing practice web app (similar to TypeClub / Monkeytype) built with **Angular 19**, plus **study mode**: link a YouTube video and paste its transcript, then type along while you watch to improve comprehension and retention.

## Features

- **Practice mode** — Random passages, live WPM, accuracy, character highlighting, blind mode
- **Study mode** — Embedded YouTube player + side-by-side typing of your script/transcript
- **Lessons** — Save title, optional YouTube URL, script, and notes in `localStorage`
- **Blind mode** — Fade upcoming text to practice recall

## Quick start

```bash
cd typeflow
npm install
npm start
```

`npm start` runs the Angular app **and** a small transcript API on port 3001 (proxied as `/api`).

Open [http://localhost:4200](http://localhost:4200).

## Auto-fetch YouTube transcript

1. Go to **+ New Lesson**.
2. Paste a YouTube URL.
3. Click **Fetch transcript** — captions are pulled automatically when the video has subtitles.
4. Optionally set **Caption language** (`en`, `es`, etc.) if the default track fails.
5. Save and **Study**.

If fetch fails, the video may have captions disabled — paste the transcript manually.

## Study workflow

1. **+ New Lesson** — paste URL → **Fetch transcript** (or paste script yourself).
2. Click **Study** — watch on the left, type the script on the right.
3. Use **Blind mode** on a second pass to test memory.

## Build

```bash
npm run build
```

Output is in `dist/typeflow`.

## Project structure

```txt
src/app/
├─ core/                 # App-wide data, models, services, and utilities
├─ features/             # Route-level screens grouped by product area
│  ├─ home/
│  ├─ lessons/
│  │  └─ components/     # Lesson-specific presentational components
│  ├─ practice/
│  └─ study/
│     └─ components/     # Study-specific presentational components
└─ shared/components/    # Reusable UI building blocks
```

The feature components own page state and user flows. Shared components such as the
page header, empty state, stats panel, and typing display keep common UI behavior in
one place.

## Notes

- YouTube embeds require a valid watch/share URL; no API key is needed.
- Lessons are stored only in your browser (`localStorage`).
- For long scripts, split into multiple lessons by section.

## Tech stack

- Angular 19 (standalone components, signals)
- SCSS, no backend required
