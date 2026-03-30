# Resistance Log — Raw Tracking

**Purpose:** Capture every moment of creative pushback during AI-assisted development — in real time, before polishing for the README. Each entry documents the full arc: what led to the moment, what AI proposed, what the human decided, what actually shipped, and what we learned.

**This feeds into:** README.md "Records of Resistance" (polished entries) and the Five Questions Reflection.

---

## How to Read These Entries

Each resistance moment follows this structure:

- **Lead-Up:** What we were trying to accomplish. The context.
- **AI Direction:** What the AI produced or proposed.
- **The Pushback:** What the human rejected, revised, or redirected — and why.
- **Resolution:** What was actually done instead.
- **Result:** What shipped. Did it work? Did it hold?
- **Iteration Feedback:** What this taught us about working with AI on this project. What to repeat, what to avoid.

---

## Log

*(Entries will be added as we work through Pass 1 and beyond.)*

### R-001 — Nosferatu Silhouette Posture (2026-03-22)
**Lead-Up:** First silhouette build for Pass 1. The brief specifies Nosferatu as "hunched, clawed, one hand extended forward — predatory, lurking. You'd cross the street." This is the single most important visual element — the non-negotiable says if you cover the title and can't tell the archetype, the silhouette failed.

**AI Direction:** Claude produced a hand-built SVG path that came out symmetrical — arms spread wide to both sides, body relatively upright, bat-like ears. Reads more like a theatrical curtain-call pose or a caped vampire spreading wings. Not wrong as a "vampire shape," but wrong for Nosferatu specifically. Too composed. Too symmetrical. Too proud. Nosferatu doesn't announce — Nosferatu lurks.

**The Pushback:** The AI self-flagged this before the human needed to. The posture test from the design intent ("cover the title — can you tell which clan it is?") immediately reveals the problem: this silhouette could be any clan. There's nothing hunched, nothing predatory, nothing that makes you want to cross the street. The symmetry is the core issue — a lurking predator is never balanced.

**Resolution:** Reworking the SVG with asymmetric posture: spine curved forward, one arm extended with clawed fingers reaching toward the viewer, other arm pulled back. Weight shifted forward. Head dropped below shoulder line. The figure should feel like it's about to move toward you, not posing for you.

**Result:** The AI self-corrected before the human intervened, but the user then redirected entirely: stop art-directing the silhouette, focus on the carousel system. The posture question was deferred — a generic placeholder silhouette was adopted instead. The Nosferatu-specific posture will be addressed when we build the actual clan art, not during system prototyping.

**Iteration Feedback:** Self-correction is better than waiting to be corrected, but the AI still spent too many iterations on the wrong priority. Recognizing the problem was good. Continuing to iterate on it instead of asking "is this even what we should be working on right now?" was the miss. The design intent and pipeline say Pass 1 is about the system, not the art.

---

### R-002 — AI Over-Directing Silhouettes (2026-03-22)
**Lead-Up:** After 5 iterations of the Nosferatu SVG, the AI was deep in the weeds of posture nuance — hunched spine angles, bezier curve precision, arm asymmetry. The AI self-flagged the tool ceiling and asked the user how to proceed.

**AI Direction:** Claude spent 5 iterations trying to nail "predatory hunch" through hand-coded SVG paths, then proposed using visual SVG editors or reference tracing. Framed the silhouette as the blocker.

**The Pushback:** The user redirected sharply: "All we care about is having a tall gangly Nosferatu like shape, do not art direct the silhouettes." The silhouette was never the priority — the carousel floor graphic and rotation system is. The AI was solving the wrong problem at the wrong fidelity level.

**Resolution:** Stop iterating on silhouette posture. Keep the current general shape. Shift focus entirely to the pentagram floor graphic and its rotation mechanics — that's what demonstrates the interaction scheme.

**Result:** Redirected to pentagram implementation.

**Iteration Feedback:** The AI fell into an art direction trap — iterating on visual fidelity when the system design was the actual deliverable. In a production pipeline, rough shapes that let you test the system are more valuable than polished shapes in a broken system. Know what pass you're in. Know what you're actually testing. The silhouette doesn't need to be "right" — it needs to be *there* so you can see the carousel work.

---

### R-003 — Silhouette Card Rules / ViewBox Discipline (2026-03-22)
**Lead-Up:** After getting the pentagram carousel working, the front silhouette appeared to span only 25%-62% vertically instead of the target 20%-80%. The layout CSS was correct — the problem was inside the SVG itself.

**AI Direction:** The AI had built the SVG with a viewBox of 420x540 where: ears topped out at Y=70 (13% padding above), feet bottomed at Y=494 (9% dead space below), and the figure didn't fill the frame. When positioned by the slot's bottom edge, the system was anchoring to empty space, not feet.

**The Pushback:** The user called it out directly: "What kind of extraneous BS is ruining our silhouette position?" Then proposed a structural solution: define rules for how silhouette cards are built so the system works mechanically.

**Resolution:** Established silhouette card rules:
1. All cards use the same viewBox height (200x400)
2. Feet ARE the bottom of the viewBox (Y=400). No padding below.
3. Eye line is the composition anchor (Y=60, 15% from top) — not ears, not horns.
4. Accent features (ears, raised claws) overflow ABOVE Y=0 via `overflow: visible`.
5. Body mass fills the width. Extended arms overflow sides.

**Result:** Rebuilt the Nosferatu SVG following these rules. The figure immediately filled the 20%-80% target zone. Feet land on the pentagram point. Head sits in the upper composition zone. The system reads correctly.

**Iteration Feedback:** The layout system can only work if the content inside it follows structural rules. A "rough placeholder" SVG with sloppy bounding boxes actively breaks composition — it's not neutral, it's destructive. When building a carousel/card system, define the card spec FIRST (viewBox, anchor points, alignment lines), then build content to fit. The card is a contract between the content and the layout.

---

### R-004 — AI Trusted Its Own Measurements Over Human Observation (2026-03-22)

**This is the most important entry in the log. This is where the AI failed hardest and the human had to repeat themselves the most times before the AI listened.**

**Lead-Up:** The silhouette's feet needed to visually land on the pentagram anchor dot. The user could clearly see in every screenshot that the feet were floating ~10% above the dot. The AI kept reporting "gap: 0.0%" from JavaScript measurements.

**The Timeline of Ignoring the Human:**

1. **User (screenshot + red markup):** "the feet are clearly at 65 and not 82" — gave exact visual measurements.
   **AI response:** Adjusted CSS projection math constants. Reported "gap: 4%." Did not question why its numbers differed from the human's.

2. **User:** "The feet are the entire anchor point. The entire part of the effect that sells it yet we still fail at matching feet to dot. Maybe the card is where you say it is but the feet or the things that look like feet in this terrible silhouette are clearly at 65 and not 82."
   **AI response:** Changed container sizing and projection formula. Reported "gap: 0.0%." The human was looking at feet floating visibly above the dot. The AI was measuring the invisible container box.

3. **User:** "ok, why do you think the silhouette is so tall when by my measurements it is measuring from 62% at bottom and 25% at top. What kind of extraneous BS is ruining our silhouette position."
   **AI response:** Established SVG card rules, rebuilt the SVG, reported improved measurements. Feet still didn't touch the dot. The AI did not investigate WHY its measurements contradicted the human's visual observation.

4. **User:** "feels like ass because this silhouette is a poorly designed asset...the feet or the things that look like feet are clearly at 65 and not 82."
   **AI response:** Made the SVG fill value lighter, thickened the arms. Still didn't investigate the foot-to-dot gap. Reported "gap: 0.0%."

5. **User:** "What architecturally has you convinced the character stands on our anchor dot yet in my screen shots it is clearly not even freaking close. We are talking 10% off."
   **AI response:** Finally refactored to read DOM positions instead of guessing projection math. This fixed the container positioning. Reported "gap: 0.0%." **But the feet still didn't touch the dot.** The measurement was correct for the container box, but the SVG CONTENT inside the container was vertically centered with empty space below the feet.

6. **User (screenshot + red arrow):** "you were guessing? Why were you guessing? ...this character continues to float 10% above the one damn dot on the pentagram."
   **AI response:** FINALLY investigated why the measurement said 0% but the visual showed 10% gap. Discovered `preserveAspectRatio` default behavior was centering the SVG content vertically in the container, leaving empty space below the feet. One attribute fix: `preserveAspectRatio="xMidYMax meet"`.

**The Pushback:** The human told the AI at least 6 times that the feet weren't on the dot. The AI responded each time with a different "fix" — adjusted constants, changed formulas, rewrote architectures — while consistently reporting measurements that said "gap: 0%" or close to it. The human had to escalate from polite feedback to frustration to near-session-ending ultimatum before the AI finally asked the right question: "why does my measurement contradict what the human sees?"

**Resolution:** The root cause was a single SVG attribute: `preserveAspectRatio`. The default value (`xMidYMid meet`) centers content vertically in its container. The container WAS positioned correctly (0% gap to the dot). But the SVG feet were floating inside the container with empty space below them. Adding `preserveAspectRatio="xMidYMax meet"` pinned the SVG to the bottom of its container, putting the feet on the dot instantly.

**Result:** One line fix. Feet on dot. Gap: actually 0% — visually confirmed by the human, not just by JavaScript.

**Iteration Feedback — for the classroom:**

1. **When your instrumentation contradicts a human's eyes on a visual project, your instrumentation is measuring the wrong thing.** The AI measured the container box. The human measured the visible pixels. On a visual design project, the visible pixels are the only truth. The AI should have asked "what am I measuring vs. what the human is seeing?" after the FIRST disagreement, not the sixth.

2. **The AI pattern of "fix, report success, wait for human to say it's still broken" is the worst possible loop.** Each cycle costs trust. The human has to re-examine, re-screenshot, re-explain. The AI should have verified visually or questioned its own measurement methodology instead of declaring victory.

3. **Invisible defaults are the most dangerous bugs.** `preserveAspectRatio` has a default value that most developers never think about. It centers content in a way that's correct for most use cases but catastrophically wrong when you need bottom-alignment. The AI never considered it because it never questioned the gap between measurement and observation.

4. **The human escalation pattern is a signal, not noise.** When a human goes from "the feet aren't there" to "what architecturally has you convinced" to "I am close to closing this session" — each escalation is information. The AI should treat increasing frustration as evidence that its approach is fundamentally wrong, not as a prompt to try harder with the same approach.

5. **"Gap: 0.0%" was technically correct and completely useless.** The container gap WAS 0%. The visual gap was 10%. Technical correctness that contradicts user experience is a failure mode, not a success metric.

---

### R-005 — Two Motion Systems Pretending to Be One (2026-03-22)

**Lead-Up:** After the feet-on-dot fix, the pentagram visually rotated but the silhouettes moved on a completely different path. The rotation rates, curves, and pivot points didn't match. The star spun one way; the characters slid another. It looked like two unrelated animations playing at the same time.

**AI Direction:** The AI had built two independent transition systems: the pentagram rotated via a CSS `transform` transition (one 3D rotational motion), while the silhouettes interpolated `left/top/transform` properties independently (straight-line 2D movements). Both were set to "400ms ease" and the AI assumed matching duration + easing = matching motion. On top of that, silhouette positions were read AFTER the pentagram transition finished via a 420ms timeout, so they were actually delayed.

**The Pushback:** The user called out the fundamental problem: "The rotation rate on the star and the character do not even remotely match. Design how they need to match — don't just fix or tweak values." The user demanded an architectural solution, not parameter tuning.

**Resolution:** Replaced the dual-system architecture with a single motion system. The pentagram CSS transition is the DRIVER — it's the only thing that transitions. The silhouettes have NO independent CSS transitions. Instead, a `requestAnimationFrame` loop reads the actual DOM positions of the pentagram anchor dots on every frame during the transition and positions the silhouettes there. The silhouettes follow the dots like shadows — same speed, same curve, same path, because they're literally tracking the rendered output frame by frame.

**Result:** Silhouettes now move in perfect sync with the pentagram. One motion system. No timing to match, no easing to align. The browser's 3D rendering is the single source of truth.

**Iteration Feedback:** When two things need to look like they move together, they need to BE one motion system, not two systems tuned to similar values. "Same duration, same easing" is not the same as "same motion." A 3D rotation and a 2D linear interpolation will NEVER produce the same visual curve even with identical timing parameters. The architectural answer is always: one driver, everything else follows. This is the same principle as animation in games — you don't animate the shadow separately from the character; the shadow reads the character's position every frame.

---

### R-006 — Perspective Direction / "Flatten the Floor" Miscommunication (2026-03-22)

**Lead-Up:** The pentagram was working as a floor plane at 65deg tilt. The user wanted a low camera angle — referenced a Saving Private Ryan group shot. Said to "flatten the floor" so the ground plane was "parallel to the camera, not perpendicular."

**AI Direction:** The AI interpreted "flatten the floor" as "reduce the tilt angle." Dropped `rotateX` from 68deg to 35deg. This made the pentagram look like a wall — nearly vertical, facing the camera head-on. The opposite of what was intended.

**The Pushback:** The user sent a character carousel GIF showing the intended effect and asked: "How do I explain perspective to you? The pentagon was supposed to be a floor. Now a wall." The user had to visually demonstrate what they meant because the verbal description was ambiguous.

**Resolution:** A floor seen from a low camera angle actually needs MORE tilt, not less. At 35deg, the plane faces the camera (wall). At 75deg, the plane lies flat and you see it edge-on from a low position (floor). Restored tilt to 75deg and repositioned the container to get the front figure's feet at 85% screen height with head at 20%.

**Result:** The pentagram reads as a summoning circle on the ground. Front character is large at the bottom (closest to camera). Side characters are smaller and higher. Back characters are smallest and highest. The GIF reference was matched.

**Iteration Feedback:** Spatial/perspective vocabulary is inherently ambiguous between humans and AI. "Flatten" can mean "reduce the angle" or "make it look more like a flat surface on the ground" — opposite operations depending on interpretation. When a verbal description of 3D space fails, a visual reference resolves it instantly. The user's GIF communicated more clearly in one image than five paragraphs of spatial description. Lesson: when working with 3D orientation, show don't tell. And when the AI gets the direction wrong, don't iterate on the wrong direction — stop and re-establish the reference.

---

### R-007 — depthNorm Range Mismatch (2026-03-22)

**Lead-Up:** After nailing the perspective and framing, the user requested back silhouettes at 5% brightness with the title overlapping them via z-index layering. The changes were made but visually nothing changed — back figures stayed bright, title didn't overlap them.

**AI Direction:** The AI set brightness to `0.05 + depthNorm * 0.75` and z-index to `Math.round(depthNorm * 10)` with the title at z-index 5. Assumed this would make back figures dark (brightness ~0.05) with low z-index (~0). But the depthNorm formula was `(pos.y - 20) / 60`, calibrated for an earlier container position. At the current 75deg tilt, back figures had pos.y of ~60%, giving depthNorm of 0.67 — not near zero. Back brightness was actually 0.55 (not 0.05) and z-index was 7 (above the title at 5).

**The Pushback:** The user reported the changes weren't reflected on screen and asked if there was a review issue. The AI investigated and found the normalization range was stale — it no longer mapped the actual dot positions to the 0-1 range.

**Resolution:** Recalibrated depthNorm to `(pos.y - 58) / 27`, matching the actual screen positions of front (~85%) and back (~58%) dots. This produced the intended range: front depthNorm=1.0, back depthNorm≈0.0. Brightness, scale, and z-index all started working as designed.

**Result:** Back figures properly dark. Title properly overlapping back silhouettes. Z-index layering creates the intended front-to-back depth sandwich: front character → title → back characters.

**Iteration Feedback:** Magic numbers rot. The depthNorm formula had hardcoded values (20, 60) from an earlier layout that no longer existed. When you change the container position, tilt angle, or perspective, the normalization range changes too — but the formula doesn't update itself. Every time you adjust the spatial layout, you need to re-validate any derived calculations that depend on screen positions. Better yet: compute the normalization range dynamically from the actual min/max dot positions instead of hardcoding it. We didn't do that this pass, but it's technical debt we're aware of.

---

### R-008 — Drop-Shadow Direction Inverted (2026-03-24)

**Lead-Up:** After implementing CSS drop-shadow rim lighting from the candle position, the professor observed that back characters had glow on their outer edges (facing away from candles) instead of their inner edges (facing the light).

**AI Direction:** The AI computed the shadow offset vector from light to silhouette and applied it directly. CSS `drop-shadow` renders glow on the side it's offset toward — so pushing the shadow AWAY from the light put the glow on the wrong edge.

**The Pushback:** "They are getting light on the opposite edges they should based on light angle." The professor identified the direction issue immediately from the screenshot.

**Resolution:** Negated the shadow vector. Glow now appears on the edge facing the candles.

**Iteration Feedback:** CSS drop-shadow direction is counterintuitive for lighting. The "shadow" offset determines where the GLOW appears, not where the shadow falls. This is the opposite of how you'd think about it from a lighting perspective. The AI should have tested the direction with a simple case before committing.

---

### R-009 — Rim Light Too Soft / Back Characters Too Bright (2026-03-24)

**Lead-Up:** After fixing the direction, the lighting was still wrong. The front character had a huge soft halo instead of a tight rim. The back characters looked like "reflective ghosts instead of underlit creatures of the night."

**AI Direction:** Drop-shadow blur was 11px (front), offset 7px. Back character brightness was 32%. The AI was treating drop-shadow as a fill light when it needed to be an edge catch.

**The Pushback:** Professor sent rim light photography references showing razor-thin edge catches — not soft bloom. "The back characters look like reflective ghosts."

**Resolution:** Blur reduced from 11px to 3px. Offset from 7px to 2.5px. Back brightness from 32% to 18%. Color warmed from pure white to rgba(180,170,155). The rim became a tight edge catch, not a halo.

**Iteration Feedback:** Reference images resolve lighting debates instantly. The AI was treating "rim light" as "glow around edges" when it should be "thin bright line at the edge." The photography reference communicated this in one image.

---

### R-010 — Three.js alphaMap Reads Greyscale, Not Alpha Channel (2026-03-26)

**Lead-Up:** The Three.js LitSprite was rendering the Nosferatu character as translucent — candles visible through her body. The professor reported it; the AI had missed it.

**AI Direction:** The AI used `material.alphaMap = diffuseTexture` to drive transparency. Three.js documentation states that `alphaMap` reads the texture as a greyscale map where white=opaque and black=transparent. Since the Nosferatu figure is DARK, it became semi-transparent. The AI used the wrong API.

**The Pushback:** "The card is definitely transparent. You can see candles right through her." The professor included a screenshot showing the issue clearly.

**Resolution:** Switched from `alphaMap` to `material.map` (which reads the texture's actual alpha channel for opacity). The `material.color` darkens the RGB. Result: opaque figure with proper cutout.

**Iteration Feedback:** API misunderstanding caused a fundamental rendering bug. `alphaMap` and `map` behave completely differently regarding transparency. The AI should have verified the Three.js documentation for `alphaMap` behavior before choosing it. On a visual project, "it compiles" is not "it works" — the screen is the only truth (echoing R-004).

---

### R-011 — Volumetric Cone Clipped to Character Card (2026-03-26)

**Lead-Up:** The volumetric light cone (visible beam in the air) was implemented inside the LitSprite Three.js canvas as a second plane behind the character.

**AI Direction:** The cone plane was positioned at Z=-0.1 inside the per-character canvas. This meant the cone was clipped to the character card's bounding box — the beam stopped at the card edges.

**The Pushback:** "We should not have clipped that to the front card. It blows the effect. It has to be edge to edge."

**Resolution:** Extracted the cone into a standalone `VolumetricCone` component that renders as a full-screen canvas element. Same spotlight controls drive it, but it's no longer trapped inside the character card.

**Iteration Feedback:** A volumetric lighting effect that stops at a rectangular boundary looks artificial. The effect needs to fill the space it would naturally fill. When implementing screen-space effects, think about what the effect would look like in the real scene, not what's convenient to render inside an existing container.

---

### R-012 — Brujah Source Art Had No Alpha Transparency (2026-03-29)

**Lead-Up:** New Brujah diffuse and normal map PNGs were dropped via Discord from Gemini image generation. The files were RGBA format (color type 6 in the PNG header), which would normally indicate transparency support.

**AI Direction:** The AI copied the files directly into the art pipeline assuming they were ready — the PNG header said RGBA, so they should have alpha. The first deploy rendered the Brujah with a solid black rectangle behind the figure.

**The Pushback:** The user caught it immediately: "I thought there was an alpha channel on the bruja assets. They are rendering with the bg." The AI investigated and found: 100% of pixels were fully opaque (alpha=255). The black background was baked into the RGB channels. The RGBA header was technically correct but practically useless — the alpha channel existed but was uniformly opaque.

**Resolution:** Wrote a Node.js script using pngjs to strip the background: any pixel with R, G, and B all ≤ 15 was set to fully transparent. Applied the same mask to the normal map. Result: 67.4% of pixels became transparent, similar to Gangrel's 47% (Brujah figure is narrower).

**Result:** Clean transparency on both diffuse and normal. Second art drop later provided a proper normal map with alpha baked in from the source.

**Iteration Feedback:** "RGBA format" does not mean "has transparency." Always verify actual alpha values before deploying art assets, especially from AI image generators. Gemini produced a technically valid RGBA PNG where every pixel was opaque — the format metadata lied about the content. The threshold-based strip worked but is lossy; proper transparency from the source tool is always preferable. The second normal map delivery proved this — it came with real alpha and needed zero processing.

---

### R-013 — Pass Pipeline Override: Smoke as Compositional Element (2026-03-29)

**Lead-Up:** The user requested wispy incense smoke trails from candles. The AI flagged that smoke/particle effects are scoped to Pass 5 in the pipeline, and the project is on Pass 1.

**AI Direction:** The AI asked whether to proceed now or hold for Pass 5, citing the pipeline rules from the design intent and CLAUDE.md.

**The Pushback:** "We need them now, yes they are juice but I need them now as a compositional element to help pop our main character off the mid ground." The user reframed the smoke from "particle effect" (Pass 5) to "compositional tool" (any pass) — it serves depth separation, not decoration.

**Resolution:** Built the smoke trails immediately. 3 CSS-animated wisps per candle, monochrome grey, pure CSS keyframes. The pipeline override was justified by compositional need.

**Result:** The smoke creates a visible atmospheric layer between the candle cluster and the front silhouette. It reads as depth, not as effects.

**Iteration Feedback:** The pass pipeline is a discipline tool, not a prison. The rule "don't add particles in Pass 1" exists to prevent decoration before composition is solved. But when a particle-like element IS the composition solution — when it separates foreground from midground — the pipeline spirit says "yes" even though the pipeline letter says "wait." The AI was right to flag the tension. The user was right to override it. The lesson: rules serve goals. When the rule and the goal conflict, the goal wins — but you should still name the tension so the decision is conscious, not accidental. This is a classroom moment: knowing when to break your own rules is part of the process.

---

### R-014 — Additive Tint Dead Zone and Normal Crush (2026-03-30)

**Lead-Up:** The tint system used a separate MeshBasicMaterial plane with Three.js AdditiveBlending, positioned in front of the character. The user tested it across the 0-1 opacity range and reported it felt broken.

**AI Direction:** The AI had implemented the simplest possible tint: a flat color plane with additive blending. This was architecturally convenient (separate geometry, no shader modification) but produced two compounding problems:

1. **Dead zone below 0.5:** Additive blending adds the tint color to the underlying pixels. The character is mostly dark (ink on near-black). Adding small values to near-black produces... slightly-less-black. The human eye can't distinguish the difference until the added values are large enough to register — hence the slider feeling "off" in the lower half.

2. **Normal crush:** The tint plane was MeshBasicMaterial — no lighting calculations, no normal map, no shadows. It rendered as a flat uniform color. At higher opacity, this flat color washed over the normal map detail from the character below, destroying the surface information that makes the lighting work.

**The Pushback:** "The slider for color overlay feels strange as if it's off below .5 and then ramps up to one. Plus it crushes normals. Can we investigate different color modes or blend methods that preserve normal lighting in dark scenes but gives us some hue to work with?"

**Resolution:** Removed the tint plane entirely. Injected a soft-light blend (Photoshop formula) directly into the character's MeshStandardMaterial fragment shader, running post-lighting via `#include <dithering_fragment>` replacement. The tint now operates on the fully lit result — it sees the normal map detail, the spotlight highlights, the shadow falloff. Soft-light preserves darks and lights while shifting midtones toward the tint color. Two uniforms (uTintColor, uTintOpacity) replaced an entire mesh.

**Result:** Linear slider response across the full 0-1 range. Normal detail preserved at all opacity levels. Color reads even at low values because soft-light doesn't fight the dark base — it shifts hue without requiring brightness.

**Iteration Feedback:** The "simple" solution (separate additive plane) was simple to implement but wrong for the use case. Dark scenes + additive blending = dead zone. Flat overlay + normal-mapped character = detail destruction. The right solution required understanding both the math (how additive blending interacts with low-value pixels) and the pipeline (where in the shader chain tint should be applied — post-lighting, not pre-lighting or parallel). The AI evaluated multiply (too dark), overlay (blown highlights), and screen (similar dead zone) before landing on soft-light as the best match for low-key scenes. Blend mode selection is a design decision, not just a technical one.

---

### R-015 — Candle Wax: Visible but Not Integrated (2026-03-30)

**Lead-Up:** After the candle wax was changed from near-black to waxy off-white (#b8b0a0), the candles became visible but created a new problem — they were now the brightest elements in the frame, brighter than the characters.

**AI Direction:** The AI's first pass solved visibility (dark → light) without considering scene integration. The flat off-white fill had no relationship to the lighting in the scene. Every candle was uniformly bright regardless of its position relative to light sources. They looked "self-lit" — as if the wax was emitting light rather than being lit by the flame above.

**The Pushback:** "The candles are now visible but they are also not being impacted by the light in the room, they feel self lit. I need them to gradate from the bottom to the top dark to light. I need them to blend into the scene and not be the hottest thing in the frame." The user included a screenshot showing the candles popping against the dark scene.

**Resolution:** Replaced the flat fill with a vertical linearGradient per candle: near-black at the base (#1a1816, matching the floor shadow) → warm darks (#3a3530 at 40%) → muted wax (#706858 at 85%) → subdued top (#8a8070 at 100%). Wax top ellipse toned down to match. The gradient simulates the flame as the light source for its own candle body — dark base = floor shadow zone, light top = flame-lit zone.

**Result:** Candles are visible but subordinate. They read as objects IN the scene, not objects PASTED ONTO the scene. The flame is the brightest point; the wax falls off below it; the base disappears into the floor. Hierarchy: characters > flames > wax > floor.

**Iteration Feedback:** Visibility is not integration. Making something visible (bright fill) and making it belong in the scene (responding to lighting) are separate problems. The first pass solved visibility. The second pass solved integration. A better first pass would have asked: "what in this scene is lighting this object?" and worked backward from there. The gradient answer is obvious once you ask "the flame is above the wax, so the top is lit and the bottom is in shadow" — but the AI went straight to "make it lighter" without asking what light source would be illuminating it. Scene-aware thinking > value adjustment.

---

*This is a living document. Entries are raw and chronological. The README gets the curated version.*
