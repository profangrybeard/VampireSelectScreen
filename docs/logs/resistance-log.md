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

*This is a living document. Entries are raw and chronological. The README gets the curated version.*
