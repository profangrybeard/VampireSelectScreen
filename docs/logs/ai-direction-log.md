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

---

*New entries are added as work continues. Each entry follows the Asked/Produced/Decision format.*
