/**
 * Silhouette Loader — routes to Three.js lit sprite or SVG fallback.
 *
 * PIPELINE:
 * 1. Check for raster art in src/silhouettes/art/
 * 2. If PNG exists → render via LitSprite (Three.js with normal map support)
 * 3. If no PNG → render the fallback SVG component
 *
 * DROP-IN WORKFLOW:
 * - Draw/paint/photograph your silhouette
 * - Save as: nosferatu.png (800x1600, transparent, 1:2 aspect)
 * - Optionally add: nosferatu-normal.png (same size, normal map)
 * - Drop into src/silhouettes/art/
 * - This loader picks it up automatically. No other code changes needed.
 *
 * IMAGE REQUIREMENTS:
 * - Transparent PNG (no background)
 * - Aspect ratio: 1:2 (width:height) — matches the 200x400 viewBox
 * - Feet at the very bottom of the image (no padding below feet)
 * - Eye line at ~14% from top
 * - Any resolution works (800x1600 recommended for retina)
 */
import LitSprite from '../components/LitSprite.jsx';

// Eagerly import all PNGs from the art folder
const artModules = import.meta.glob('./art/*.png', { eager: true, query: '?url', import: 'default' });

// Build lookups: clan id → diffuse URL, clan id → normal URL
const diffuseMap = {};
const normalMap = {};
for (const [path, url] of Object.entries(artModules)) {
  const filename = path.split('/').pop().replace('.png', '').toLowerCase();
  if (filename.endsWith('-normal')) {
    const clanId = filename.replace('-normal', '');
    normalMap[clanId] = url;
  } else {
    diffuseMap[filename] = url;
  }
}

/**
 * Renders either a Three.js lit sprite (if art exists) or the fallback SVG.
 *
 * @param {string} clanId — e.g. "nosferatu", "brujah"
 * @param {React.Component} FallbackSVG — SVG component to use if no PNG found
 * @param {object} lightDir — { x, y, z } light direction for Three.js
 * @param {number} lightIntensity — point light intensity
 * @param {object} style — passed through to the element
 */
export default function SilhouetteLoader({ clanId, FallbackSVG, lightDir, lightIntensity, normalScale, roughness, spotActive, spotPos, tint, lineWeight, lineSmooth, rimDarkness, rimWidth, style }) {
  const diffuseUrl = diffuseMap[clanId];
  const normalUrl = normalMap[clanId] || null;

  if (diffuseUrl) {
    return (
      <LitSprite
        diffuseUrl={diffuseUrl}
        normalUrl={normalUrl}
        lightDir={lightDir || { x: 0, y: -1, z: 0.5 }}
        lightIntensity={lightIntensity || 2.5}
        normalScale={normalScale || 1.5}
        roughness={roughness || 0.4}
        spotActive={spotActive || false}
        spotPos={spotPos || {}}
        tint={tint || {}}
        lineWeight={lineWeight ?? 0.5}
        lineSmooth={lineSmooth ?? 0.15}
        rimDarkness={rimDarkness ?? 0.0}
        rimWidth={rimWidth ?? 0.5}
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
  return { diffuse: { ...diffuseMap }, normals: { ...normalMap } };
}
