/**
 * Clan data — identity, stats, and per-clan lighting presets.
 *
 * Each clan gets up to 3 spotlights for a key/fill/accent rig.
 * The active character uses these; background characters get none.
 * Lighting values are tuned via the Dev panel, then saved here.
 *
 * Spotlight shape:
 *   { x, y, z, targetX, targetY, intensity, angle, penumbra }
 */

const CLANS = [
  {
    id: "nosferatu",
    name: "Nosferatu",
    epithet: "We see everything. That is our curse.",
    archetype: "The Monster",
    disciplines: ["Obfuscate", "Potence", "Animalism"],
    humanity: 2,
    lighting: {
      normalScale: 1.1,
      roughness: 0.40,
      lightScale: 1.0,
      spots: [
        // Key — steep diagonal from upper left
        { x: -2.0, y: 1.5, z: 1.0, targetX: 0, targetY: 0.5, intensity: 5.0, angle: 0.10, penumbra: 0.75 },
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
    lighting: {
      normalScale: 1.5,
      roughness: 0.4,
      lightScale: 1.0,
      spots: [
        { x: -1.5, y: 1.0, z: 1.5, targetX: 0, targetY: 0.5, intensity: 3.0, angle: 0.3, penumbra: 0.5 },
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
    lighting: {
      normalScale: 1.5,
      roughness: 0.4,
      lightScale: 1.0,
      spots: [
        { x: -1.5, y: 1.0, z: 1.5, targetX: 0, targetY: 0.5, intensity: 3.0, angle: 0.3, penumbra: 0.5 },
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
    lighting: {
      normalScale: 1.5,
      roughness: 0.4,
      lightScale: 1.0,
      spots: [
        { x: -1.5, y: 1.0, z: 1.5, targetX: 0, targetY: 0.5, intensity: 3.0, angle: 0.3, penumbra: 0.5 },
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
    lighting: {
      normalScale: 1.5,
      roughness: 0.4,
      lightScale: 1.0,
      spots: [
        { x: -1.5, y: 1.0, z: 1.5, targetX: 0, targetY: 0.5, intensity: 3.0, angle: 0.3, penumbra: 0.5 },
      ],
    },
  },
];

export default CLANS;
