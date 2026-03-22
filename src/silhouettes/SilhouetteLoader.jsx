/**
 * Silhouette Loader — auto-detects raster art or falls back to SVG.
 *
 * DROP-IN PIPELINE:
 * 1. Draw on the TEMPLATE.svg (print it, sketch, photograph)
 * 2. Remove white background → transparent PNG
 * 3. Save as: nosferatu.png, brujah.png, malkavian.png, gangrel.png, tremere.png
 * 4. Drop into src/silhouettes/art/
 * 5. This loader picks it up automatically. No other code changes needed.
 *
 * HOW IT WORKS:
 * Vite's import.meta.glob eagerly imports all PNGs in the art/ folder.
 * At render time, we check if a PNG exists for the clan ID.
 * If yes → render as <img> with the same positioning rules as SVG.
 * If no → render the fallback SVG component (Nosferatu placeholder).
 *
 * IMAGE REQUIREMENTS:
 * - Transparent PNG (no background)
 * - Aspect ratio: 1:2 (width:height) — matches the 200x400 viewBox
 * - Feet at the very bottom of the image (no padding below feet)
 * - Eye line at ~14% from top
 * - Any resolution works (600x1200 recommended for retina)
 * - Value range: dark figures (#1a-#3a body, #3a-#44 interior detail max)
 */

// Eagerly import all PNGs from the art folder
// Vite resolves these at build time — no runtime file system access needed
const artModules = import.meta.glob('./art/*.png', { eager: true, query: '?url', import: 'default' });

// Build a lookup: clan id → image URL
const artMap = {};
for (const [path, url] of Object.entries(artModules)) {
  // path looks like: "./art/nosferatu.png" → extract "nosferatu"
  const filename = path.split('/').pop().replace('.png', '').toLowerCase();
  artMap[filename] = url;
}

/**
 * Renders either a raster PNG (if art exists) or the fallback SVG component.
 *
 * @param {string} clanId — e.g. "nosferatu", "brujah"
 * @param {React.Component} FallbackSVG — SVG component to use if no PNG found
 * @param {object} style — passed through to the element
 */
export default function SilhouetteLoader({ clanId, FallbackSVG, style }) {
  const artUrl = artMap[clanId];

  if (artUrl) {
    // Raster art found — render as image
    return (
      <img
        src={artUrl}
        alt={clanId}
        className="silhouette-art"
        style={style}
        draggable={false}
      />
    );
  }

  // No art found — use SVG fallback
  return <FallbackSVG style={style} />;
}

/**
 * Check which clans have custom art (for debugging)
 */
export function getLoadedArt() {
  return { ...artMap };
}
