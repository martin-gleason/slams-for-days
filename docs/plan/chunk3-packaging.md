# codereview_chunk3 — Packaging (Steps 7-9) + Deploy (Step 10)

**Status:** Planned (2026-04-12)
**Target:** Ship by 2026-04-13 (Sunday)
**Spec reference:** `docs/spec/slams-for-days-v1.5-spec.md` §§4, 7, 9 (steps 7-10)
**Predecessor:** codereview_chunk2 (Features, steps 4-6) — completed 2026-04-12

This is the final chunk. After this, the app is deployed and the v1.5
migration from the spec is complete.

---

## Scope

| Step | Feature | Files touched (planned) | Effort |
|------|---------|-------------------------|--------|
| 7 | GitHub Pages config | `.github/workflows/deploy.yml` (new) | ~15 min |
| 8 | README, CONTRIBUTING | `README.md` (rewrite), `CONTRIBUTING.md` (new) | ~30 min |
| 9 | Visual polish pass | `src/components/Postcard.jsx`, `src/App.jsx` | ~45 min |
| 10 | Deploy | Run workflow or `npx gh-pages -d dist` | ~10 min |

Same review gate per step: build → review (Socratic) → approval → next.

---

## Step 7 — GitHub Pages config

### What exists

- `vite.config.js` already has `base: '/slams-for-days/'`
- `.gitignore` already covers node_modules, dist, .DS_Store, codereview.md
- LICENSE (MIT) already exists

### What's needed

One file: `.github/workflows/deploy.yml`

GitHub Actions workflow that:
1. Triggers on push to `main`
2. Installs dependencies (`npm ci`)
3. Builds (`npm run build`)
4. Deploys `dist/` to GitHub Pages

Use the official `actions/deploy-pages` approach (newer, simpler) rather
than the `gh-pages` branch approach.

### Code review questions for step 7

1. What does `npm run build` actually produce? What's in the `dist/` folder?
2. Why does `vite.config.js` need a `base` path for GitHub Pages?
3. What does the GitHub Actions workflow do that you couldn't do manually?
4. Why `npm ci` instead of `npm install` in CI?

---

## Step 8 — README and CONTRIBUTING

### README.md (rewrite)

Current README is a rough draft. Spec §7.3 requires:
- What it is (one-liner + screenshot placeholder)
- Quickstart (clone, install, dev, build)
- Customization guide (how to change the target, add slams)
- BYOI (Bring Your Own Images) instructions
- Credits

Tone: match the project's voice — irreverent but informative. Joe's last
name never appears.

### CONTRIBUTING.md (new)

Per spec §7.3:
- How to add slams via JSON (edit default-slams.json or use the form + Export)
- How to add themes (create a directory, add images, add theme key to JSON)
- How to PR (fork, branch, test, submit)

### Code review questions for step 8

1. What belongs in CONTRIBUTING vs README? Where's the line?
2. Why does the quickstart say `npm ci` for fresh clones but you use
   `npm install` day-to-day?
3. The README says Joe's first name but never his last. Why is that a
   deliberate choice, not an oversight?
4. BYOI instructions assume a "tech-savvy person." What would you add
   to make them accessible to a non-dev?

---

## Step 9 — Visual polish pass

All changes from spec §4. This is CSS-level work in two files.

### §4.1 Image treatment (Postcard.jsx)

| Change | Current | Target |
|--------|---------|--------|
| Corner image opacity | 0.35 | 0.55 |
| Bottom image opacity | 0.3 | 0.45 |
| Corner image drop shadow | none | subtle shadow for depth |

### §4.2 Text readability (Postcard.jsx)

| Change | Current | Target |
|--------|---------|--------|
| Roast min font | 14px | 14px (already done) |
| Roast backing panel | text-shadow glow | semi-transparent white rectangle behind the quote |
| Footer OCS-1138 font | 6px | 8px |
| Footer OCS-1138 color | #bbb | #888 |
| Day badge text-shadow | none | subtle shadow for legibility on light backgrounds |

### §4.3 Instructions panel (App.jsx)

| Change | Current | Target |
|--------|---------|--------|
| Deployment Protocol | always visible | collapsible (collapsed by default) |
| Instructions font | 11px | 13px |
| Step numbers | plain text | accent-colored numbers |
| "Add your own slams" link | none | link to CONTRIBUTING.md on GitHub |

### Code review questions for step 9

1. Why is the roast backing panel a `<div>` with background-color rather
   than a CSS box-shadow or text-shadow?
2. The collapsible panel uses a `<details>/<summary>` element. What makes
   this better than a useState toggle for accessibility?
3. Why do we keep the text-shadow on the roast *in addition to* the
   backing panel?
4. The spec says "subtle" for shadows and opacity. How do you decide
   what's subtle enough?

---

## Step 10 — Deploy

After step 9 is approved:
1. Commit all changes
2. Push to `main`
3. GitHub Actions builds and deploys automatically
4. Verify at `https://<username>.github.io/slams-for-days/`

No code review questions for deploy — it's the workflow from step 7 in action.

---

## Sequencing for Sunday

```
Step 7 build → Step 7 review → approval
                                  ↓
                    Step 8 build → Step 8 review → approval
                                                      ↓
                                       Step 9 build → Step 9 review → approval
                                                                        ↓
                                                             Step 10 deploy → done
```

Steps 7 and 8 can be built back-to-back quickly (config + writing, not
much React). Step 9 is the meatiest. Step 10 is a button push.

---

## Decisions locked (2026-04-12)

| Decision | Choice |
|----------|--------|
| GH Actions approach | `actions/deploy-pages` (not gh-pages branch) |
| Review flow | Questions as blank tables in codereview.md, Marty fills answers, Claude grades once |
| Target date | Ship by 2026-04-13 (Sunday) |

## Open items

- GitHub repo URL needed for CONTRIBUTING.md links and the "Add your own
  slams" link in the instructions panel
- Screenshot for README — take after step 9 polish lands
