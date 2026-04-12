/**
 * SlamForm.jsx — Form for creating new slams
 *
 * A controlled form that lets users add their own slams to the dataset.
 * All fields are managed via React state — every keystroke updates state,
 * and the form reads from state to render. This is a "controlled component"
 * pattern: React is the single source of truth, not the DOM.
 *
 * Why controlled? Because we need to react to the current input value
 * *while the user is typing* — the tag autocomplete suggestions depend on
 * what's been typed so far. If we only read from the DOM on submit, we
 * couldn't show live suggestions.
 *
 * Tag input uses a chip autocomplete pattern:
 *   - Existing tags across all slams are computed once via useMemo
 *   - As the user types, matching existing tags appear as clickable chips
 *   - Selected tags are shown as removable chips above the input
 *   - New tags can also be typed freely (Enter to add)
 *
 * This component is "dumb" — it receives data and callbacks as props from
 * App.jsx rather than calling useSlams directly. This follows the chunk-1
 * pattern: components render what they're given, the hook wires through App.
 *
 * @param {Object} props
 * @param {Array}   props.slams     - Current slams array (for tag extraction + next day calc)
 * @param {Object}  props.themes    - Theme map (for dropdown options)
 * @param {Function} props.onAddSlam - Callback to add a slam (from useSlams.addSlam)
 */
import { useState, useMemo } from 'react';

export default function SlamForm({ slams, themes, onAddSlam }) {
  // ── Form state ──────────────────────────────────────────────────────
  // Each field is its own useState. This is slightly more verbose than a
  // single formData object, but makes each field's update logic obvious.
  const [roast, setRoast] = useState('');
  const [theme, setTheme] = useState(Object.keys(themes)[0] ?? '');
  const [tags, setTags] = useState([]);          // Array of selected tag strings
  const [tagInput, setTagInput] = useState('');   // Current text in the tag input
  const [day, setDay] = useState(() => {
    // Auto-fill to next available day number
    const maxDay = slams.reduce((max, s) => Math.max(max, s.day), 0);
    return maxDay + 1;
  });
  const [showForm, setShowForm] = useState(false);

  // ── Tag autocomplete ────────────────────────────────────────────────
  // Compute the union of all existing tags across all slams. useMemo
  // ensures this only recalculates when `slams` changes — not on every
  // keystroke in the form. Without useMemo, we'd run flatMap + Set on
  // every render, which is wasteful since slams rarely change while the
  // form is open.
  const allTags = useMemo(() => {
    const tagSet = new Set(slams.flatMap(s => s.tags ?? []));
    return [...tagSet].sort();
  }, [slams]);

  // Filter existing tags to match what the user is currently typing,
  // excluding tags already selected. This runs on every keystroke (cheap —
  // it's just a .filter on a small array).
  const suggestions = tagInput.trim()
    ? allTags.filter(t =>
        t.toLowerCase().includes(tagInput.toLowerCase()) && !tags.includes(t)
      )
    : [];

  // ── Tag handlers ────────────────────────────────────────────────────
  const addTag = (tag) => {
    const trimmed = tag.trim().toLowerCase();
    if (trimmed && !tags.includes(trimmed)) {
      setTags(prev => [...prev, trimmed]);
    }
    setTagInput('');
  };

  const removeTag = (tag) => {
    setTags(prev => prev.filter(t => t !== tag));
  };

  const handleTagKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault(); // Don't submit the form
      if (tagInput.trim()) addTag(tagInput);
    }
  };

  // ── Form submit ─────────────────────────────────────────────────────
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!roast.trim()) return;

    const themeData = themes[theme];
    const slam = {
      day: Number(day),
      roast: roast.trim(),
      theme,
      accent: themeData?.accent ?? '#DC143C',
      tags,
    };

    onAddSlam(slam);

    // Reset form for next entry
    setRoast('');
    setTags([]);
    setTagInput('');
    setDay(prev => prev + 1);
  };

  // ── Styles ──────────────────────────────────────────────────────────
  const inputStyle = {
    width: '100%', padding: '8px 12px', borderRadius: 6,
    border: '1px solid #333', background: '#111', color: '#ccc',
    fontFamily: "'Georgia', serif", fontSize: 13, boxSizing: 'border-box',
  };

  const labelStyle = {
    display: 'block', fontSize: 10, color: '#888',
    fontFamily: "'Courier New', monospace", letterSpacing: 1,
    textTransform: 'uppercase', marginBottom: 4,
  };

  const chipStyle = {
    display: 'inline-flex', alignItems: 'center', gap: 4,
    padding: '3px 10px', borderRadius: 12, fontSize: 11,
    fontFamily: "'Courier New', monospace",
    background: 'rgba(220,20,60,0.15)', color: '#DC143C',
    border: '1px solid #DC143C44',
  };

  if (!showForm) {
    return (
      <div className="no-print" style={{
        display: 'flex', justifyContent: 'center', margin: '12px 0',
      }}>
        <button onClick={() => setShowForm(true)} style={{
          padding: '10px 28px',
          background: 'transparent', border: '1px solid #333',
          color: '#666', borderRadius: 8, cursor: 'pointer',
          fontFamily: "'Courier New', monospace", fontSize: 12,
          letterSpacing: 1, textTransform: 'uppercase',
        }}>
          + Add Slam
        </button>
      </div>
    );
  }

  return (
    <div className="no-print" style={{
      maxWidth: 480, margin: '16px auto', padding: '0 20px',
    }}>
      <form onSubmit={handleSubmit} style={{
        padding: '16px 20px', borderRadius: 8,
        background: 'rgba(255,255,255,0.02)', border: '1px solid #1a1a1a',
      }}>
        <div style={{
          fontSize: 10, color: '#DC143C',
          fontFamily: "'Courier New', monospace", letterSpacing: 2,
          marginBottom: 14, textTransform: 'uppercase', textAlign: 'center',
        }}>
          New Slam
        </div>

        {/* ── Roast text ─────────────────────────────────────────── */}
        <div style={{ marginBottom: 12 }}>
          <label style={labelStyle}>Roast</label>
          <textarea
            value={roast}
            onChange={(e) => setRoast(e.target.value)}
            placeholder="Write your roast..."
            rows={3}
            style={{ ...inputStyle, resize: 'vertical' }}
          />
        </div>

        {/* ── Theme + Day row ────────────────────────────────────── */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
          <div style={{ flex: 2 }}>
            <label style={labelStyle}>Theme</label>
            <select
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              style={{ ...inputStyle, cursor: 'pointer' }}
            >
              {Object.entries(themes).map(([key, t]) => (
                <option key={key} value={key}>{t.label}</option>
              ))}
            </select>
          </div>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Day</label>
            <input
              type="number"
              value={day}
              onChange={(e) => setDay(e.target.value)}
              min={1}
              style={{ ...inputStyle, textAlign: 'center' }}
            />
          </div>
        </div>

        {/* ── Tags with chip autocomplete ────────────────────────── */}
        <div style={{ marginBottom: 14 }}>
          <label style={labelStyle}>Tags</label>

          {/* Selected tag chips */}
          {tags.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 6 }}>
              {tags.map(tag => (
                <span key={tag} style={chipStyle}>
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    style={{
                      background: 'none', border: 'none', color: '#DC143C',
                      cursor: 'pointer', padding: 0, fontSize: 14, lineHeight: 1,
                    }}
                  >
                    &times;
                  </button>
                </span>
              ))}
            </div>
          )}

          {/* Tag text input */}
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleTagKeyDown}
            placeholder="Type a tag and press Enter..."
            style={inputStyle}
          />

          {/* Autocomplete suggestion chips */}
          {suggestions.length > 0 && (
            <div style={{
              display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 6,
            }}>
              {suggestions.map(tag => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => addTag(tag)}
                  style={{
                    ...chipStyle,
                    cursor: 'pointer',
                    background: 'rgba(255,255,255,0.05)',
                    color: '#888', border: '1px solid #333',
                  }}
                >
                  + {tag}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── Submit + Cancel ────────────────────────────────────── */}
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
          <button type="submit" style={{
            padding: '10px 28px',
            background: 'linear-gradient(135deg, #DC143C, #8B0000)',
            color: 'white', border: 'none', borderRadius: 8,
            cursor: 'pointer', fontSize: 13,
            fontFamily: "'Georgia', serif", fontWeight: 'bold', letterSpacing: 1,
            boxShadow: '0 4px 16px rgba(220,20,60,0.3)',
          }}>
            Add Slam
          </button>
          <button type="button" onClick={() => setShowForm(false)} style={{
            padding: '10px 28px',
            background: 'transparent', border: '1px solid #333',
            color: '#666', borderRadius: 8, cursor: 'pointer',
            fontFamily: "'Courier New', monospace", fontSize: 12,
          }}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
