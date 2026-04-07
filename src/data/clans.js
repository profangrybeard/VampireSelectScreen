/**
 * Clan data — identity, stats, and per-clan lighting presets.
 *
 * Each clan gets up to 3 spotlights for a key/fill/accent rig.
 * The active character uses these; background characters get none.
 * Lighting values are tuned via the Dev panel, then saved here.
 *
 * Lighting strategy (key + rim):
 *   Spot 1 — Key light: neutral white/grey, front-facing. Shows
 *            normal map detail (wrinkles, belts, jewelry) with
 *            pure value contrast.
 *   Spot 2 — Rim light: clan accent color, from behind/above.
 *            Catches edges with a brilliant colored highlight that
 *            ties the character to their clan identity without
 *            washing out the front detail.
 *
 * Spotlight shape:
 *   { x, y, z, targetX, targetY, intensity, angle, penumbra }
 *
 * Eye glow:
 *   eyes: [{ x, y }, { x, y }] — UV coords (0,0 = bottom-left)
 *   Positioned via dev panel, then locked here.
 */

const CLANS = [
  {
    id: "nosferatu",
    name: "Nosferatu",
    epithet: "We see everything. That is our curse.",
    archetype: "The Monster",
    disciplines: ["Obfuscate", "Potence", "Animalism"],
    humanity: 2,
    accent: '#2d4a1e',
    eyes: [{ x: 0.475, y: 0.85 }, { x: 0.565, y: 0.85 }],
    lighting: {
      normalScale: 3.7,
      roughness: 0.55,
      lightScale: 3.6,
      breathScale: 0.5,
      tint: { color: '#9aff8f', opacity: 0.08 },
      rimDarkness: 0.54,
      rimWidth: 0.44,
      lineWeight: 0.5,
      lineSmooth: 0.15,
      spots: [
        // Key: magenta from right
        { x: 2, y: 1.3, z: 0, targetX: -0.45, targetY: 0.4, intensity: 10, angle: 0.1, penumbra: 0.25, color: '#f894ff' },
        // Rim: toxic green from behind-above
        { x: -1.5, y: 2.0, z: -1.5, targetX: 0, targetY: 0.5, intensity: 6.0, angle: 0.35, penumbra: 0.6, color: '#bbffad' },
      ],
    },
  },
  {
    id: "brujah",
    name: "Brujah",
    epithet: "History remembers the ones who fought.",
    archetype: "The Rebel",
    disciplines: ["Celerity", "Potence", "Presence"],
    humanity: 4,
    accent: '#8b3a0f',
    eyes: [{ x: 0.48, y: 0.855 }, { x: 0.565, y: 0.855 }],
    lighting: {
      normalScale: 3.7,
      roughness: 0.6,
      lightScale: 2.2,
      breathScale: 2.8,
      tint: { color: '#ffffff', opacity: 0.96 },
      rimDarkness: 0.88,
      rimWidth: 0.3,
      lineWeight: 0.95,
      lineSmooth: 0.12,
      spots: [
        // Key: deep indigo from right-high, razor tight beam
        { x: 2, y: 3.8, z: 0, targetX: -0.5, targetY: -1, intensity: 10, angle: 0.05, penumbra: 0, color: '#1b00e6' },
        // Rim: hot orange from behind-right
        { x: 1.5, y: 1.5, z: -1.5, targetX: 0, targetY: 0.4, intensity: 6.0, angle: 0.3, penumbra: 0.5, color: '#ff6600' },
      ],
    },
  },
  {
    id: "malkavian",
    name: "Malkavian",
    epithet: "The truth was always there. You just couldn't hear it.",
    archetype: "The Visionary",
    disciplines: ["Auspex", "Dominate", "Obfuscate"],
    humanity: 5,
    accent: '#4a2d6b',
    eyes: [{ x: 0.45, y: 0.805 }, { x: 0.5, y: 0.805 }],
    lighting: {
      normalScale: 2.4,
      roughness: 0,
      lightScale: 3.5,
      breathScale: 4.0,
      tint: { color: '#fff5f8', opacity: 0.92 },
      rimDarkness: 0.88,
      rimWidth: 0.12,
      lineWeight: 0.83,
      lineSmooth: 0.11,
      spots: [
        // Key: magenta, tight penumbra, aimed right-high
        { x: 1.5, y: 2, z: 1.2, targetX: 1, targetY: 0.05, intensity: 10, angle: 0.45, penumbra: 0.3, color: '#ff00ff' },
        // Rim: fractured violet from behind-left
        { x: -1.8, y: 1.8, z: -1.5, targetX: 0, targetY: 0.5, intensity: 7.0, angle: 0.35, penumbra: 0.5, color: '#c966ff' },
      ],
    },
  },
  {
    id: "gangrel",
    name: "Gangrel",
    epithet: "The city is a cage. The wild is honest.",
    archetype: "The Beast",
    disciplines: ["Animalism", "Fortitude", "Protean"],
    humanity: 2,
    accent: '#5a3e1b',
    eyes: [{ x: 0.59, y: 0.785 }, { x: 0.66, y: 0.785 }],
    lighting: {
      normalScale: 3.7,
      roughness: 0.55,
      lightScale: 1.8,
      breathScale: 1.6,
      tint: { color: '#ebebff', opacity: 1 },
      rimDarkness: 0.88,
      rimWidth: 0.12,
      lineWeight: 0.5,
      lineSmooth: 0.19,
      spots: [
        // Key: warm peach from right-low
        { x: 2, y: -0.9, z: 0, targetX: -0.05, targetY: 0.4, intensity: 10, angle: 0.1, penumbra: 1, color: '#ffbb80' },
        // Rim: warm gold from behind-left
        { x: -1.5, y: 1.5, z: -1.5, targetX: 0, targetY: 0.4, intensity: 6.0, angle: 0.3, penumbra: 0.5, color: '#f4be62' },
      ],
    },
  },
  {
    id: "tremere",
    name: "Tremere",
    epithet: "Knowledge is the only power that compounds.",
    archetype: "The Sorcerer",
    disciplines: ["Auspex", "Dominate", "Thaumaturgy"],
    humanity: 6,
    accent: '#6b1a1a',
    eyes: [{ x: 0.515, y: 0.83 }, { x: 0.58, y: 0.83 }],
    lighting: {
      normalScale: 4.9,
      roughness: 0.4,
      lightScale: 1.5,
      breathScale: 2.4,
      tint: { color: '#e5c7ff', opacity: 1 },
      rimDarkness: 0.8,
      rimWidth: 0.12,
      lineWeight: 0.87,
      lineSmooth: 0.29,
      spots: [
        // Key: neutral white from left
        { x: -1, y: 1.1, z: 0.7, targetX: 0.5, targetY: 0.7, intensity: 10, angle: 0.65, penumbra: 0.3, color: '#d4d0cc' },
        // Rim: blood red from behind-right
        { x: 1.5, y: 2.0, z: -1.5, targetX: 0, targetY: 0.5, intensity: 7.0, angle: 0.35, penumbra: 0.5, color: '#ff0000' },
      ],
    },
  },
];

export default CLANS;
