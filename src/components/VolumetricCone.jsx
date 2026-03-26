/**
 * VolumetricCone — full-screen visible light beam.
 *
 * Draws the spotlight's volumetric cone as a screen-space canvas
 * that fills the entire viewport, NOT clipped to the character card.
 * The character silhouette naturally occludes it via z-index layering.
 *
 * The cone matches the spotlight params: position, angle, penumbra.
 * Noise pattern for particulate/dust-in-air. Additive feel via
 * low opacity warm grey on the dark background.
 *
 * Only visible when spotActive is true (front character).
 */
import { useRef, useEffect } from 'react';

/**
 * Generate the cone texture on a canvas.
 * spotX/spotY are in normalized screen space (0-1).
 */
function drawCone(ctx, w, h, spotX, spotY, tgtX, tgtY, angle, penumbra, intensity) {
  ctx.clearRect(0, 0, w, h);

  // Spotlight origin in canvas coords
  const originX = spotX * w;
  const originY = spotY * h;

  // Target — where the spotlight aims (already normalized 0-1)
  const targetX = tgtX * w;
  const targetY = tgtY * h;

  // Direction from origin to target
  const dx = targetX - originX;
  const dy = targetY - originY;
  const dist = Math.sqrt(dx * dx + dy * dy);
  if (dist < 1) return;
  const dirX = dx / dist;
  const dirY = dy / dist;

  // Cone half-angle (widened slightly for volumetric feel)
  const halfAngle = angle * 1.3;

  const imageData = ctx.createImageData(w, h);
  const data = imageData.data;

  // Simple deterministic noise
  const noise = (x, y) => {
    const n = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
    return n - Math.floor(n);
  };

  const maxReach = Math.max(w, h) * 2;
  const coneAlpha = Math.min(1, intensity * 0.025);

  for (let py = 0; py < h; py++) {
    for (let px = 0; px < w; px++) {
      const vx = px - originX;
      const vy = py - originY;
      const vDist = Math.sqrt(vx * vx + vy * vy);

      if (vDist < 1) continue;

      // Angle between direction and pixel
      const dot = (vx * dirX + vy * dirY) / vDist;
      if (dot < 0) continue; // behind the light

      const pixelAngle = Math.acos(Math.max(-1, Math.min(1, dot)));
      if (pixelAngle > halfAngle) continue;

      // Penumbra falloff
      const edgeFactor = pixelAngle / halfAngle;
      let falloff;
      if (penumbra <= 0) {
        falloff = edgeFactor < 1 ? 1 : 0;
      } else {
        const penumbraStart = 1 - penumbra;
        falloff = edgeFactor < penumbraStart ? 1 : 1 - (edgeFactor - penumbraStart) / penumbra;
      }

      // Distance falloff
      const distFalloff = Math.max(0, 1 - (vDist / maxReach) * 0.5);

      let brightness = falloff * distFalloff * coneAlpha;

      // Noise for dust particulate
      const n = noise(px * 0.5, py * 0.5);
      brightness *= 0.5 + n * 0.5;

      // Warm grey
      const idx = (py * w + px) * 4;
      data[idx] = 200;
      data[idx + 1] = 191;
      data[idx + 2] = 176;
      data[idx + 3] = Math.round(brightness * 255);
    }
  }

  ctx.putImageData(imageData, 0, 0);
}

export default function VolumetricCone({ spotActive, spotPos = {} }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !spotActive) return;

    const ctx = canvas.getContext('2d');
    const rect = canvas.parentElement?.getBoundingClientRect();
    const w = Math.round((rect?.width || 430) * 0.5); // half-res for performance
    const h = Math.round((rect?.height || 932) * 0.5);
    canvas.width = w;
    canvas.height = h;

    const sx = spotPos.x ?? -0.5;
    const sy = spotPos.y ?? 1.0;
    const sAngle = spotPos.angle ?? 0.3;
    const sPenumbra = spotPos.penumbra ?? 0.5;
    const sIntensity = spotPos.intensity ?? 3.0;
    const sTgtX = spotPos.targetX ?? 0;
    const sTgtY = spotPos.targetY ?? 0.5;

    // Map Three.js spotlight coords to normalized screen coords (0-1)
    const normX = (sx + 2) / 4;
    const normY = 1 - (sy + 2) / 4;
    const normTgtX = (sTgtX + 2) / 4;
    const normTgtY = 1 - (sTgtY + 2) / 4;

    drawCone(ctx, w, h, normX, normY, normTgtX, normTgtY, sAngle, sPenumbra, sIntensity);
  }, [spotActive, spotPos.x, spotPos.y, spotPos.angle, spotPos.penumbra, spotPos.intensity, spotPos.targetX, spotPos.targetY]);

  if (!spotActive) return null;

  return (
    <canvas
      ref={canvasRef}
      className="volumetric-cone"
    />
  );
}
