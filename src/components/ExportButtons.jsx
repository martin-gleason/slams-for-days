/**
 * ExportButtons.jsx — Download action buttons
 *
 * Currently renders a single "Download PDF" button. When clicked, it
 * captures the postcard DOM element and generates a 6×4.25" PDF file.
 *
 * The actual export logic lives in utils/exportPdf.js — this component
 * is just the button UI and click handler wiring.
 *
 * useCallback memoizes the handler so it doesn't get recreated on every
 * render. The dependency array [postcardRef, day, firstName] means it
 * only rebuilds when one of those values changes (i.e., when the user
 * selects a different day).
 *
 * Planned (step 5):
 *   - Add "Download PNG" button (uses exportPng.js)
 *   - Add "Share" button (navigator.share API with PNG fallback)
 *
 * @param {Object} props
 * @param {Object}  props.postcardRef - React ref to the postcard DOM element
 * @param {number}  props.day         - Current day number (for filename)
 * @param {string}  props.firstName   - Target's first name (for filename)
 */
import { useCallback } from 'react';
import { exportPdf } from '../utils/exportPdf';

export default function ExportButtons({ postcardRef, day, firstName }) {
  const handleDownload = useCallback(async () => {
    await exportPdf(postcardRef.current, day, firstName);
  }, [postcardRef, day, firstName]);

  return (
    <div className="no-print" style={{
      display: "flex", justifyContent: "center", gap: 12, margin: "20px 0 12px",
    }}>
      <button onClick={handleDownload} style={{
        padding: "12px 32px",
        background: "linear-gradient(135deg, #DC143C, #8B0000)",
        color: "white", border: "none", borderRadius: 8,
        cursor: "pointer", fontSize: 14,
        fontFamily: "'Georgia', serif", fontWeight: "bold", letterSpacing: 1,
        boxShadow: "0 4px 16px rgba(220,20,60,0.3)",
      }}>
        Download PDF
      </button>
    </div>
  );
}
