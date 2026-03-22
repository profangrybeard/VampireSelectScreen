# Pass 1 Build Brief — Monochrome Silhouettes

**Status:** Design Intent locked. Repo scaffolded. Local dev server running.  
**Goal:** Build the complete monochrome version of the clan select screen.  
**Rule:** Grey values only. No color. If it works in grey, it works.

---

## What Pass 1 Must Deliver

### 1. Five SVG Silhouettes
Each silhouette is a React component. Each must communicate its archetype through posture alone — no text, no color, just shape.

| Clan | Posture | Read Test |
|------|---------|-----------|
| Nosferatu | Hunched, clawed, one hand extended forward | Predatory. Lurking. You'd cross the street. |
| Brujah | Squared up, fists clenched, shoulders wide | Fighter's stance. Ready for contact. |
| Malkavian | Head tilted, one hand raised with splayed fingers, asymmetric | Something is wrong with this person. Off-axis. |
| Gangrel | Low crouch, weight forward, nearly animal | Feral. Could drop to all fours any second. |
| Tremere | Rigid upright, hands positioned for casting, formal | Controlled. Precise. The most dangerous person in the room. |

The silhouettes should be built in a `src/silhouettes/` directory, one file per clan, exported as React components that accept `opacity` and `scale` props.

### 2. The Carousel
- One clan centered, dominating the vertical space (roughly 55% of viewport height)
- Adjacent clans visible at left and right edges — darker, blurred, perspective-warped, just hints
- Tap left edge → rotate left. Tap right edge → rotate right.
- 400ms transition with ease. Crossfade between clans.
- No swipe. Tap only.

### 3. The Pentagram
- SVG pentagram rendered in forced perspective on the "floor" plane
- CSS `perspective` + `rotateX` to flatten it
- Muted grey lines, barely visible — atmospheric, not decorative
- Subtle pulse animation (opacity oscillation, 6s cycle)

### 4. The Clan Title
- Font: Cinzel Decorative (Google Fonts), 700 weight
- Large: `clamp(32px, 8vw, 52px)`
- Permanently visible. Designed into the composition below the silhouette.
- Archetype label above the title in small caps (Cormorant Garamond, 300 weight, 11px, tracked wide)
- All grey tones for Pass 1. Title in #c8c8c8, archetype in #666.

### 5. The Stat Panel (Tap to Reveal)
- Tap the clan title → unroll stats below it
- For Pass 1, use a uniform `max-height` transition (clan-specific animations come in Pass 4)
- Contents: epithet (italic), three Disciplines (small caps), Humanity dot indicator (filled/empty circles, 10-dot scale)
- Tap title again → collapse
- Rotating to a new clan → auto-collapse

### 6. Indicator Dots
- Top of screen, centered
- One dot per clan. Active clan's dot is wider (pill shape)
- Grey tones only

### 7. Viewport Setup
- Max-width: 430px, centered
- Height: 100vh (capped at 932px)
- Background: #0a0a0a
- No scroll. Overflow hidden.
- Mobile viewport meta already set in index.html

---

## Clan Data

```javascript
const CLANS = [
  {
    id: "nosferatu",
    name: "Nosferatu",
    epithet: "We see everything. That is our curse.",
    archetype: "The Monster",
    disciplines: ["Obfuscate", "Potence", "Animalism"],
    humanity: 2,
  },
  {
    id: "brujah",
    name: "Brujah",
    epithet: "History remembers the ones who fought.",
    archetype: "The Rebel",
    disciplines: ["Celerity", "Potence", "Presence"],
    humanity: 4,
  },
  {
    id: "malkavian",
    name: "Malkavian",
    epithet: "The truth was always there. You just couldn't hear it.",
    archetype: "The Visionary",
    disciplines: ["Auspex", "Dominate", "Obfuscate"],
    humanity: 5,
  },
  {
    id: "gangrel",
    name: "Gangrel",
    epithet: "The city is a cage. The wild is honest.",
    archetype: "The Beast",
    disciplines: ["Animalism", "Fortitude", "Protean"],
    humanity: 2,
  },
  {
    id: "tremere",
    name: "Tremere",
    epithet: "Knowledge is the only power that compounds.",
    archetype: "The Sorcerer",
    disciplines: ["Auspex", "Dominate", "Thaumaturgy"],
    humanity: 6,
  },
];
```

---

## File Structure Target

```
src/
├── App.jsx                  ← Main screen composition
├── main.jsx                 ← Mount (already done)
├── silhouettes/
│   ├── Nosferatu.jsx
│   ├── Brujah.jsx
│   ├── Malkavian.jsx
│   ├── Gangrel.jsx
│   └── Tremere.jsx
├── components/
│   ├── Pentagram.jsx        ← SVG pentagram with perspective
│   ├── ClanTitle.jsx        ← Title + archetype label + tap handler
│   ├── StatPanel.jsx        ← Unrolling stat display
│   └── HumanityBar.jsx      ← 10-dot humanity indicator
└── data/
    └── clans.js             ← Clan data array
```

---

## What NOT To Build in Pass 1
- No clan-specific colors (that's Pass 2)
- No rim lighting or glow effects (Pass 3)
- No clan-specific unroll animations (Pass 4)
- No particles, grain, or post effects (Pass 5)
- No sound
- No routing
- No external images

---

## Success Criteria

Open the dev server on a phone (or phone-sized browser window). Can you:

1. See a silhouette that clearly reads as a specific archetype?
2. Tap left/right to smoothly rotate through all five clans?
3. See hints of the adjacent clans at the screen edges?
4. See the pentagram on the floor in perspective?
5. Read the clan title as a permanent, designed element?
6. Tap the title to see Disciplines and Humanity?
7. Tell which clan is which with the title covered?

If #7 fails, fix the silhouettes before anything else. That is the non-negotiable.
