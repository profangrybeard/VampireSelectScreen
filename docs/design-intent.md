# Design Intent — Vampire Clan Select Screen

**Project:** AI 201 – Project 1: The "Hero Faction" Screen  
**Author:** Tim Lindsey  
**Date:** March 2026  
**Status:** Pre-production (written before AI coding)

---

## Concept

A mobile-first clan selection screen for a Vampire: The Masquerade LARP onboarding tool. Five vampire clans are arranged on a ritual pentagram viewed in forced perspective. One clan dominates the vertical screen space as a full silhouette. Adjacent clans are barely visible at the screen edges — shadowed, perspective-crushed, hinting at what comes next. Tapping the left or right edge rotates the pentagram, bringing the next clan to center. The silhouette *is* the UI.

The screen should feel like the opening moment of a tabletop campaign: you are choosing your verbs, your motivation, your curse.

## Visual Direction

**Mood:** Candlelit sanctum. The room you walk into before the campaign starts. Dark, warm, ritualistic. Not horror — *atmosphere*. The kind of darkness that invites you in rather than warns you away.

**Lighting reference:** The WoD concept art by Scott Fischer — pools of warm light cutting through deep shadow. Silhouettes defined by rim light and ambient glow, not fill light.

**Art direction lineage:** World of Darkness MMO concept art (CCP Games, 2006–2014). Gothic realism. Not cartoonish, not photorealistic — illustrative darkness.

## Layout

**Orientation:** Portrait / vertical. Designed for mobile-first. Desktop is a bonus, not the target.

**Structure:**
- **Top 15%:** Negative space. Darkness. Maybe a faint hint of architecture (arches, ceiling).
- **Middle 55%:** The silhouette. Full figure, feet near the bottom third, head/shoulders reaching into the upper quarter. The silhouette's posture communicates the archetype before any text appears.
- **Lower 20%:** Clan title — large, permanent, designed into the composition. Not dismissable. Screenshot-worthy. Tap to unroll stat panel.
- **Bottom 10%:** Stat panel area (hidden by default, revealed on tap).
- **Left/Right edges:** Forced-perspective glimpses of adjacent clan silhouettes. Tap zones for rotation.

**The Pentagram:** Rendered in forced perspective on the "floor" plane. Barely visible in default state — muted ember lines. When a clan is active, the pentagram lines glow in that clan's color, with the active point brightest. The pentagram is both atmosphere and wayfinding.

## Color System

**Base state:** Near-black (#0a0a0a) with warm amber candlelight accents. Monochromatic until Pass 3.

**Per-clan palettes (applied in Pass 3):**

| Clan | Primary | Accent | Atmosphere |
|------|---------|--------|------------|
| Nosferatu | #2d4a1e (toxic green) | #4a7a2e | Subterranean, sewer shadow |
| Brujah | #8b3a0f (smoked amber) | #d45a1a | Heat, fire, rage |
| Malkavian | #4a2d6b (fractured violet) | #c8b8e8 | Cold, clinical, wrong |
| Gangrel | #5a3e1b (deep earth) | #8b6914 | Mud, bark, forest floor |
| Tremere | #6b1a1a (deep crimson) | #d4a843 | Blood ritual, arcane gold |

## Typography

**Clan Title:** A display face with gothic weight. Cinzel Decorative or similar — something that feels carved, not printed. Large. 48–64px on mobile. Tracked wide. This is the second most important visual element after the silhouette.

**Stat Panel Text:** Clean, readable sans-serif. Smaller. The contrast between the ornate title and the clean stats creates hierarchy.

**Epithet/Tagline:** Italic treatment of the body face. Sits directly below the clan title.

## Interaction Model

**Navigation:** Tap left/right edge zones to rotate the pentagram carousel. No swipe (Android back gesture conflict). Rotation transitions at ~400ms with easing.

**Stat Reveal:** Tap the clan title to unroll the stat panel. Animation style varies per clan:
- Nosferatu — oozes open, organic crawl
- Brujah — slams open, fast, aggressive
- Malkavian — glitches/stutters into view
- Gangrel — tears open, rough, feral
- Tremere — unfurls like a ritual scroll, elegant

**Stat Panel Contents:**
- Clan epithet / archetype tagline (1 line)
- Three signature Disciplines (name only)
- Humanity tendency (high/low indicator)

Tap the title again to collapse. Rotating to a new clan auto-collapses any open panel.

## The Five Clans

| Clan | Archetype | Epithet | Silhouette Posture |
|------|-----------|---------|-------------------|
| Nosferatu | The Monster | "We see everything. That is our curse." | Hunched, clawed, lurking — one hand extended |
| Brujah | The Rebel | "History remembers the ones who fought." | Squared up, fists clenched, shoulders wide |
| Malkavian | The Visionary | "The truth was always there. You just couldn't hear it." | Head tilted, one hand raised, asymmetric stance |
| Gangrel | The Beast | "The city is a cage. The wild is honest." | Low crouch, feral, weight forward, almost animal |
| Tremere | The Sorcerer | "Knowledge is the only power that compounds." | Rigid upright, hands positioned for casting, formal |

## Production Pipeline (5 Passes)

1. **Monochrome Silhouettes** — Grey values only. Nail the silhouette postures, the pentagram perspective, the carousel rotation, and the tap zones. If it works in grey, it works.
2. **Base Colors** — Apply per-clan palettes to background atmosphere and pentagram glow. Silhouettes remain dark.
3. **Pop Highlights** — Rim lighting on silhouettes, accent glows, title color treatment. Intentionally darken areas to increase silhouette contrast.
4. **Feedback Juice** — Clan-specific unroll animations, rotation transitions, micro-interactions on tap, subtle particle hints.
5. **Polish & Post Effects** — Atmospheric particulate (dust in light), noise/grain overlay, final typography refinement, performance pass.

## Non-Negotiables

- The silhouette posture must communicate the archetype without any text. If you cover the title and can't tell which clan it is, the silhouette has failed.
- The clan title is permanent and designed into the composition. It is not a tooltip. It is not a hover state. It is architecture.
- Mobile-first. If it doesn't work on a phone screen, it doesn't work.
- No lifted art. All silhouettes are generated or hand-built for this project.

---

*This Design Intent was written before any AI-assisted coding began, per AI 201 course requirements and ESF protocol.*
