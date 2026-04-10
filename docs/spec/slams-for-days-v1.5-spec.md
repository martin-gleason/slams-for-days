# Slams for Days — v1.5 Specification

**OCS-1138 | April 10, 2026**  
**Status: LOCKED**

---

## 1. Project Identity

**Name:** Slams for Days  
**Tagline:** A daily devotional for the colleague who earned it.  
**Default dataset:** "Joe" — 31 roasts, themed with Grateful Dead, King Crimson, Alien, Terminator, Predator, and Dengar iconography.

Joe's last name never appears in the codebase, the UI, or the default data file. First name only. He's immortalized, not doxxed.

---

## 2. Data Model

### 2.1 Slam File Schema (`slams.json`)

```json
{
  "target": {
    "firstName": "Joe",
    "title": "SPO",
    "tagline": "31 Slams for 31 Years"
  },
  "themes": {
    "bear": {
      "label": "Dancing Bears",
      "images": ["bears-row.jpg", "rainbow-bear.png"],
      "accent": "#E8383B"
    }
  },
  "slams": [
    {
      "day": 1,
      "roast": "Joe says I'm doing his job...",
      "theme": "bear",
      "accent": "#E8383B",
      "tags": ["competence", "rust", "meta"]
    }
  ]
}
```

**Design decisions:**
- `accent` lives on both the theme AND each individual slam — the slam-level accent overrides the theme default. This lets you vary color within a theme without creating a new theme.
- `tags` are freeform strings, not an enum. This keeps it flexible for forks — someone roasting a different colleague will have different categories.
- `themes` maps theme keys to display labels and image file lists. Images are filenames, not paths — the app knows where to look.

### 2.2 Data Loading Priority

1. **localStorage** — if the user has created or edited slams via the form, those win
2. **Default JSON** — ships with the repo at `/public/data/default-slams.json`

A "Reset to defaults" button clears localStorage and reloads from the JSON file.

---

## 3. Project Structure

```
slams-for-days/
├── public/
│   ├── data/
│   │   └── default-slams.json
│   └── images/
│       └── themes/
│           ├── bear/
│           │   ├── bears-row.jpg
│           │   └── rainbow-bear.png
│           ├── stealie/
│           ├── schizoid/
│           ├── crimsonking/
│           ├── alien/
│           ├── terminator/
│           ├── dengar/
│           └── _template/
│               └── README.md  ← BYOI instructions
├── src/
│   ├── components/
│   │   ├── Postcard.jsx
│   │   ├── DaySelector.jsx
│   │   ├── ExportButtons.jsx
│   │   ├── SlamForm.jsx
│   │   └── Header.jsx
│   ├── hooks/
│   │   └── useSlams.js
│   ├── utils/
│   │   ├── exportPdf.js
│   │   └── exportPng.js
│   ├── App.jsx
│   └── main.jsx
├── index.html
├── vite.config.js
├── package.json
├── LICENSE
├── README.md
├── CONTRIBUTING.md
└── .gitignore
```

**Design decisions:**
- Components are split by responsibility, not by page. `Postcard` only knows how to render a card. `ExportButtons` only knows how to capture and download. Neither knows about the other.
- `useSlams` is a custom hook — it encapsulates all the localStorage-vs-JSON logic so components don't care where data comes from. This is the extensibility point: someone who wants to wire up a database replaces this one file.
- Images live in `public/` not `src/` because they're static assets served as-is. No base64 encoding, no webpack processing. Just files in folders.

---

## 4. Visual Improvement Pass

### 4.1 Image Treatment
- Corner image opacity: 0.35 → 0.55 (currently too ghostly)
- Bottom image opacity: 0.3 → 0.45
- Add a subtle drop shadow on corner images for depth
- Images load from `/images/themes/{theme}/` as actual files

### 4.2 Text Readability
- Roast text: bump minimum font from 12.5px to 14px
- Add a semi-transparent white backing panel behind the roast text (not the full card — just a soft rectangle behind the quote)
- Footer OCS-1138: bump from 6px to 8px, color from #bbb to #888
- Day badge: add a subtle text-shadow for legibility on light backgrounds

### 4.3 Instructions Panel
- Move "Deployment Protocol" into its own collapsible section
- Increase font to 13px
- Add step numbers with the accent color
- Add a "How to add your own slams" link pointing to CONTRIBUTING.md on GitHub

---

## 5. Export Options

### 5.1 PDF Download (existing, improved)
- html2canvas at 2x scale → jsPDF at exactly 6" × 4.25"
- Filename: `slam-day-{N}-{firstName}.pdf`

### 5.2 PNG Download (new)
- html2canvas at 3x scale → canvas.toBlob → download
- Filename: `slam-day-{N}-{firstName}.png`
- This is the share-friendly format

### 5.3 Share Button (new, progressive)
- If `navigator.share` is available (mobile, some desktop): native share sheet with the PNG blob
- If not: falls back to PNG download
- Button label: "Share" with a share icon

---

## 6. Slam Form

### 6.1 Fields
- Target first name (pre-filled from current data)
- Roast text (textarea)
- Theme (dropdown, populated from available themes)
- Tags (comma-separated text input)
- Day number (auto-assigned as next available, editable)

### 6.2 Behavior
- On submit: slam is added to localStorage dataset
- Preview updates immediately
- "Export All Slams" button downloads the full current dataset as `slams.json`
- "Reset to Defaults" clears localStorage, reloads shipped data

### 6.3 Future-proofing
- The form writes to localStorage using the same JSON schema as the file
- A database-backed version would replace `useSlams.js` and nothing else changes
- The export button means anyone can generate a PR-ready JSON file without touching code

---

## 7. GitHub Pages Deployment

### 7.1 Build
- `npm run build` → Vite outputs to `/dist`
- `vite.config.js` sets `base: '/slams-for-days/'` for GitHub Pages path

### 7.2 Deployment
- GitHub Actions workflow: on push to `main`, build and deploy to `gh-pages` branch
- Or manual: `npm run build && npx gh-pages -d dist`

### 7.3 Repo Setup
- MIT License
- README: what it is, screenshot, quickstart, customization guide, BYOI instructions
- CONTRIBUTING.md: how to add slams via JSON, how to add themes, how to PR
- `.gitignore`: node_modules, dist, .DS_Store

---

## 8. Code Review Learning Plan

**Skills referenced:**
- `learn-to-code/SKILL.md` — Socratic method, code review hierarchy, JS and React best practices. Governs all review conversations. Every step in Section 9 gets a code review pass before advancing.

**Process rule:** The spec is not a work order. Each migration step gets built, then reviewed, then approved before the next step starts. The review follows the learn-to-code hierarchy: Socratic questions first, code review second, explanations only when requested.

**Review sequence:**

1. **JSON schema extraction** — why separate data from presentation? What makes a good schema? How does the loading priority work?
2. **Component decomposition** — why split one file into five components? What's the single responsibility principle in practice?
3. **Custom hook (`useSlams`)** — what's a hook? Why extract data logic from UI? How does this make the app extensible?
4. **Export utilities** — why separate modules for PDF and PNG? What's the difference between a utility and a component?
5. **Form and state management** — how does React state flow? Why localStorage here vs. a database?
6. **GitHub Pages and CI** — what does `npm run build` actually produce? How does a GitHub Action work?

---

## 9. Migration Path from v1.0

| Step | Task | Type |
|------|------|------|
| 1 | Extract Joe's 31 slams into `default-slams.json` | Foundation |
| 2 | Move base64 images to actual files in `public/images/themes/` | Foundation |
| 3 | Split the monolith JSX into components | Foundation |
| 4 | Wire up `useSlams` hook | Feature |
| 5 | Replace `window.print()` with html2canvas exports (PDF + PNG) | Feature |
| 6 | Add SlamForm | Feature |
| 7 | Add GitHub Pages config | Packaging |
| 8 | Write README, CONTRIBUTING, LICENSE | Packaging |
| 9 | Visual polish pass | Packaging |
| 10 | Deploy | Deployment |

Steps 1-3 are the foundation. Steps 4-6 are features. Steps 7-9 are packaging. Step 10 is deployment.

Each step gets a code review conversation before the next step starts.

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| v1.5-spec | 04/10/2026 | Locked specification |

-----
April 10, 2026

#AI/Claude
