/**
 * ExportButtons.jsx — Download and share action buttons
 *
 * Renders three buttons:
 *   1. "Download PDF" — captures the postcard as a 6×4.25" PDF (2x scale)
 *   2. "Download PNG" — captures as a high-res PNG (3x scale, share-friendly)
 *   3. "Share" — uses the native share sheet on supported browsers, falls
 *      back to PNG download on unsupported ones
 *
 * Each button has its own useCallback handler. We chose three separate
 * handlers over a single handleExport(format) because:
 *   - Each handler is ~1 line of logic — no savings from unifying
 *   - Reading the code, you can see exactly what each button does
 *   - The Share handler has extra logic (feature detection, File creation)
 *     that doesn't fit a simple switch
 *
 * The export logic lives in utils/exportPdf.js and utils/exportPng.js —
 * this component is just button UI + click handler wiring. The utilities
 * both use html2canvas internally, but we don't extract a shared helper
 * because the calls differ (scale: 2 vs 3, PDF vs blob output) and three
 * lines isn't worth an abstraction.
 *
 * @param {Object} props
 * @param {Object}  props.postcardRef - React ref to the postcard DOM element
 * @param {number}  props.day         - Current day number (for filename)
 * @param {string}  props.firstName   - Target's first name (for filename)
 */
import { useCallback } from 'react';
import { exportPdf } from '../utils/exportPdf';
import { exportPng, capturePngBlob } from '../utils/exportPng';

export default function ExportButtons({ postcardRef, day, firstName }) {
  // ── Handler: PDF download ───────────────────────────────────────────
  const handlePdf = useCallback(async () => {
    await exportPdf(postcardRef.current, day, firstName);
  }, [postcardRef, day, firstName]);

  // ── Handler: PNG download ───────────────────────────────────────────
  const handlePng = useCallback(async () => {
    await exportPng(postcardRef.current, day, firstName);
  }, [postcardRef, day, firstName]);

  // ── Handler: Share (native share sheet or PNG fallback) ─────────────
  // Why do we feature-detect navigator.canShare separately from
  // navigator.share? Because some browsers expose .share() but don't
  // support sharing *files* — only URLs and text. canShare({ files })
  // is the only reliable way to check if the browser will accept a
  // File payload. Without this check, .share() would throw on desktop
  // Chrome, for example.
  const handleShare = useCallback(async () => {
    const blob = await capturePngBlob(postcardRef.current);
    if (!blob) return;

    const file = new File(
      [blob],
      `slam-day-${day}-${firstName}.png`,
      { type: 'image/png' }
    );

    // Feature detection: can this browser share a file?
    if (navigator.canShare?.({ files: [file] })) {
      try {
        await navigator.share({ files: [file], title: `Slam day ${day}` });
      } catch (err) {
        // User cancelled the share sheet — not an error, just bail silently.
        if (err.name !== 'AbortError') console.warn('Share failed:', err);
      }
    } else {
      // Browser doesn't support file sharing — fall back to PNG download.
      // The user sees the same result (a PNG file) just via download instead
      // of the share sheet. No error message needed.
      await exportPng(postcardRef.current, day, firstName);
    }
  }, [postcardRef, day, firstName]);

  // ── Shared button style ─────────────────────────────────────────────
  // All three buttons share the same base style. Only the background
  // gradient differs to give visual hierarchy: PDF is primary (crimson),
  // PNG is secondary (darker), Share is tertiary (outline-style).
  const baseStyle = {
    padding: "12px 24px",
    color: "white", border: "none", borderRadius: 8,
    cursor: "pointer", fontSize: 13,
    fontFamily: "'Georgia', serif", fontWeight: "bold", letterSpacing: 1,
  };

  return (
    <div className="no-print" style={{
      display: "flex", justifyContent: "center", gap: 12, margin: "20px 0 12px",
      flexWrap: "wrap",
    }}>
      <button onClick={handlePdf} style={{
        ...baseStyle,
        background: "linear-gradient(135deg, #DC143C, #8B0000)",
        boxShadow: "0 4px 16px rgba(220,20,60,0.3)",
      }}>
        Download PDF
      </button>

      <button onClick={handlePng} style={{
        ...baseStyle,
        background: "linear-gradient(135deg, #8B0000, #4a0000)",
        boxShadow: "0 4px 16px rgba(139,0,0,0.3)",
      }}>
        Download PNG
      </button>

      <button onClick={handleShare} style={{
        ...baseStyle,
        background: "transparent",
        border: "1px solid #DC143C44",
        color: "#DC143C",
        boxShadow: "none",
      }}>
        Share
      </button>
    </div>
  );
}
