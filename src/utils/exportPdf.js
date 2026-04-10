/**
 * exportPdf.js — PDF export utility
 *
 * Captures the postcard DOM element as a rasterized image using html2canvas,
 * then embeds that image into a properly-sized PDF using jsPDF.
 *
 * How it works:
 *   1. html2canvas "screenshots" the DOM element at 2x resolution for sharpness
 *   2. The screenshot becomes a PNG data URL (base64-encoded image string)
 *   3. jsPDF creates a landscape PDF at exactly 6" × 4.25" (standard postcard)
 *   4. The PNG is placed to fill the entire PDF page
 *   5. Browser triggers a download with the filename slam-day-{N}-{firstName}.pdf
 *
 * Why html2canvas instead of CSS print? Because CSS @page has inconsistent
 * browser support for custom sizes, margins, and image rendering. This
 * approach gives pixel-perfect output regardless of browser.
 *
 * Planned (step 5): exportPng.js will follow the same pattern but skip
 * the jsPDF step — it'll just download the canvas directly as a PNG blob.
 *
 * @param {HTMLElement} element - The DOM node to capture (the postcard wrapper)
 * @param {number} day - Day number for the filename
 * @param {string} firstName - Target's first name for the filename
 */
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export async function exportPdf(element, day, firstName) {
  if (!element) return;

  // scale: 2 renders at double resolution for print quality (1152×816 px)
  // useCORS: true allows html2canvas to capture images from our own origin
  const canvas = await html2canvas(element, { scale: 2, useCORS: true });

  // Create a landscape PDF sized to a standard 6×4.25" postcard
  const pdf = new jsPDF({ orientation: 'landscape', unit: 'in', format: [6, 4.25] });

  // Place the captured image at (0,0) filling the full page
  pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, 6, 4.25);

  pdf.save(`slam-day-${day}-${firstName}.pdf`);
}
