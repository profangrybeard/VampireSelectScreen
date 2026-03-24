# Vampire Clan Select Screen — Claude Context

## Project Identity

This is an AI 201 instructor demo project: a mobile-first vampire clan selection screen inspired by Vampire: The Masquerade. It follows the "Hero Faction Screen" assignment brief exactly, modeling the process for students.

## Documentation Structure

Teachable docs live in `docs/`. This folder (`.claude/`) is for AI context only.

```
docs/
  design-intent.md              <- The bible. Read before making changes.
  defining-done.md              <- Per-pass completion criteria.
  pass-briefs/
    pass-1-monochrome.md        <- Current pass build brief.
  logs/
    ai-direction-log.md         <- Asked/Produced/Decision entries.
    resistance-log.md           <- Raw resistance tracking.
  lectures/
    when-the-ai-becomes-the-art-director.md
```

**Read `docs/design-intent.md` before making any changes.**

## Creative Direction

### The Non-Negotiables
- Silhouette posture must communicate the clan archetype without text. If you can cover the title and not know which clan it is, the silhouette failed.
- Clan title is permanent and designed into the composition. It is not a tooltip. Not a hover state. It is architecture.
- Mobile-first. Portrait orientation. If it doesn't work on a phone screen, it doesn't work.
- No lifted art. All silhouettes are generated or hand-built SVG for this project.
- Tap navigation only. No swipe gestures (Android back gesture conflict).

### The Five Clans (in pentagram order)
1. **Nosferatu** — The Monster. Toxic green. Hunched, clawed, lurking.
2. **Brujah** — The Rebel. Smoked amber/red. Squared up, fists ready.
3. **Malkavian** — The Visionary. Fractured violet. Head tilted, asymmetric.
4. **Gangrel** — The Beast. Deep earth tones. Low crouch, feral.
5. **Tremere** — The Sorcerer. Deep crimson/arcane gold. Rigid, casting hands.

### Visual Pipeline (current pass dictates scope)
- **Pass 1:** Monochrome only. Grey values. Nail silhouettes, carousel, tap zones.
- **Pass 2:** Base clan colors on background and pentagram glow. Silhouettes stay dark.
- **Pass 3:** Rim lighting, pop highlights, intentional darkening for contrast.
- **Pass 4:** Clan-specific unroll animations, rotation juice, micro-interactions.
- **Pass 5:** Particulate, grain, noise overlay, final typography polish.

**Do not jump ahead in passes.** If we are in Pass 1, do not add color. If we are in Pass 2, do not add particles. The pipeline exists because value contrast must work before color, and color must work before effects.

## Technical Constraints

- **Framework:** React (Vite)
- **Layout:** CSS Grid + Flexbox. Vertical portrait composition.
- **Silhouettes:** SVG components, hand-built, inline in React.
- **Pentagram:** SVG with CSS perspective transform to lay it on the floor plane.
- **Carousel:** CSS transitions on opacity/transform. No animation libraries for Pass 1-2.
- **Deployment:** GitHub Pages from the `dist/` folder.
- **Font stack:** Cinzel Decorative (titles), Cormorant Garamond (body/stats).

## Interaction Model

- **Tap left/right edges** -> Rotate pentagram carousel (400ms transition)
- **Tap clan title** -> Unroll stat panel (clan-specific animation in Pass 4)
- **Tap title again** -> Collapse stats
- **Rotate while stats open** -> Auto-collapse, then rotate

## Mood References

- Uploaded concept art: candlelit gothic figure with occult jewelry and leather
- Scott Fischer's WoD lighting: pools of warm light cutting through deep shadow
- WoD MMO concept art (CCP Games): gothic realism, illustrative darkness
- Not horror — atmosphere. The darkness invites, it doesn't warn.

## What This Project Is NOT

- Not a character creator
- Not a full app with routing or backend
- Not a desktop-first experience adapted to mobile
- Not a showcase for animation over composition
- The mood is the deliverable. The silhouette is the UI.

## Doc Placement Rules

When creating new documents:
- **Pass briefs** -> `docs/pass-briefs/pass-N-name.md`
- **Log entries** -> append to existing files in `docs/logs/`
- **Lecture material / case studies** -> `docs/lectures/`
- **Pipeline or process docs** -> `docs/` root
- **Claude-only context** -> `.claude/` (this folder)

## ESF Documentation

The README.md contains the Records of Resistance summary and Five Questions template. Full logs live in `docs/logs/`. Update these as we work. Every significant AI interaction should produce a direction log entry. Every rejection or major revision is a resistance log entry.
