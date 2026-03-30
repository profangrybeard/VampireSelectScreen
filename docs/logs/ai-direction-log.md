# AI Direction Log

**Project:** Vampire Clan Select Screen — AI 201 Instructor Demo
**Purpose:** Document every significant AI interaction — what was asked, what was produced, what was decided.

---

## Entry 1 — 2026-03-22
**Asked:** Build a Nosferatu silhouette SVG and pentagram floor graphic with carousel rotation. Start with one silhouette at all 5 points to test the system.
**Produced:** Symmetrical vampire silhouette (wrong for Nosferatu), pentagram with 3D perspective tilt, tap-to-rotate carousel, anchor dots at pentagram tips.
**Decision:** Stopped art-directing the silhouette — adopted a generic placeholder shape. Prioritized the carousel system over silhouette fidelity. Pass 1 is about the system, not the art.

## Entry 2 — 2026-03-22
**Asked:** Anchor silhouettes to pentagram dots so they rotate together as one system. Fix feet-on-dot alignment.
**Produced:** Initially: two independent motion systems (CSS transitions for star, JS-calculated positions for silhouettes) that moved at different rates and paths. Feet floated 10% above dots for 6 iterations while AI reported "gap: 0%."
**Decision:** Rejected the dual-system approach. Demanded architectural redesign: one motion system where the pentagram CSS transition drives everything and silhouettes track dot positions via requestAnimationFrame. Fixed the foot gap by discovering `preserveAspectRatio` default was centering SVG content above the anchor point. (See R-004, R-005 in resistance log.)

## Entry 3 — 2026-03-22
**Asked:** Establish low camera angle with summoning circle floor. Front character dominant, back characters smaller and darker. Brightness and scale interpolation with depth.
**Produced:** Multiple iterations of tilt angle (35deg → 85deg → 75deg), perspective tuning, and container positioning. Initial "flatten" interpretation was backwards (made the floor look like a wall). depthNorm range was stale after layout changes, making brightness/z-index controls ineffective.
**Decision:** Settled on 75deg tilt, front scale 1.4x, back scale 0.625x, brightness range 80%-32%. Z-index layering puts clan title between front and back silhouettes for depth. Visual reference (Saving Private Ryan low-angle shot, character carousel GIF) resolved the perspective miscommunication. (See R-006, R-007 in resistance log.)

## Entry 4 — 2026-03-24
**Asked:** Add a central light source at the pentagram center with directional per-slot rim lighting via CSS drop-shadow.
**Produced:** Floor-level glow element, per-slot drop-shadow computed from light-to-silhouette angle. Initial implementation had shadow direction inverted (glow on wrong edges). Six iterations of lighting adjustments: too much blur (halo instead of rim), back characters too bright (reflective ghosts), wrong light direction.
**Decision:** Reversed shadow vector so glow appears on light-facing edges. Tightened rim (blur 11px→3px). Darkened back characters (32%→18% brightness). Warm grey color (rgba 180,170,155) instead of pure white. (See R-008, R-009 in resistance log.)

## Entry 5 — 2026-03-24
**Asked:** Add candle cluster at pentagram center as the visible light source. Candles should stand vertically, create parallax on rotation.
**Produced:** Initially placed candles inside the pentagram SVG (tilted with floor). Professor redirected: candles must stand vertical and parallax independently. Rebuilt as screen-space elements with invisible anchor dots on the pentagram floor tracked via rAF. 12 candles, varying heights, staggered flicker animation.
**Decision:** Candles separated from floor SVG. Same one-motion-system architecture — anchors on the floor, candles track them but stand upright. Natural parallax from 3D projection differences.

## Entry 6 — 2026-03-25/26
**Asked:** SVG silhouette iteration isn't working — switch to PNG cards with Three.js normal map lighting.
**Produced:** LitSprite component with MeshStandardMaterial, SilhouetteLoader auto-detection of PNG/normal map files. Initial implementation had critical transparency bug: used `alphaMap` (reads greyscale for opacity) instead of `map` (reads alpha channel). Character was translucent — candles visible through her body.
**Decision:** Switched from `alphaMap` to `map` for proper alpha channel handling. Adopted normal-first workflow: diffuse darkened by material.color, all visible detail from normal map + lighting. (See R-010 in resistance log.)

## Entry 7 — 2026-03-26
**Asked:** Add film noir spotlight with per-character positioning, volumetric light cone, and dev controls for live tuning.
**Produced:** SpotLight with movable target, VolumetricCone component (procedural canvas texture with noise). Initially clipped cone to character card — professor redirected to full-screen element. Dev sliders for all parameters. Per-clan lighting presets stored in clan data.
**Decision:** Cone moved to screen-space (edge to edge). Up to 3 spotlights per character (key/fill/accent rig). Nosferatu lighting locked from tuning session. Pipeline checkpoint reached.

## Entry 8 — 2026-03-27
**Asked:** Add spotlight color picker for showing off to peers. Then add an additive color tint layer (like Linear Dodge in Photoshop) for the character texture. Split the dev panel into Light and Texture controls — it was getting too big.
**Produced:** Color picker wired to both the Three.js SpotLight and the volumetric cone simultaneously. Additive tint implemented as a second Three.js plane with AdditiveBlending, masked to the figure alpha. Dev panel split into "Light" (left) and "Tex" (right) with separate toggle buttons.
**Decision:** Tint defaults to opacity 0 (invisible until dialed up). Default color set to Nosferatu toxic green from the design intent palette. Pipeline is now proven for per-clan color work when we enter Pass 2.

## Entry 9 — 2026-03-27
**Asked:** Add Save/Load/Copy for dev settings so the professor can iterate on mobile, persist values across refreshes, and paste JSON to Discord for code integration.
**Produced:** Save button (localStorage), auto-load on mount, Copy button (clipboard JSON). Both flash green on tap for confirmation.
**Decision:** Workflow locked: dial on phone → Save → Copy → paste JSON → values go into clans.js.

## Entry 10 — 2026-03-28
**Asked:** Drop in Malkavian art (diffuse + normal map). First pass had oversized normal map and framing issues. Second pass delivered at spec (800x1600, alpha, feet on floor).
**Produced:** Malkavian renders through the same Three.js pipeline as Nosferatu. Auto-detected by SilhouetteLoader. Two characters now proven in the pipeline.
**Decision:** Checkpoint. Two clans rendering with normal map lighting, spotlight, and volumetric cone. Pipeline is repeatable — art drop-in requires zero code changes.

## Entry 11 — 2026-03-29
**Asked:** Updated Gangrel diffuse and normal map dropped via Discord. Replace existing art.
**Produced:** New Gangrel_BC.png and Gangrel_N.png swapped into `src/silhouettes/art/`. Same pipeline — SilhouetteLoader auto-detects, zero code changes.
**Decision:** Art swap only. Build, deploy, verify under Three.js lighting on live page.

## Entry 12 — 2026-03-29
**Asked:** Line weights vary across clan sketches (Nosferatu fine crosshatch, Malkavian heavy ink, Gangrel bold lines). Need a shader to unify them.
**Produced:** Ink normalization shader injected via `onBeforeCompile` on MeshStandardMaterial. Converts diffuse RGB to luminance, runs through `smoothstep` threshold to force consistent line weight. Two uniforms: `uLineWeight` (threshold center) and `uLineSmooth` (transition width). Alpha preserved — figure shape untouched. Dev sliders added to Texture panel ("INK" section). Values persist through save/load/copy pipeline.
**Decision:** Shader approach keeps MeshStandardMaterial lighting intact. Tunable per-clan — each sketch can be dialed to match. Default 0.50 weight / 0.15 smooth as starting point.

## Entry 13 — 2026-03-29
**Asked:** New Brujah diffuse and normal map dropped in Discord. Wire them into the project.
**Produced:** Brujah diffuse (`brujah.png`) and normal map (`brujah-normal.png`) copied into `src/silhouettes/art/`. Same drop-in pipeline — SilhouetteLoader auto-detects, zero code changes. Posture nails the archetype: wide stance, squared shoulders, anarchy symbol in hand.
**Decision:** Art swap only. Brujah now upgrades from SVG fallback to Three.js lit rendering automatically.

## Entry 14 — 2026-03-29
**Asked:** Add wispy incense-like smoke trails rising from candles — animating upward, shrinking as they rise, swaying with wind. Needed now as a compositional element to pop the front character off the midground, not just juice.
**Produced:** 3 CSS-animated smoke wisps per candle (36 total). Each wisp is a small blurred circle that rises, sways laterally, fades out, and shrinks. Staggered durations (3.2–4.0s) and negative delays so they don't pulse in sync. Monochrome grey — Pass 1 safe. Pure CSS, no JS animation overhead.
**Decision:** Accepted Pass 5 element early because it serves a compositional purpose (depth separation), not just decoration. The smoke creates a visual layer between candles and the front silhouette.

## Entry 15 — 2026-03-30
**Asked:** Color overlay slider feels dead below 0.5 then ramps hard to 1. It also crushes normals — the tint flattens all the normal map lighting detail. Investigate different color modes or blend methods that preserve normal lighting but give usable hue.
**Produced:** Replaced the separate additive tint plane (MeshBasicMaterial with AdditiveBlending) with a soft-light blend injected directly into the character's MeshStandardMaterial fragment shader. The blend runs post-lighting via `#include <dithering_fragment>` replacement, so it operates on the fully lit result. Soft-light (Photoshop formula) preserves darks and lights while shifting midtones toward the tint color. Removed the tint plane geometry entirely — tint is now two uniforms (uTintColor, uTintOpacity) on the character material.
**Decision:** Soft-light blend chosen over alternatives: additive was the problem (dead zone + normal crush), multiply would darken too aggressively in an already dark scene, overlay would blow out highlights. Soft-light is the gentlest option that still reads as color in low-key lighting. The slider should now respond linearly across the full 0-1 range.

---

*New entries are added as work continues. Each entry follows the Asked/Produced/Decision format.*
