/**
 * DataActions.jsx — Dataset management buttons
 *
 * This component owns the "Export All Slams" and "Reset to Defaults" actions.
 * These live here (not in SlamForm) because they operate on the *entire dataset*,
 * not on a single slam. Separation of concerns: SlamForm adds one slam,
 * DataActions manages the collection.
 *
 * "Export All Slams" serializes the current full dataset to a JSON file that
 * matches default-slams.json's schema exactly. The output is PR-ready: someone
 * can drop it into public/data/ and it'll load. Round-trip fidelity matters —
 * the exported JSON must be loadable by useSlams without modification.
 *
 * "Reset to Defaults" clears localStorage and reloads the shipped data.
 * A window.confirm dialog guards against accidental clicks — this is
 * irreversible (any user-added slams are lost).
 *
 * Like all components in this app, DataActions is "dumb" — it receives data
 * and callbacks as props from App.jsx, not from calling useSlams directly.
 *
 * @param {Object} props
 * @param {Object}   props.data           - Full dataset { target, themes, slams }
 * @param {Function} props.onReset        - Callback to reset to defaults (from useSlams.resetToDefaults)
 */
export default function DataActions({ data, onReset }) {
  // ── Export handler ──────────────────────────────────────────────────
  // Serialize the full dataset to JSON and trigger a download. The JSON
  // is pretty-printed (2-space indent) so it's human-readable and
  // diff-friendly in a PR.
  const handleExport = () => {
    if (!data) return;

    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'slams.json';
    a.click();

    URL.revokeObjectURL(url);
  };

  // ── Reset handler ───────────────────────────────────────────────────
  // Confirm before clearing — user-added slams are lost permanently.
  const handleReset = () => {
    if (window.confirm('Reset to defaults? Any slams you added will be lost.')) {
      onReset();
    }
  };

  const buttonStyle = {
    padding: '8px 20px',
    background: 'transparent',
    border: '1px solid #333',
    color: '#666', borderRadius: 6,
    cursor: 'pointer', fontSize: 11,
    fontFamily: "'Courier New', monospace",
    letterSpacing: 1, textTransform: 'uppercase',
  };

  return (
    <div className="no-print" style={{
      display: 'flex', justifyContent: 'center', gap: 12,
      margin: '8px 0 16px', flexWrap: 'wrap',
    }}>
      <button onClick={handleExport} style={buttonStyle}>
        Export All Slams
      </button>
      <button onClick={handleReset} style={{
        ...buttonStyle,
        color: '#DC143C', borderColor: '#DC143C44',
      }}>
        Reset to Defaults
      </button>
    </div>
  );
}
