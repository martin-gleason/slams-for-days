/**
 * Postcard.jsx — The core postcard renderer
 *
 * This component renders a single 576×408px postcard card. It's a pure
 * display component — it receives a slam object and the themes map, and
 * renders everything from that data. No state, no side effects.
 *
 * Layout structure (from back to front, z-index order):
 *   1. Background: warm parchment gradient
 *   2. Corner images: theme images at top-left and top-right (mirrored)
 *   3. Bottom image: second theme image, centered at bottom
 *   4. Rainbow accent lines: thin gradient strips at top and bottom edges
 *   5. Content layer (z-index 2):
 *      - Day badge: colored circle with the day number
 *      - Series label: "31 Slams for 31 Years"
 *      - Day/theme label: "Day N • Theme Name"
 *      - Roast text: the actual quote, italic, in smart quotes
 *      - Footer: emoji decorations + OCS-1138 branding
 *
 * Image loading:
 *   Images are loaded from /public/images/themes/{theme}/ as static files.
 *   The BASE_URL prefix (from Vite) ensures paths work both in dev (/)
 *   and production (/slams-for-days/).
 *
 * Font sizing:
 *   The roast text auto-scales based on character count to prevent overflow.
 *   Minimum is 14px (spec §4.2). Longer roasts get smaller text.
 *
 * @param {Object} props
 * @param {Object} props.data   - A single slam: { day, roast, theme, accent }
 * @param {Object} props.themes - The full themes map from slams.json
 */

// Card dimensions in pixels — matches the 6" × 4.25" postcard at 96 DPI
const CARD_W = 576;
const CARD_H = 408;

export default function Postcard({ data, themes }) {
  // Look up the theme config. Falls back to "bear" if the theme key is missing,
  // then to a bare-minimum default if even "bear" doesn't exist.
  const theme = themes[data.theme] || themes.bear || { images: [], label: data.theme };

  // Build the base path for this theme's image directory
  const basePath = `${import.meta.env.BASE_URL}images/themes/${data.theme}/`;
  const images = theme.images || [];
  const label = theme.label || data.theme;

  // Auto-scale font size based on roast length to prevent text overflow.
  // Spec §4.2 sets 14px as the floor (was 12.5px in v1.0).
  const fontSize = data.roast.length > 180 ? 14
    : data.roast.length > 140 ? 14.5
    : data.roast.length > 100 ? 15
    : 16;

  return (
    <div className="postcard" style={{
      width: CARD_W, height: CARD_H, position: "relative", overflow: "hidden",
      background: "linear-gradient(170deg, #fdf6e3 0%, #f5eed6 50%, #faf3de 100%)",
      border: `3px solid ${data.accent}`,
      boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
      fontFamily: "'Georgia', 'Palatino Linotype', serif",
    }}>
      {/* ── Corner images ──────────────────────────────────────────────
          First theme image appears in both top corners. The right copy
          is horizontally flipped via scaleX(-1) for visual symmetry. */}
      {images[0] && (
        <img src={`${basePath}${images[0]}`} alt="" style={{
          position: "absolute", top: 6, left: 6, height: 65,
          opacity: 0.35, borderRadius: 4,
        }}/>
      )}
      {images[0] && (
        <img src={`${basePath}${images[0]}`} alt="" style={{
          position: "absolute", top: 6, right: 6, height: 65,
          opacity: 0.35, borderRadius: 4, transform: "scaleX(-1)",
        }}/>
      )}

      {/* ── Bottom center image ────────────────────────────────────────
          Second theme image, centered at the bottom as a subtle watermark. */}
      {images[1] && (
        <img src={`${basePath}${images[1]}`} alt="" style={{
          position: "absolute", bottom: 8, left: "50%",
          transform: "translateX(-50%)", height: 50,
          opacity: 0.3, borderRadius: 4,
        }}/>
      )}

      {/* ── Rainbow accent lines ───────────────────────────────────────
          Thin rainbow gradients at the very top and bottom of the card.
          The bottom gradient is reversed for a mirror effect. */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: 3,
        background: "linear-gradient(90deg, #FF0000, #FF7F00, #FFFF00, #00FF00, #0000FF, #4B0082, #8F00FF)",
        opacity: 0.6,
      }}/>
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0, height: 3,
        background: "linear-gradient(90deg, #8F00FF, #4B0082, #0000FF, #00FF00, #FFFF00, #FF7F00, #FF0000)",
        opacity: 0.6,
      }}/>

      {/* ── Content layer ──────────────────────────────────────────────
          z-index: 2 ensures text sits above the background images. */}
      <div style={{
        position: "relative", zIndex: 2, height: "100%",
        display: "flex", flexDirection: "column",
        justifyContent: "center", alignItems: "center",
        padding: "52px 65px 48px", textAlign: "center",
      }}>
        {/* Day badge — colored circle with the day number */}
        <div style={{
          position: "absolute", top: 10, left: "50%", transform: "translateX(-50%)",
          background: `linear-gradient(135deg, ${data.accent}, ${data.accent}bb)`,
          color: "white", width: 34, height: 34, borderRadius: "50%",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontWeight: "bold", fontSize: 15,
          boxShadow: `0 2px 8px ${data.accent}44`,
          border: "1.5px solid rgba(255,255,255,0.3)",
        }}>
          {data.day}
        </div>

        {/* Series label */}
        <div style={{
          fontSize: 7, letterSpacing: 5, textTransform: "uppercase",
          color: data.accent, marginBottom: 5,
          fontFamily: "'Courier New', monospace", fontWeight: "bold", opacity: 0.6,
        }}>
          31 Slams for 31 Years
        </div>

        {/* Day and theme label */}
        <div style={{
          fontSize: 7, letterSpacing: 2, color: "#999",
          fontFamily: "'Courier New', monospace", marginBottom: 14, opacity: 0.5,
        }}>
          Day {data.day} &bull; {label}
        </div>

        {/* ── The roast ────────────────────────────────────────────────
            whiteSpace: "pre-line" preserves \n line breaks from the JSON
            while still wrapping long lines normally. The text-shadow creates
            a soft white glow behind the text for readability over images. */}
        <div style={{
          fontSize, lineHeight: 1.7, color: "#1a1a1a", fontStyle: "italic",
          maxWidth: 430, textShadow: "0 0 30px rgba(255,255,255,0.95)",
          whiteSpace: "pre-line",
        }}>
          &ldquo;{data.roast}&rdquo;
        </div>

        {/* ── Footer ───────────────────────────────────────────────────
            Emoji decorations flanking the OCS-1138 branding.
            Unicode: ☠ (skull), ⚡ (lightning), 🌹 (rose) */}
        <div style={{
          position: "absolute", bottom: 12, width: "calc(100% - 130px)",
          display: "flex", justifyContent: "space-between", alignItems: "flex-end",
        }}>
          <div style={{
            fontSize: 6, color: "#bbb",
            fontFamily: "'Courier New', monospace", letterSpacing: 1,
          }}>
            {"\u2620"} {"\u26A1"} {"\u{1F339}"}
          </div>
          <div style={{
            fontSize: 6, color: "#bbb",
            fontFamily: "'Courier New', monospace", letterSpacing: 2,
            textTransform: "uppercase", textAlign: "center", lineHeight: 1.5,
          }}>
            OCS-1138<br/>
            <span style={{ fontSize: 5, opacity: 0.7 }}>Office of Career Services</span>
          </div>
          <div style={{
            fontSize: 6, color: "#bbb",
            fontFamily: "'Courier New', monospace", letterSpacing: 1,
          }}>
            {"\u{1F339}"} {"\u26A1"} {"\u2620"}
          </div>
        </div>
      </div>
    </div>
  );
}
