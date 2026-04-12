/**
 * useSlams.js — Custom React hook for slam data management
 *
 * This is the single data source for the entire app. Every component that
 * needs slam data gets it through this hook (via App.jsx props). This
 * isolation is intentional: when we added localStorage (step 4), only
 * this file changed — no components needed to know where data comes from.
 *
 * Loading priority (spec §2.2):
 *   1. localStorage ("slams-for-days:data") — if the user has saved edits
 *   2. default-slams.json from public/ — the shipped dataset
 *   3. Error state — if both fail
 *
 * localStorage is wrapped in a versioned envelope so future schema changes
 * can be migrated automatically (see CURRENT_SCHEMA_VERSION and migrations).
 *
 * @returns {Object} { slams, themes, target, currentSlam, selected, setSelected,
 *                     loading, error, saveSlams, addSlam, resetToDefaults }
 */
import { useState, useEffect, useCallback } from 'react';

// ── localStorage constants ──────────────────────────────────────────────
// STORAGE_KEY: the key we read/write in localStorage. Namespaced to avoid
// collisions with other apps on the same origin.
const STORAGE_KEY = 'slams-for-days:data';

// CURRENT_SCHEMA_VERSION: a monotonic integer that tracks the shape of the
// data we write to localStorage. When we change the schema, we bump this
// number and add a migration function below.
//
// Why a plain number instead of semver like "1.0.0"?
//   Schema versions are either compatible or they're not — there's no
//   concept of "minor" or "patch." A monotonic integer is the right
//   primitive for an ordered migration ladder.
const CURRENT_SCHEMA_VERSION = 1;

// ── Migration ladder ────────────────────────────────────────────────────
// Each entry transforms data FROM the previous version TO this version.
// Version 1 is the baseline (identity) since it's the first shape we ever
// wrote. When v2 ships, add:  2: (data) => ({ ...data, newField: default })
//
// Why run every migration above the stored version instead of jumping
// straight to the current one?
//   Each migration assumes the *previous* schema as input. A direct v1→v3
//   jump would have to know about v2's intermediate shape. The ladder lets
//   each step be small and self-contained.
const migrations = {
  1: (data) => data,
};

/**
 * Run the stored data through every migration between its version and the
 * current version. Returns the migrated data object (or the original if
 * already current).
 */
function migrate(stored) {
  let version = stored.schemaVersion;
  let data = stored.data;

  while (version < CURRENT_SCHEMA_VERSION) {
    version += 1;
    data = migrations[version](data);
  }

  return data;
}

/**
 * Try to load slam data from localStorage.
 * Returns the migrated data object, or null if nothing is stored / the
 * stored value is corrupt / migration fails.
 *
 * Errors are logged but never thrown — a bad localStorage value should
 * degrade to the JSON fallback, not crash the app.
 */
function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const stored = JSON.parse(raw);

    // Guard: if someone hand-edited localStorage and removed the version
    // field, treat it as corrupt rather than guessing.
    if (typeof stored.schemaVersion !== 'number' || !stored.data) {
      console.warn('useSlams: localStorage data missing schemaVersion or data field — ignoring');
      return null;
    }

    return migrate(stored);
  } catch (err) {
    console.warn('useSlams: failed to load from localStorage, falling back to JSON', err);
    return null;
  }
}

/**
 * Write the full data object to localStorage wrapped in a versioned envelope.
 * Returns true on success, false on failure (quota exceeded, private mode, etc.).
 *
 * Failures are logged but never thrown — the app continues with in-memory
 * state even if persistence is broken.
 */
function saveToStorage(data) {
  try {
    const envelope = {
      schemaVersion: CURRENT_SCHEMA_VERSION,
      savedAt: new Date().toISOString(),
      data,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(envelope));
    return true;
  } catch (err) {
    console.warn('useSlams: failed to write to localStorage', err);
    return false;
  }
}

// ── The hook ────────────────────────────────────────────────────────────

export function useSlams() {
  const [data, setData] = useState(null);       // { target, themes, slams }
  const [selected, setSelected] = useState(0);   // Index into the slams array
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ── Load data on mount ──────────────────────────────────────────────
  // Priority: localStorage first, then default-slams.json.
  // The empty dependency array [] means this runs exactly once — not on
  // every re-render. import.meta.env.BASE_URL is set by Vite: "/" in dev,
  // "/slams-for-days/" in production (from vite.config.js).
  useEffect(() => {
    const stored = loadFromStorage();
    if (stored) {
      setData(stored);
      setLoading(false);
      return; // localStorage had valid data — skip the network fetch
    }

    // No localStorage data (or it was corrupt). Fetch the shipped defaults.
    fetch(`${import.meta.env.BASE_URL}data/default-slams.json`)
      .then(r => r.json())
      .then(setData)
      .catch(setError)
      .finally(() => setLoading(false));
  }, []);

  // ── Derived values ──────────────────────────────────────────────────
  // Destructure with safe defaults so components don't crash while loading.
  // The ?? operator means "use the right side if the left side is null/undefined."
  const slams = data?.slams ?? [];
  const themes = data?.themes ?? {};
  const target = data?.target ?? {};
  const currentSlam = slams[selected] ?? null;

  // ── Write operations ────────────────────────────────────────────────
  // These update both in-memory state AND localStorage. Components never
  // talk to localStorage directly — they call these functions through props
  // wired up in App.jsx.

  /**
   * Replace the entire dataset and persist it.
   * Use this for bulk operations (e.g., importing a JSON file).
   */
  const saveSlams = useCallback((newData) => {
    setData(newData);
    saveToStorage(newData);
  }, []);

  /**
   * Append a single slam to the array and persist. The new slam is added
   * at the end; day number should be set by the caller (SlamForm, step 6).
   */
  const addSlam = useCallback((slam) => {
    setData(prev => {
      const updated = { ...prev, slams: [...prev.slams, slam] };
      saveToStorage(updated);
      return updated;
    });
  }, []);

  /**
   * Clear localStorage and reload the shipped default-slams.json.
   * This is the "factory reset" — irreversible once confirmed by the UI.
   */
  const resetToDefaults = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setLoading(true);
    setError(null);
    fetch(`${import.meta.env.BASE_URL}data/default-slams.json`)
      .then(r => r.json())
      .then(setData)
      .catch(setError)
      .finally(() => setLoading(false));
  }, []);

  return {
    slams, themes, target, currentSlam,
    selected, setSelected,
    loading, error,
    saveSlams, addSlam, resetToDefaults,
  };
}
