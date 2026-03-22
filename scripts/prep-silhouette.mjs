#!/usr/bin/env node
/**
 * prep-silhouette — Convert a sketch on white paper to a transparent PNG.
 *
 * Usage:
 *   node scripts/prep-silhouette.mjs <input> <clanId>
 *
 * Examples:
 *   node scripts/prep-silhouette.mjs photo.jpg nosferatu
 *   node scripts/prep-silhouette.mjs sketch.png brujah
 *
 * What it does:
 *   1. Loads your image (any format: jpg, png, webp, etc.)
 *   2. Converts white/light areas → transparent
 *   3. Keeps dark areas as your figure (preserves value range)
 *   4. Resizes to 600x1200 (1:2 aspect, retina-ready)
 *   5. Saves to src/silhouettes/art/<clanId>.png
 *
 * Options:
 *   --threshold=N   Brightness cutoff (0-255). Pixels brighter than this
 *                   become transparent. Default: 200
 *   --softness=N    Edge softness range (0-100). Pixels within this range
 *                   of the threshold get partial transparency. Default: 40
 *   --no-resize     Skip the resize step (keep original dimensions)
 *   --invert        If your sketch is light-on-dark instead of dark-on-light
 */

import sharp from 'sharp';
import { resolve, basename } from 'path';
import { existsSync } from 'fs';

// ---- Parse args ----
const args = process.argv.slice(2);
const flags = {};
const positional = [];

for (const arg of args) {
  if (arg.startsWith('--')) {
    const [key, val] = arg.slice(2).split('=');
    flags[key] = val ?? true;
  } else {
    positional.push(arg);
  }
}

const inputPath = positional[0];
const clanId = positional[1];

if (!inputPath || !clanId) {
  console.error(`
  Usage: node scripts/prep-silhouette.mjs <input-image> <clan-id>

  Clan IDs: nosferatu, brujah, malkavian, gangrel, tremere

  Options:
    --threshold=200   Brightness cutoff (0-255, default 200)
    --softness=40     Edge blend range (0-100, default 40)
    --no-resize       Keep original dimensions
    --invert          For light-on-dark sketches
  `);
  process.exit(1);
}

const VALID_CLANS = ['nosferatu', 'brujah', 'malkavian', 'gangrel', 'tremere'];
if (!VALID_CLANS.includes(clanId.toLowerCase())) {
  console.error(`Invalid clan ID: "${clanId}"`);
  console.error(`Valid IDs: ${VALID_CLANS.join(', ')}`);
  process.exit(1);
}

if (!existsSync(inputPath)) {
  console.error(`File not found: ${inputPath}`);
  process.exit(1);
}

const threshold = parseInt(flags.threshold ?? '200', 10);
const softness = parseInt(flags.softness ?? '40', 10);
const doResize = flags['no-resize'] !== true;
const invert = flags.invert === true;

const OUTPUT_W = 600;
const OUTPUT_H = 1200;
const outputPath = resolve('src/silhouettes/art', `${clanId.toLowerCase()}.png`);

console.log(`\n  Input:     ${inputPath}`);
console.log(`  Clan:      ${clanId}`);
console.log(`  Threshold: ${threshold} (softness: ${softness})`);
console.log(`  Resize:    ${doResize ? `${OUTPUT_W}x${OUTPUT_H}` : 'no'}`);
console.log(`  Output:    ${outputPath}\n`);

// ---- Process ----
try {
  // Load and get raw pixel data
  let pipeline = sharp(inputPath).ensureAlpha();

  // Get metadata for logging
  const meta = await pipeline.metadata();
  console.log(`  Source: ${meta.width}x${meta.height} ${meta.format}`);

  // Convert to raw RGBA
  const { data, info } = await pipeline
    .raw()
    .toBuffer({ resolveWithObject: true });

  const pixels = data;
  const { width, height, channels } = info;

  // Process each pixel: convert light areas to transparent
  for (let i = 0; i < pixels.length; i += channels) {
    let r = pixels[i];
    let g = pixels[i + 1];
    let b = pixels[i + 2];
    // alpha is pixels[i + 3]

    // Perceived brightness (luminance)
    const brightness = 0.299 * r + 0.587 * g + 0.114 * b;

    let alpha;
    if (invert) {
      // Light-on-dark: bright = figure, dark = background
      if (brightness < threshold - softness) {
        alpha = 0; // dark = transparent
      } else if (brightness > threshold) {
        alpha = 255; // bright = opaque
      } else {
        alpha = Math.round(255 * (brightness - (threshold - softness)) / softness);
      }
    } else {
      // Dark-on-light (default): dark = figure, light = background
      if (brightness > threshold) {
        alpha = 0; // light = transparent
      } else if (brightness < threshold - softness) {
        alpha = 255; // dark = opaque
      } else {
        alpha = Math.round(255 * (threshold - brightness) / softness);
      }
    }

    pixels[i + 3] = alpha;
  }

  // Rebuild image from processed pixels
  let output = sharp(pixels, {
    raw: { width, height, channels }
  });

  // Resize to template dimensions
  if (doResize) {
    output = output.resize(OUTPUT_W, OUTPUT_H, {
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 0 },
      position: 'bottom', // feet anchored to bottom
    });
  }

  // Save
  await output.png().toFile(outputPath);

  console.log(`  Done! Saved to ${outputPath}`);
  console.log(`  The app will pick it up automatically via HMR.\n`);
} catch (err) {
  console.error(`  Error: ${err.message}`);
  process.exit(1);
}
