/**
 * useSlams.js — Custom React hook for slam data management
 *
 * This is the single data source for the entire app. Every component that
 * needs slam data gets it through this hook (via App.jsx props). This
 * isolation is intentional: if we later swap from JSON to a database or
 * add localStorage caching, only this file changes — no components need
 * to know where the data comes from.
 *
 * Current behavior (v1.5 foundation):
 *   - Fetches default-slams.json from the public/ directory on mount
 *   - Tracks which slam is currently selected (by array index)
 *   - Returns loading/error states so the UI can show feedback
 *
 * Planned (step 4):
 *   - localStorage read/write for user-created slams
 *   - "Reset to defaults" that clears localStorage and reloads JSON
 *
 * @returns {Object} { slams, themes, target, currentSlam, selected, setSelected, loading, error }
 */
import { useState, useEffect } from 'react';

export function useSlams() {
  const [data, setData] = useState(null);       // Raw JSON: { target, themes, slams }
  const [selected, setSelected] = useState(0);   // Index into the slams array
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch slam data once on mount. The empty dependency array [] means this
  // runs exactly once — not on every re-render. import.meta.env.BASE_URL is
  // set by Vite: "/" in dev, "/slams-for-days/" in production (from vite.config.js).
  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}data/default-slams.json`)
      .then(r => r.json())
      .then(setData)
      .catch(setError)
      .finally(() => setLoading(false));
  }, []);

  // Destructure with safe defaults so components don't crash while loading.
  // The ?? operator means "use the right side if the left side is null/undefined."
  const slams = data?.slams ?? [];
  const themes = data?.themes ?? {};
  const target = data?.target ?? {};
  const currentSlam = slams[selected] ?? null;

  return { slams, themes, target, currentSlam, selected, setSelected, loading, error };
}
