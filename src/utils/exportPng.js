/**
 * exportPng.js — PNG export utility
 *
 * Captures the postcard DOM element as a high-resolution PNG image using
 * html2canvas, then triggers a browser download.
 *
 * How it works:
 *   1. html2canvas "screenshots" the DOM element at 3x resolution
 *   2. canvas.toBlob() encodes the pixels into a PNG *asynchronously*
 *      (off the main thread, so the browser stays responsive — see the
 *      code review discussion on toBlob vs toDataURL in codereview.md)
 *   3. A temporary <a> link is created, clicked, and cleaned up
 *   4. URL.revokeObjectURL frees the blob memory
 *
 * Why 3x scale instead of 2x?
 *   PNGs are the "share-friendly" format — they get viewed on phones with
 *   dense displays (2-3x pixel density) and users pinch-to-zoom. At 3x a
 *   600×425 CSS postcard becomes 1800×1275 real pixels, which stays sharp
 *   under zoom. PDFs don't need this because they print at fixed physical
 *   size — 2x is enough there.
 *
 * @param {HTMLElement} element - The DOM node to capture (the postcard wrapper)
 * @param {number} day - Day number for the filename
 * @param {string} firstName - Target's first name for the filename
 */
import html2canvas from 'html2canvas';

export async function exportPng(element, day, firstName) {
  if (!element) return;

  // scale: 3 renders at triple resolution for sharp phone display (1800×1275 px)
  // useCORS: true allows html2canvas to capture images from our own origin
  const canvas = await html2canvas(element, { scale: 3, useCORS: true });

  // toBlob is async (callback-based) because PNG encoding is CPU-intensive.
  // We wrap it in a Promise so we can await it cleanly.
  const blob = await new Promise((resolve) =>
    canvas.toBlob(resolve, 'image/png')
  );

  // Create a temporary object URL pointing to the blob in memory, attach
  // it to a throwaway <a> element, "click" it to trigger the download,
  // then clean up both the link and the URL.
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `slam-day-${day}-${firstName}.png`;
  a.click();

  // revokeObjectURL tells the browser "I'm done with this blob reference,
  // you can free the memory." Without this, every export would leak a
  // multi-megabyte PNG blob until the tab is closed — not a crash risk for
  // one or two, but bad hygiene that compounds if someone exports many.
  URL.revokeObjectURL(url);
}

/**
 * capturePngBlob — captures the postcard as a PNG Blob without downloading.
 *
 * Used by the Share button: it needs the blob to hand to navigator.share(),
 * not a file download. Separated from exportPng so the share path doesn't
 * have to trigger a download as a side effect.
 *
 * @param {HTMLElement} element - The DOM node to capture
 * @returns {Promise<Blob>} The PNG blob
 */
export async function capturePngBlob(element) {
  if (!element) return null;

  const canvas = await html2canvas(element, { scale: 3, useCORS: true });
  return new Promise((resolve) =>
    canvas.toBlob(resolve, 'image/png')
  );
}
