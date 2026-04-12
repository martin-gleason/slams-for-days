# Contributing to Slams for Days

Three ways to contribute: add slams, add themes, or improve the code.

## Adding Slams

### Via the App (easiest)

1. Run the dev server (`npm run dev`)
2. Click **+ Add Slam**
3. Fill in the roast, pick a theme, add tags
4. Click **Export All Slams** to download `slams.json`
5. Replace `public/data/default-slams.json` with your exported file
6. Open a PR

### Via JSON (direct)

Edit `public/data/default-slams.json`. Add an entry to the `slams` array:

```json
{
  "day": 32,
  "roast": "Your roast here. Use \\n for line breaks.",
  "theme": "bear",
  "accent": "#E8383B",
  "tags": ["competence", "meta"]
}
```

**Fields:**
- `day` — integer, should be unique (the app won't crash on dupes but it'll be confusing)
- `roast` — the text. Supports `\n` for line breaks. Keep it under ~200 characters for best postcard fit.
- `theme` — must match a key in the `themes` object (e.g., "bear", "alien", "dengar")
- `accent` — hex color. Can override the theme default for variety within a theme.
- `tags` — array of strings, freeform. Used for future filtering. Can be empty `[]`.

## Adding Themes

1. Create a directory: `public/images/themes/your-theme-name/`
2. Add 2-3 images (JPG or PNG). They'll be displayed at small sizes, so large files aren't needed — aim for under 200KB each.
3. Add your theme to the `themes` object in `default-slams.json`:

```json
"your-theme-name": {
  "label": "Display Name",
  "images": ["image1.jpg", "image2.png"],
  "accent": "#hexcolor"
}
```

4. Reference `"theme": "your-theme-name"` in any slam entries that should use it.

**Image notes:**
- Image references are filenames, not paths — the app knows to look in `/images/themes/{theme}/`
- Each theme directory is self-contained. If two themes share an image, copy it into both directories.
- See `public/images/themes/_template/README.md` for a starter guide.

## Improving the Code

1. Fork the repo
2. Create a feature branch: `git checkout -b my-feature`
3. Make your changes
4. Test locally: `npm run dev` and verify in the browser
5. Build: `npm run build` (must succeed with no errors)
6. Commit with a clear message
7. Open a PR against `main`

### Architecture Notes

- **`useSlams.js`** is the single data source. If you're changing how data loads or persists, this is the only file that should change.
- **Components are dumb.** They receive data as props from `App.jsx` and render it. They don't call hooks directly.
- **Utilities produce, components display.** `exportPdf.js` and `exportPng.js` are stateless functions, not React components.
- Keep inline styles — this project uses colocated styles intentionally.

## Code of Conduct

Don't be worse than Joe. That's the bar.
