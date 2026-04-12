# codereview_chunk2 — Features (Steps 4-6)

**Status:** In planning (approved 2026-04-13)
**Spec reference:** `docs/spec/slams-for-days-v1.5-spec.md` §§4-6, §9 (steps 4-6)
**Predecessor:** codereview_chunk1 (Foundation, steps 1-3) — completed 2026-04-10
**Successor:** codereview_chunk3 (Packaging, steps 7-9) — not yet planned

This is a working document. It describes *how and when* the chunk-2 features
get built. It will change as steps land and review feedback comes in. The
authoritative *what we're building* lives in the spec; this file should never
contradict it, only expand on the implementation tactics.

---

## Scope

Three feature steps from the spec, each shipping behind a code review gate:

| Step | Feature                            | Files touched (planned)                                  |
|------|------------------------------------|----------------------------------------------------------|
| 4    | `useSlams` localStorage layer      | `src/hooks/useSlams.js`                                  |
| 5    | PNG export + Share button          | `src/utils/exportPng.js` (new), `src/components/ExportButtons.jsx` |
| 6    | `SlamForm` with tag suggestions    | `src/components/SlamForm.jsx` (new), `src/App.jsx`, `src/hooks/useSlams.js` |

Each step gets built → reviewed (Socratic, per learn-to-code skill) → approved
before the next starts. No batching.

---

## Step 4 — `useSlams` localStorage layer

### Goal

Make the app remember user-edited slams across page reloads, without changing
any component code. The hook is the only file that knows about localStorage.

### Loading priority (per spec §2.2)

1. Try localStorage (`slams-for-days:data`)
2. If missing, corrupt, or fails migration → fall back to `default-slams.json`
3. If the JSON fetch also fails → set `error` state

### Versioned envelope

Don't write the raw `{target, themes, slams}` to localStorage. Wrap it:

```js
{
  schemaVersion: 1,
  savedAt: "2026-04-13T19:42:00.000Z",
  data: { target, themes, slams }
}
```

The version field is read *before* the data field. Future-you needs that
metadata to decide what to do with stale formats.

### Migration ladder

```js
// Inside useSlams.js, near the top:
const CURRENT_SCHEMA_VERSION = 1;

const migrations = {
  // Each entry transforms data FROM the previous version TO this version.
  // Version 1 is the baseline — identity function, since v1 is the first
  // shape we ever wrote. When v2 ships, we add: 2: (v1Data) => ({...v1Data, newField: default}).
  1: (data) => data,
};

function migrate(stored) {
  let { schemaVersion, data } = stored;
  while (schemaVersion < CURRENT_SCHEMA_VERSION) {
    schemaVersion += 1;
    data = migrations[schemaVersion](data);
  }
  return data;
}
```

**Why a map of version → fn instead of a `migrations/` directory?**
Premature splitting. With one schema version we'd have one file in a
directory by itself, which is worse than one entry in a map. Revisit when
we hit v3 — then the directory pays for itself.

**Why run *every* migration above the stored version, not just the latest?**
Because each migration assumes the *previous* schema as input. v1→v3 directly
would have to know about v2's intermediate shape; the ladder doesn't.

**Why a number, not a semver string?**
Schema versions don't have minor/patch — they're either compatible or they're
not. A monotonic integer is the right primitive.

### New API surface from the hook

```js
const {
  // ...existing returns...
  saveSlams,        // (data) => writes the envelope to localStorage, updates state
  addSlam,          // (slam) => appends to slams[] and saves
  resetToDefaults,  // () => clears localStorage, refetches JSON
} = useSlams();
```

For step 4 itself, no UI calls these — we add the machinery and verify it
in the browser console. SlamForm (step 6) is what wires them up.

### Error handling

- `JSON.parse` failure on stored data → log a warning, treat as missing,
  fall through to JSON
- Migration failure → same fallback
- localStorage write failure (quota exceeded, private mode) → log a warning,
  keep state in memory (don't crash, don't lie to the user that it was saved)

### Reading material (outside MDN, per Marty's ask)

| Resource | Why read it |
|---|---|
| Dan Abramov, *"A Complete Guide to useEffect"* — overreacted.io | Best deep dive on the hook lifecycle. Will cement the "what is a hook" question from chunk 1. |
| Kent C. Dodds, *"How to use React Context effectively"* — kentcdodds.com | Relevant to Marty's chunk-1 question on line 62 about Context. The canonical post. |
| Sentry engineering, *"Versioning the Sentry Browser SDK's localStorage"* | Real-world example of exactly this v1 → vn migration pattern. |
| Martin Kleppmann, *Designing Data-Intensive Applications*, ch. 4 "Encoding and Evolution" | Overkill for now, but *the* reference on schema evolution. Shelf book. |

**How often does schema migration come up in real apps?** Constantly. Any app
with offline state, browser caching, mobile DBs, or user save files faces it.
The pattern (version field + ordered migrations) is identical whether you're
versioning localStorage, SQLite, or Postgres.

### Code review questions for step 4

1. Why does the migration ladder run *every* migration above the stored
   version, not just jump to the current one?
2. What happens if `JSON.parse` throws on corrupted localStorage? Where
   should that error get caught — and why not let it bubble?
3. Why a `schemaVersion` number instead of a semver string?
4. The hook returns `addSlam` but for step 4 nothing calls it. Is that
   wasted work, or is there a reason to ship the API ahead of the UI?

---

## Step 5 — PNG export + Share button

### Goal

Add two new export options alongside the existing PDF download: a PNG file
optimized for sharing on phones, and a native Share button when the browser
supports `navigator.share`.

### `src/utils/exportPng.js` (new)

Mirror `exportPdf.js` exactly — same `(element, day, firstName)` signature,
same `html2canvas` call but `scale: 3` instead of `2`, then skip jsPDF and
just download the canvas as a PNG blob.

```js
import html2canvas from 'html2canvas';

export async function exportPng(element, day, firstName) {
  if (!element) return;
  const canvas = await html2canvas(element, { scale: 3, useCORS: true });
  canvas.toBlob((blob) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `slam-day-${day}-${firstName}.png`;
    a.click();
    URL.revokeObjectURL(url);
  }, 'image/png');
}
```

### Why scale: 3 for PNG when PDF uses 2?

`scale` is a resolution multiplier on top of CSS pixels.

| Scale | Pixel dims (600×425 source) | Use case |
|-------|------------------------------|----------|
| 1×    | 600 × 425                    | Looks pixelated on retina screens |
| 2×    | 1200 × 850                   | Print-quality PDF (no zooming) |
| 3×    | 1800 × 1275                  | Phone share-friendly (handles pinch-zoom) |

PDFs print at fixed physical size — 2× is enough. PNGs get viewed on phones
with dense displays and frequent zooming — 3× covers that without ballooning
file size beyond ~400 KB.

### `src/components/ExportButtons.jsx` (edit)

Grow from one button to three: PDF, PNG, Share. Three separate `useCallback`
handlers (one per button) — clearer than a unified `handleExport(format)`
switch. Matches the chunk-1 pattern.

```jsx
const handlePdf   = useCallback(async () => exportPdf(postcardRef.current, day, firstName), [postcardRef, day, firstName]);
const handlePng   = useCallback(async () => exportPng(postcardRef.current, day, firstName), [postcardRef, day, firstName]);
const handleShare = useCallback(async () => {
  // Feature-detect: navigator.share alone isn't enough — we need canShare
  // with a File payload to know the browser will accept the PNG.
  const blob = await capturePngBlob(postcardRef.current);
  const file = new File([blob], `slam-day-${day}-${firstName}.png`, { type: 'image/png' });
  if (navigator.canShare?.({ files: [file] })) {
    await navigator.share({ files: [file], title: `Slam day ${day}` });
  } else {
    await exportPng(postcardRef.current, day, firstName); // silent fallback
  }
}, [postcardRef, day, firstName]);
```

(`capturePngBlob` is a tiny helper extracted from `exportPng` so the share
path can reuse the canvas without re-running html2canvas. Or — simpler —
just call `exportPng` as a fallback and accept one extra capture on the
happy path. Decide during implementation.)

### Code review questions for step 5

1. Why does `canvas.toBlob` need a callback (or a Promise wrapper) when
   `toDataURL` is synchronous?
2. The PNG and PDF utilities both call `html2canvas`. Should we extract a
   shared helper? *(Hint: not yet — three lines isn't an abstraction.)*
3. Why feature-detect `navigator.canShare` separately from `navigator.share`?
4. What does `URL.revokeObjectURL` do, and what breaks if we forget it?

---

## Step 6 — `SlamForm` with tag suggestions

### Goal

Let users add their own slams without editing JSON files. Form writes to
localStorage via the step-4 machinery; "Export All Slams" lets them produce
a PR-ready JSON file.

### Fields (per spec §6.1)

- Target first name (pre-filled from `target.firstName`)
- Roast textarea
- Theme dropdown (options = `Object.keys(themes)`)
- Tag input (chip autocomplete — see below)
- Day number (auto-filled to next available, editable)

### Tag input — chip autocomplete

Spec says tags are freeform; Marty's preference is "suggest existing forms."
We do both: bias toward reuse, don't block new tags.

**Behavior:**
1. Compute `allTags` as a `useMemo` over `slams.flatMap(s => s.tags)`,
   deduped and sorted.
2. As the user types in the tag input, filter `allTags` to matches and
   render them as clickable chips below the input.
3. Clicking a suggestion adds it to the slam's tag list (shown above the
   input as removable chips).
4. Pressing Enter on a non-matching string adds it as a brand-new tag.

**Why `useMemo`?** Without it, the dedupe runs on every keystroke even
though `slams` rarely changes. `useMemo` recomputes only when its deps
change. (This is a real optimization here, not premature — the form will
re-render frequently as the user types.)

**Why "controlled" inputs (every keystroke goes through React state)?**
Because validation, suggestions, and chip rendering all need to react to
the current value. Reading from the DOM only on submit means you can't
show suggestions while typing.

### "Export All Slams" button

Serializes the full current dataset to a JSON file matching
`default-slams.json`'s schema exactly. The output must be loadable by
the same `useSlams` fetch path — that's the round trip we promise.

### "Reset to Defaults" button

Calls `resetToDefaults()` from step 4. Confirm dialog first (irreversible).

### Code review questions for step 6

1. Why is the tag union computed with `useMemo` instead of inline on every
   render?
2. The form is "controlled" — every keystroke goes through React state.
   Why do that instead of reading from the DOM on submit?
3. The exported JSON needs to round-trip back through `useSlams`. What
   edge cases would break that round trip? (Whitespace? Tag dedup? Day
   ordering? Theme references that don't exist?)
4. SlamForm needs `addSlam` from the hook. Should it call the hook
   directly, or receive `addSlam` as a prop? *(Hint: chunk-1 pattern was
   "components are dumb, App.jsx wires the hook." Stay consistent.)*

---

## Sequencing

```
Step 4 build → Step 4 review → approval
                                  ↓
                    Step 5 build → Step 5 review → approval
                                                      ↓
                                       Step 6 build → Step 6 review → chunk 2 done
```

After chunk 2 ships, chunk 3 = packaging (steps 7-9: GitHub Pages, README/
CONTRIBUTING/LICENSE, visual polish). Chunk 3 plan written then, not now.

---

## Decisions locked before starting (2026-04-13)

| Decision | Choice |
|----------|--------|
| Step 4 migration shape | Map of version → fn inside `useSlams.js` |
| Step 5 button handlers | Three handlers, one per button |
| Step 6 tag UX | Chip autocomplete with existing-tag suggestions |
| Plan doc location | `docs/plan/chunk2-features.md` (this file) |

---

## Open items

- Confirm PNG file-size budget once we have a real capture (~400 KB target).
- Decide whether `capturePngBlob` helper is worth extracting in step 5, or
  whether the share fallback should just re-run `exportPng`.
- Decide where the "Export All Slams" button lives — inside SlamForm, or in
  a new `DataActions` component alongside Reset?
