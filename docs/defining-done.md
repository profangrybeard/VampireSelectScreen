# Defining Done — Per-Pass Completion Criteria

**AI 201 — Lecture Notes | Spring 2026**
**Context:** Production pipeline for the "Hero Faction Screen" project

---

## Why Define Done?

Each pass in the pipeline has a specific job. "Done" isn't "perfect" — it's "this pass delivered what it needed to so the next pass has a solid foundation." Defining done prevents two failure modes:

1. **Polishing too early** — spending hours on rim lighting when the silhouette posture doesn't read
2. **Moving on too soon** — jumping to color when the grey version has broken interactions

Done means: the pass has delivered its value. Not more, not less.

---

## Pass 1 — Monochrome Silhouettes

*This is the tightest definition. Everything else builds on this.*

**DONE when:**

1. Five silhouettes exist as SVG components, each following the card rules (200x400 viewBox, feet at Y=400, eye line at Y=60)
2. Cover the clan title — you can still identify the archetype from posture alone
3. Carousel rotates through all 5 clans via tap on left/right edges (no swipe)
4. Pentagram is visible in forced perspective on the floor plane, dots track silhouettes
5. Clan title + archetype label are permanently visible, designed into composition
6. Tap title → stat panel unrolls (epithet, disciplines, humanity). Tap again → collapse. Rotate → auto-collapse.
7. Everything is grey. Zero color. If it works in grey, it works.
8. Works on a phone-sized viewport (portrait, 430px max-width)

**The non-negotiable test:** Hand someone your phone with the title covered. If they can't tell you which archetype they're looking at, the silhouette has failed. Fix that before anything else.

---

## Pass 2 — Base Colors

**DONE when:**

- Each clan has a distinct background atmosphere and pentagram glow color
- Silhouettes remain dark — color is environment, not character
- Rotating between clans produces a visible mood shift
- Color choices can be traced back to the Design Intent palette

*This pass will change as we discover what the monochrome version actually needs from color. The palette in the Design Intent is a starting point, not a contract.*

---

## Pass 3 — Pop Highlights

**DONE when:**

- Silhouettes have rim lighting or accent edges that separate them from the background
- At least one area per clan was intentionally darkened to increase contrast
- Title has color treatment that belongs to the clan
- The screen reads as "lit" — not flat colored, but illuminated

*Expect this pass to teach us things about value structure that we thought Pass 1 had solved. That's fine. The pipeline is iterative.*

---

## Pass 4 — Feedback Juice

**DONE when:**

- Each clan's stat panel has a distinct unroll animation that reflects its archetype
- Rotation has transition polish (not just a cut or generic fade)
- At least one micro-interaction exists on tap (could be a glow pulse, a shake, a ripple)
- Animations serve the mood, not just demonstrate capability

*The danger of this pass is over-building. If an animation draws attention to itself instead of the clan, it's wrong.*

---

## Pass 5 — Polish & Post Effects

**DONE when:**

- Atmospheric particulate or grain is present (subtle, not distracting)
- Typography has had a final refinement pass
- Performance is acceptable on a real phone
- Nothing was added that doesn't serve the mood
- You can hand someone your phone and they understand what to do without instruction

*This pass is where "done" means "stop." The hardest skill in polish is knowing when to put the brush down.*

---

## A Note on Discovery

These criteria will change as each pass reveals what we don't know yet. Pass 2 might show us that a silhouette posture we accepted in Pass 1 doesn't hold up with color behind it. Pass 4 might reveal that an interaction we designed in Pass 1 needs structural changes to support animation.

That's not failure — that's the pipeline working. The point of passes isn't to never go back. It's to make sure you go back for the right reasons, with clear eyes about what changed and why.

Update this document as criteria evolve.

---

*AI 201 Creative Computing with AI | Spring 2026 | SCAD Applied AI Degree Program*
