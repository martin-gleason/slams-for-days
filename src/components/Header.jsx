/**
 * Header.jsx — Page title and subtitle
 *
 * Renders the top-of-page branding: the "Office of Career Services" label,
 * the animated "31 Slams for 31 Years" title, the dedication subtitle, and
 * the instruction tagline.
 *
 * All text is driven by the `target` object from slams.json:
 *   - target.tagline → the main h1 text
 *   - target.title   → role prefix (e.g., "SPO")
 *   - target.firstName → first name only (never last name — see spec §1)
 *
 * The shimmer animation is a gradient that slides across the h1 text using
 * background-clip: text. The @keyframes rule for "shimmer" lives in App.jsx's
 * inline <style> block because it's global CSS, not a per-component style.
 *
 * className="no-print" hides this entire section when printing — only the
 * postcard itself should appear on the printed page.
 *
 * @param {Object} props
 * @param {Object} props.target - { firstName, title, tagline } from slams.json
 */
export default function Header({ target }) {
  return (
    <div className="no-print" style={{ textAlign: "center", padding: "28px 20px 16px" }}>
      {/* Small caps label above the title */}
      <div style={{
        fontSize: 8, letterSpacing: 8, textTransform: "uppercase",
        color: "#DC143C", marginBottom: 8,
        fontFamily: "'Courier New', monospace",
      }}>
        Office of Career Services Presents
      </div>

      {/* Animated gradient title — the shimmer effect scrolls the background
          position continuously, creating a metallic/fire sweep across the text.
          WebkitBackgroundClip: "text" makes the gradient visible only through
          the letterforms, while WebkitTextFillColor: "transparent" hides the
          actual text color so the gradient shows through. */}
      <h1 style={{
        fontSize: 34, color: "#fdf6e3", margin: "0 0 4px",
        fontWeight: "normal", fontStyle: "italic",
        background: "linear-gradient(90deg, #E8383B, #FFD700, #FF7F00, #E8383B, #FFD700)",
        backgroundSize: "200% auto",
        WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
        animation: "shimmer 4s linear infinite",
      }}>
        {target.tagline}
      </h1>

      {/* Dedication line — uses target data, never hardcoded names */}
      <div style={{ fontSize: 13, color: "#777", fontStyle: "italic", marginBottom: 2 }}>
        A Daily Devotional for {target.title} {target.firstName}
      </div>

      {/* Instruction tagline */}
      <div style={{
        fontSize: 9, color: "#444",
        fontFamily: "'Courier New', monospace", letterSpacing: 2,
      }}>
        Select &bull; Preview &bull; Print to PDF &bull; Deliver with prejudice
      </div>
    </div>
  );
}
