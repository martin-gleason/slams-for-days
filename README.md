# Slams for Days

A daily devotional for the colleague who earned it.

31 roasts. 9 themes. One guy named Joe who's been at it for 31 years.

<!-- TODO: Add screenshot after visual polish (step 9) -->

## Overview

The project began as a toy project: Have a way to create a mean comment a day for a coworker. The purpose of the project grew as a way to learn more about React, JS, JSON, and the process of open-sourcing.

It is a React front end that uses Javascript to load a json file of things you would like to say to your coworker. We use html2canvas and jsPDF to make higher quality 'post cards' that can be printed or emailed.

### Purpose

The toy turned into a learning project, as I wanted to learn more about how modern web apps work. So while I design the spec, there is also a process where I review the code base and implement new features based on what I learn. I can, and do, write code -- but my primary language is R. Not the best language for a webapp to insult my friend, Joe.

### Who is Joe

He's the king of the slams.

## What Is This

A React postcard generator that serves up one themed roast per day, complete with Grateful Dead dancing bears, King Crimson schizoid men, Xenomorphs, Terminators, and Dengar. Each slam renders as a printable 6" x 4.25" postcard that can be downloaded as PDF, PNG, or shared directly from your phone.

Joe's first name appears throughout. His last name doesn't. He's immortalized, not doxxed.

## Quickstart

```bash
# Clone
git clone https://github.com/<your-username>/slams-for-days.git
cd slams-for-days

# Install (use ci for a clean, reproducible install from the lock file)
npm ci

# Dev server
npm run dev

# Production build
npm run build
```

The dev server runs at `http://localhost:5173/slams-for-days/`.

## How It Works

1. **Pick a day** from the 31-button grid
2. **Read the roast** on the themed postcard
3. **Download or share** via the PDF, PNG, or Share buttons
4. **Add your own slams** using the built-in form (saved to localStorage)
5. **Export your dataset** as a JSON file ready to PR back into the repo

## Customization

### Change the Target

Edit `public/data/default-slams.json` and update the `target` object:

```json
{
  "target": {
    "firstName": "YourColleague",
    "title": "Their Title",
    "tagline": "N Slams for N Years"
  }
}
```

### Add Slams

**Option A — Use the app:** Click "+ Add Slam", fill in the form, then click "Export All Slams" to download a `slams.json` file you can PR into the repo.

**Option B — Edit JSON directly:** Add entries to the `slams` array in `public/data/default-slams.json`:

```json
{
  "day": 32,
  "roast": "Your roast text here.",
  "theme": "bear",
  "accent": "#E8383B",
  "tags": ["tag1", "tag2"]
}
```

### Bring Your Own Images (BYOI)

See [CONTRIBUTING.md](CONTRIBUTING.md) for full theme-creation instructions. The short version:

1. Create a folder under `public/images/themes/your-theme/`
2. Drop in your images (JPG or PNG, any size — they'll be scaled)
3. Add a theme entry to the `themes` object in `default-slams.json`
4. Reference the theme key in your slam entries

A `_template/` directory with a README is included to get you started.

## Tech Stack

- **React 19** + **Vite** — fast dev server, optimized production builds
- **html2canvas** + **jsPDF** — pixel-perfect PDF/PNG export
- **localStorage** — persists user-created slams with versioned schema migration
- **GitHub Pages** — deployed via GitHub Actions on push to main

## Authors

Marty Gleason — spec, design, code review, learning by doing
Claude Code (Opus 4.6) — implementation, teaching, annotated code

## Project Structure

```text
src/
  components/    Postcard, DaySelector, Header, ExportButtons, SlamForm, DataActions
  hooks/         useSlams (data layer — localStorage + JSON fallback)
  utils/         exportPdf, exportPng
public/
  data/          default-slams.json
  images/themes/ bear, stealie, schizoid, crimsonking, alien, terminator, dengar, predator, skeleton
```

## License

[MIT](LICENSE)
