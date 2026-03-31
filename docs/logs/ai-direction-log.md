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

## Entry 16 — 2026-03-30
**Asked:** Candles feel weak — tips too small, light on the floor too dim. Punch them up.
**Produced:** Flame tips scaled 40% taller with wider Bézier control points. Gradient shifted from warm grey core to near-white (#ffffff) → warm gold (#fff0d0) → amber edge (#cc9850). Blur filter doubled (extra feMergeNode) for stronger glow halo, filter region expanded to 400%. Floor glow radial gradient opacity nearly doubled (0.35→0.55 active, 0.08→0.15 transitioning). Pentagram line gradients brightened at center. Flame flicker animation base opacity raised from 0.85 to 0.95.
**Decision:** All changes together. The candles are the only practical light source in the scene — they need to read as such.

## Entry 17 — 2026-03-30
**Asked:** Candle wax shafts are invisible — so dark they capture nothing. Need them visible as waxy white columns. Also need circles drawn on the floor around each candle to anchor them visually.
**Produced:** First pass: changed candle body fill from near-black (#1a1816) to waxy off-white (#b8b0a0), wax top to #cdc5b5. Added 12 subtle ring circles on the pentagram floor SVG at each candle anchor position (stroke rgba(180,175,160,0.2), strokeWidth 0.5). Rings tilt with the floor plane automatically since they're inside the pentagram SVG.
**Decision:** Visibility first — make them readable, then refine integration. The floor circles anchor the candles to the ground plane, solving the "floating in space" problem.

## Entry 18 — 2026-03-30
**Asked:** Updated Brujah normal map dropped via Discord — cleaner version with proper alpha transparency baked in.
**Produced:** Replaced `brujah-normal.png` (was 1440x2880 with stripped black bg) with new 800x1600 RGBA normal map that had transparency from the source. No processing needed.
**Decision:** Art swap only. Cleaner source = better result.

## Entry 19 — 2026-03-30
**Asked:** Candle wax columns are visible now but feel self-lit — they don't respond to the room lighting. Need them to gradate dark at the base to light at the top. They shouldn't be the hottest thing in the frame.
**Produced:** Replaced flat fill with per-candle SVG linearGradient: #1a1816 (base, near-black) → #3a3530 (40%) → #706858 (85%) → #8a8070 (top, muted warm). Wax top toned down from #cdc5b5 to #8a8070 to match gradient endpoint. The candles now darken into the floor shadow and only show wax color where the flame light would catch them.
**Decision:** The gradient sells the illusion that the flame is the light source for the wax itself. Bottom of candle = floor shadow zone. Top of candle = flame-lit zone. The candles are no longer competing with the characters for attention.

## Entry 20 — 2026-03-30
**Asked:** Add dark inner rim / cel-shader edge effect since we already have the outer glow. Dark on the inside of the edge.
**Produced:** Fresnel-like darkening in the character shader using normal map Z component. Where normals face away from camera (form edges), pixels darken. Two tuneable uniforms: rimDarkness (intensity) and rimWidth (narrow edge vs broad falloff). Dev sliders in Texture panel. Edge-guarded by alpha mask to avoid artifacts at the alpha boundary.
**Decision:** Pairs with existing outer glow — dark inside edge + bright outside edge = cel-shader read. Defaults to off until dialed per clan.

## Entry 21 — 2026-03-30
**Asked:** Save slot UX is backwards — tap loads (destructive), double-tap saves (unreliable on mobile). Need to fix.
**Produced:** Redesigned: tap = save (flashes green), long-press 500ms = load (flashes blue with ↓ arrow). Empty slots show dashed outline at 50% opacity.
**Decision:** Safe action = easy gesture. Destructive action = deliberate hold. Mobile-first UX principle.

## Entry 22 — 2026-03-30
**Asked:** Tremere art drop — diffuse + normal map. Last clan to get full art.
**Produced:** Tremere diffuse and normal map (1440x2880 RGBA with proper alpha) dropped into pipeline. All 5 clans now rendering via Three.js with normal maps. Zero SVG fallbacks remaining.
**Decision:** Milestone — full art pipeline complete. Every clan has diffuse + normal + ink normalization + soft-light tint + dark rim shader.

## Entry 23 — 2026-03-30
**Asked:** Crush blacks, spike whites. Background too light, background figures too visible with competing highlights, main character needs stronger directed light.
**Produced:** Background pushed to #030303. Background figure brightness crushed to 4-12% (was 15-47%). Three.js light intensity on non-active characters dropped to 0.15 (was 0.5-2.0). Front character fill boosted. Emissive reduced. All clan spotlights upgraded to strong key lights (intensity 8-9). Pentagram line gradients brightened at center.
**Decision:** Aggressive value contrast. Background figures are true silhouettes now — no specular, no normal detail, no competing light.

## Entry 24 — 2026-03-30
**Asked:** Set all clans to new defaults: tint white @ 0.7, normal 3.7, rough 0.55, rim darkness 0.6, width 0.12. Stomp local changes.
**Produced:** Updated all clan defaults in clans.js. Bumped settings version to auto-clear localStorage. Updated App.jsx initial state values to match.
**Decision:** Clean slate for fresh iteration with the new value contrast pass as baseline.

## Entry 25 — 2026-03-30
**Asked:** Fix the fuzzy halo around every character — looks like badly masked 2D stickers.
**Produced:** Five stacked fixes: (1) Disabled WebGL antialias — biggest offender, AA bled edge pixels. (2) Enabled premultipliedAlpha for correct compositing. (3) Switched transparent:true to transparent:false — pure alpha-test cutout. (4) alphaTest bumped 0.5→0.65 for sharper clip. (5) Rim shader edge guard via smoothstep on alpha.
**Decision:** All lighting now 100% inside Three.js shader. No CSS effects on figures. Razor-sharp silhouette edges.

## Entry 26 — 2026-03-30
**Asked:** Replace ritual circle with clan-colored graphic backdrop. Strong geometric frame behind main character. Align title to backdrop edge.
**Produced:** Tall vertical rectangle filled with clan accent color (from design-intent palette). Fades at top via gradient. Title and stats left-aligned to backdrop edge at 31% for strong vertical line. Clan accent colors added to clans.js.
**Decision:** The graphic backdrop introduces intentional color without relying on noisy lights. Title alignment creates invisible vertical axis through the composition. Later evolved into smoke columns (see Entry 30).

## Entry 27 — 2026-03-30
**Asked:** Make the floor pentagram lerp to clan color when switching characters. Lines and candle color should smoothly transition.
**Produced:** Computed lerpedAccent from prev/active clan accent colors. Applied to: pentagram line gradients, star gradient, fill gradient, candle flame gradients, floor glow (via CSS custom property + color-mix), candle floor circles, backdrop panel. All interpolate during 400ms carousel rotation.
**Decision:** The entire floor plane now shifts color identity per clan. The color story runs from pentagram → candles → smoke → all in accent.

## Entry 28 — 2026-03-30
**Asked:** Brujah renders with random holes — lighting breaks through the figure.
**Produced:** Root cause: the threshold-based background strip (RGB ≤ 15 → transparent) had punched ~15,700 holes in the figure's dark areas (jacket shadows, dark ink). Fixed by using the Brujah normal map's alpha channel as the mask instead — the normal had proper transparency from source. Interior holes dropped from 15,700 to 587.
**Decision:** Normal map alpha is the authoritative figure boundary. Threshold stripping is lossy for dark artwork.

## Entry 29 — 2026-03-30
**Asked:** Lock all 5 clan lighting presets from on-device tuning sessions.
**Produced:** Each clan received individually tuned presets via Copy→paste JSON workflow:
- Nosferatu: Green key from right, lavender tint, rim 0.88
- Brujah: Orange underlight, mint tint 0.9, ink 0.95, wide rim 0.3
- Malkavian: Violet key, zero roughness, heavy ink 0.83, pink tint
- Gangrel: Gold key from right-low, lavender tint 0.88
- Tremere: Pure red key from left, normal 4.9, heavy ink 0.87
**Decision:** Mobile-first tuning → Copy JSON → paste to Claude → lock in source. Pipeline proven for per-clan iteration.

## Entry 30 — 2026-03-30
**Asked:** Kill the outer glow halo, fix flashlight lighting, rescue lower body, unify floor and banner.
**Produced:** Four-step art direction pass:
1. Removed CSS drop-shadow rim light entirely — Pass 1 holdover creating sticker-cutout halos.
2. Split each clan's single colored spotlight into neutral white key (front, shows detail) + clan-colored rim (behind, catches edges). All 5 clans restructured.
3. Added low fill point light (#998888, y=-0.8) to rescue boots/legs from black void. Front character only.
4. Tried full graphic poster (hide floor elements) → too flat, lost 3D magic → restored floor elements on top of banner → final: replaced banner with clan-colored smoke columns rising from candles + pentagram circle filled with accent color. Living atmospheric color replaces static rectangle.
**Decision:** The smoke columns are the synthesis — they carry clan color from the ritual floor upward through the frame as living atmosphere, maintaining both the 3D depth and the graphic color identity. Key+rim split preserves normal map detail while introducing clan color at the edges only.

## Entry 31 — 2026-03-31
**Asked:** Rotation lagging on mobile — not smooth. Need 30fps or better.
**Produced:** Two-round perf pass:
Round 1: Removed blur(8px) filter from 36 smoke columns (#1 GPU killer). Batched all getBoundingClientRect calls together before state updates. Capped background character WebGL renders at 5fps. Added will-change hints on flame/smoke elements.
Round 2: Trimmed candles from 12 to 8. Smoke columns from 3 to 2 per candle (16 total, was 36). Throttled rAF loop to 30fps (33ms intervals). Added CSS contain on candle slots.
**Decision:** Total animated elements during rotation cut from 52+ to 24. DOM reads per transition halved. Blur filter removal was the single biggest win — mobile GPUs can't handle blur on dozens of animated elements.

## Entry 32 — 2026-03-31
**Asked:** Floor dots should glow clan color. Background characters need more visibility.
**Produced:** Pentagram anchor dots now fill with lerpedAccent, inactive dots visible at 15% opacity (were hidden). Background character CSS brightness bumped from 4-12% to 7-17%. Three.js light intensity for bg characters decoupled from per-clan lightScale (was being crushed by low values like Tremere's 0.3). Fixed at 0.6-1.0 depth-scaled.
**Decision:** Background characters must be readable as characters for the carousel to have visual purpose. Their lighting is now independent of the active clan's tuning.

## Entry 33 — 2026-03-31
**Asked:** UX polish — slower transition, move title off character face, add tap signifier for details, improve text hierarchy.
**Produced:** Rotation slowed 20% then another 15% (400ms→480ms→552ms total). Title moved from 31% back to 5% (left edge). Clan-colored pulsing dot + "Details" label added below clan name — disappears when stats open. Stats text hierarchy improved: epithet 14-18px, labels switched to Inter 700, disciplines 14-17px.
**Decision:** Title must never overlap the character's face. The tap signifier uses clan accent color (single source) and pulses gently to draw attention without being obnoxious.

## Entry 34 — 2026-03-31
**Asked:** Pentagram lines should glow with clan color, subtly pulsing. Slow rotation 15% more. Background characters still not visible enough.
**Produced:** Pentagram pulse animation now includes brightness (0.8→1.3) alongside opacity. Rotation slowed to 552ms. Background character light intensity fixed — no longer scaled by per-clan lightScale. Added Reset (Dflt) button to dev panel that loads clans.js source defaults into sliders and clears active slot.
**Decision:** The Reset button completes the tuning pipeline: tweak → compare → Dflt to undo → tweak again → Copy when happy.

## Entry 35 — 2026-03-31
**Asked:** Color wheel on mobile is broken — native picker doesn't remember last color, requires navigating OS picker each time.
**Produced:** Custom inline HSL ColorWheel component. Hue ring (drag outer) + saturation/brightness square (drag inner). Updates renderer live during drag. Saves last-used color to localStorage per field on pointer release. Replaced both spot and tint native color pickers.
**Decision:** Mobile-first color picking. No OS picker navigation, no lost state. The wheel stays inline in the panel and remembers its position.

## Entry 36 — 2026-03-31
**Asked:** Continued lighting tuning across all clans. Nosferatu needed more green integration. Brujah, Malkavian, Gangrel all re-tuned.
**Produced:** Updated presets via Copy→paste pipeline:
- Nosferatu: Key to soft green (#9ae391)
- Brujah: Key to deep indigo (#331c87), razor tight beam (0.05 angle, 0 penumbra), lightScale 0.2
- Malkavian: Key to magenta (#ff00ff), tight penumbra 0.3, lightScale 0.9
- Gangrel: Key to cool blue (#6082e6), contrasting warm gold rim
**Decision:** Each clan's key light now carries intentional color — moving away from pure neutral keys toward clan-specific character lighting. The rim still provides the accent color edge.

---

*New entries are added as work continues. Each entry follows the Asked/Produced/Decision format.*
