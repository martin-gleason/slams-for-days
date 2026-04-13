/**
 * App.jsx — Main application shell
 *
 * This is the top-level component that wires everything together. It:
 *   1. Calls useSlams() to load data and manage which day is selected
 *   2. Shows loading/error states while the JSON fetch is in flight
 *   3. Passes data down to child components as props
 *   4. Owns the postcardRef (a React ref to the postcard DOM node) that
 *      ExportButtons needs for screenshot-based PDF export
 *
 * Component tree:
 *   App
 *   ├── Header          — title, tagline, shimmer animation
 *   ├── DaySelector     — 31-button grid
 *   ├── Postcard        — the actual postcard card (inside print-area wrapper)
 *   ├── ExportButtons   — download PDF/PNG, share button
 *   ├── SlamForm        — add new slams (chip autocomplete tags)
 *   ├── DataActions      — export all slams JSON, reset to defaults
 *   ├── DeploymentProtocol (inline) — usage instructions
 *   ├── Prev/Next nav   (inline) — sequential day navigation
 *   └── Footer          (inline) — OCS-1138 branding
 *
 * The Deployment Protocol, Prev/Next nav, and Footer are small enough to
 * stay inline here rather than being extracted into their own components.
 * If any of them grow in complexity, they should be extracted.
 *
 * Data flow: useSlams → App → child components (via props)
 * This is "lifting state up" — the hook owns the data and selection state,
 * App distributes it, and children just render what they're given.
 */
import { useRef } from 'react';
import { useSlams } from './hooks/useSlams';
import Header from './components/Header';
import DaySelector from './components/DaySelector';
import Postcard from './components/Postcard';
import ExportButtons from './components/ExportButtons';
import SlamForm from './components/SlamForm';
import DataActions from './components/DataActions';

export default function App() {
  // useSlams returns everything we need: the data, the current selection, and controls.
  // Destructuring pulls out each piece so we can pass only what each child needs.
  const {
    slams, themes, target, currentSlam, selected, setSelected,
    loading, error, addSlam, resetToDefaults,
  } = useSlams();

  // This ref gets attached to the postcard wrapper div so ExportButtons can
  // pass the actual DOM node to html2canvas for screenshot capture.
  const postcardRef = useRef(null);

  // ── Loading state ─────────────────────────────────────────────────────
  // Shown while fetch() is in flight. Matches the dark background so there's
  // no flash of white before the app renders.
  if (loading) {
    return (
      <div style={{
        minHeight: "100vh",
        background: "linear-gradient(160deg, #0a0606 0%, #1a0a10 30%, #0a0a1a 60%, #0a0606 100%)",
        display: "flex", alignItems: "center", justifyContent: "center",
        color: "#555", fontFamily: "'Courier New', monospace", fontSize: 14,
      }}>
        Loading slams...
      </div>
    );
  }

  // ── Error state ───────────────────────────────────────────────────────
  // If fetch fails or the JSON is malformed, show a simple error message.
  if (error || !currentSlam) {
    return (
      <div style={{
        minHeight: "100vh",
        background: "linear-gradient(160deg, #0a0606 0%, #1a0a10 30%, #0a0a1a 60%, #0a0606 100%)",
        display: "flex", alignItems: "center", justifyContent: "center",
        color: "#DC143C", fontFamily: "'Courier New', monospace", fontSize: 14,
      }}>
        Failed to load slams.
      </div>
    );
  }

  const total = slams.length;

  return (
    <>
      {/* ── Global styles ──────────────────────────────────────────────
          These live here (not in a CSS file) because they're minimal and
          tightly coupled to this app's structure:
          - Print styles: hide everything except the postcard for PDF output
          - Shimmer keyframes: drives the Header title animation */}
      <style>{`
        @media print {
          @page { size: 6in 4.25in; margin: 0; }
          body, html { margin: 0 !important; padding: 0 !important; background: white !important; }
          .no-print { display: none !important; }
          .print-area { position: fixed !important; top: 0 !important; left: 0 !important; width: 6in !important; height: 4.25in !important; margin: 0 !important; padding: 0 !important; box-shadow: none !important; }
          .postcard { width: 6in !important; height: 4.25in !important; box-shadow: none !important; border-radius: 0 !important; }
        }
        @keyframes shimmer { 0% { background-position: -200% center; } 100% { background-position: 200% center; } }
      `}</style>

      {/* ── Page wrapper ───────────────────────────────────────────────
          Dark gradient background that spans the full viewport. */}
      <div style={{
        minHeight: "100vh",
        background: "linear-gradient(160deg, #0a0606 0%, #1a0a10 30%, #0a0a1a 60%, #0a0606 100%)",
        fontFamily: "'Georgia', serif",
      }}>
        {/* Title and subtitle */}
        <Header target={target} />

        {/* Day selection grid */}
        <DaySelector slams={slams} selected={selected} onSelect={setSelected} />

        {/* ── Postcard display ─────────────────────────────────────────
            The ref on this wrapper is what html2canvas captures for PDF export.
            className="print-area" styles this div when printing. */}
        <div style={{ display: "flex", justifyContent: "center", padding: "0 20px" }}>
          <div className="print-area" ref={postcardRef}>
            <Postcard data={currentSlam} themes={themes} />
          </div>
        </div>

        {/* Download button(s) */}
        <ExportButtons postcardRef={postcardRef} day={currentSlam.day} firstName={target.firstName} />

        {/* Add new slams form */}
        <SlamForm slams={slams} themes={themes} onAddSlam={addSlam} />

        {/* Dataset management: export JSON, reset to defaults */}
        <DataActions data={{ target, themes, slams }} onReset={resetToDefaults} />

        {/* ── Deployment Protocol ──────────────────────────────────────
            Collapsible instructions for how to use the exported PDF.
            Uses native <details>/<summary> instead of useState because:
              - It's accessible out of the box (keyboard, screen readers)
              - No JS needed for the toggle — works even if React fails
              - The browser handles open/close state without re-rendering
            Small enough to stay in App.jsx rather than its own component. */}
        <div className="no-print" style={{
          maxWidth: 480, margin: "0 auto", padding: "0 20px 10px", textAlign: "center",
        }}>
          <details style={{
            padding: "12px 18px", borderRadius: 8,
            background: "rgba(255,255,255,0.02)", border: "1px solid #1a1a1a",
          }}>
            <summary style={{
              fontSize: 10, color: "#DC143C",
              fontFamily: "'Courier New', monospace", letterSpacing: 2,
              textTransform: "uppercase", cursor: "pointer",
              listStyle: "none",
            }}>
              Deployment Protocol
            </summary>
            <div style={{
              fontSize: 13, color: "#666", lineHeight: 2,
              fontFamily: "'Georgia', serif", marginTop: 10, textAlign: "left",
            }}>
              <div><span style={{ color: currentSlam?.accent || "#DC143C", fontWeight: "bold" }}>1.</span> Select a day above</div>
              <div><span style={{ color: currentSlam?.accent || "#DC143C", fontWeight: "bold" }}>2.</span> Click Download PDF or PNG</div>
              <div><span style={{ color: currentSlam?.accent || "#DC143C", fontWeight: "bold" }}>3.</span> Paper: <strong style={{ color: "#999" }}>6&times;4.25</strong> | Margins: <strong style={{ color: "#999" }}>None</strong></div>
              <div><span style={{ color: currentSlam?.accent || "#DC143C", fontWeight: "bold" }}>4.</span> Attach to email &rarr; deploy &rarr; deny everything</div>
            </div>
            <div style={{
              marginTop: 10, fontSize: 11, color: "#555",
              fontFamily: "'Courier New', monospace",
            }}>
              <a
                href="https://github.com/martin-gleason/slams-for-days/blob/main/CONTRIBUTING.md"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "#DC143C", textDecoration: "none" }}
              >
                How to add your own slams &rarr;
              </a>
            </div>
          </details>
        </div>

        {/* ── Prev / Next navigation ──────────────────────────────────
            Sequential day navigation. Buttons disable at the boundaries
            (day 1 can't go prev, last day can't go next). */}
        <div className="no-print" style={{
          display: "flex", justifyContent: "center", gap: 20,
          padding: "10px 0 16px", alignItems: "center",
        }}>
          <button
            onClick={() => setSelected(Math.max(0, selected - 1))}
            disabled={selected === 0}
            style={{
              padding: "8px 20px",
              background: selected === 0 ? "#222" : "rgba(220,20,60,0.15)",
              color: selected === 0 ? "#444" : "#DC143C",
              border: `1px solid ${selected === 0 ? '#333' : '#DC143C44'}`,
              borderRadius: 6,
              cursor: selected === 0 ? "default" : "pointer",
              fontFamily: "'Courier New', monospace", fontSize: 12,
            }}
          >
            Prev
          </button>
          <span style={{
            color: "#555", fontFamily: "'Courier New', monospace", fontSize: 12,
          }}>
            {selected + 1} / {total}
          </span>
          <button
            onClick={() => setSelected(Math.min(total - 1, selected + 1))}
            disabled={selected === total - 1}
            style={{
              padding: "8px 20px",
              background: selected === total - 1 ? "#222" : "rgba(220,20,60,0.15)",
              color: selected === total - 1 ? "#444" : "#DC143C",
              border: `1px solid ${selected === total - 1 ? '#333' : '#DC143C44'}`,
              borderRadius: 6,
              cursor: selected === total - 1 ? "default" : "pointer",
              fontFamily: "'Courier New', monospace", fontSize: 12,
            }}
          >
            Next
          </button>
        </div>

        {/* ── Page footer ─────────────────────────────────────────────
            OCS-1138 branding line. Visible on screen, hidden when printing. */}
        <div className="no-print" style={{
          textAlign: "center", padding: "16px 0 28px", borderTop: "1px solid #111",
        }}>
          <div style={{
            fontSize: 8, color: "#333",
            fontFamily: "'Courier New', monospace", letterSpacing: 3,
            textTransform: "uppercase",
          }}>
            OCS-1138 &bull; Cook County Juvenile Probation &bull; Office of Career Services
          </div>
        </div>
      </div>
    </>
  );
}
