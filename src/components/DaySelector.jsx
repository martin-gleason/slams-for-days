/**
 * DaySelector.jsx — Day navigation grid
 *
 * Renders a row of circular buttons (one per slam) so the user can jump
 * directly to any day. The currently selected button gets the slam's accent
 * color as its background; unselected buttons are dim.
 *
 * This component doesn't manage state — it receives the current selection
 * from App.jsx and calls onSelect(index) when a button is clicked. This
 * pattern is called "controlled component": the parent owns the state,
 * the child just renders it and reports interactions.
 *
 * className="no-print" hides the selector when printing.
 *
 * @param {Object} props
 * @param {Array}    props.slams    - Full slams array (need .day and .accent from each)
 * @param {number}   props.selected - Currently selected index
 * @param {Function} props.onSelect - Callback: onSelect(index) to change selection
 */
export default function DaySelector({ slams, selected, onSelect }) {
  return (
    <div className="no-print" style={{
      display: "flex", flexWrap: "wrap", gap: 5,
      justifyContent: "center", maxWidth: 620,
      margin: "0 auto 20px", padding: "0 16px",
    }}>
      {slams.map((r, i) => (
        <button key={r.day} onClick={() => onSelect(i)} style={{
          width: 34, height: 34, borderRadius: "50%",
          // Selected: filled with the slam's accent color gradient
          // Unselected: near-invisible dark background
          background: selected === i
            ? `linear-gradient(135deg, ${r.accent}, ${r.accent}cc)`
            : "rgba(255,255,255,0.04)",
          color: selected === i ? "white" : "#666",
          border: selected === i ? `2px solid ${r.accent}` : "1px solid #333",
          cursor: "pointer", fontSize: 12,
          fontWeight: selected === i ? "bold" : "normal",
          fontFamily: "'Georgia', serif",
          // Glow effect on the selected button using the accent color at low opacity
          boxShadow: selected === i ? `0 0 12px ${r.accent}44` : "none",
        }}>
          {r.day}
        </button>
      ))}
    </div>
  );
}
