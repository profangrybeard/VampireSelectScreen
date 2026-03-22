# Silhouette Art Drop Zone

Drop your clan silhouette PNGs here. The app picks them up automatically.

## Filename Convention

| File | Clan |
|------|------|
| `nosferatu.png` | Nosferatu — The Monster |
| `brujah.png` | Brujah — The Rebel |
| `malkavian.png` | Malkavian — The Visionary |
| `gangrel.png` | Gangrel — The Beast |
| `tremere.png` | Tremere — The Sorcerer |

## Pipeline

1. **Print** `TEMPLATE.svg` (in the parent folder) on letter paper
2. **Draw** your clan silhouette — feet on the red line, eyes on the blue line
3. **Photograph** straight-on, even lighting, no shadows on the paper
4. **Crop** to the red border frame
5. **Remove background** → transparent PNG (use remove.bg or Photoshop)
6. **Save** as `clanname.png` (lowercase, must match the IDs above)
7. **Drop** into this folder
8. **Done** — HMR picks it up, no code changes needed

## Image Requirements

- **Format:** PNG with transparency (no background)
- **Aspect ratio:** 1:2 (width:height) — 600x1200px recommended
- **Feet:** Must be at the very bottom of the image (no padding)
- **Eye line:** ~14% from the top of the image

## Value Range (Pass 1)

- Body fill: near-black (#1a1a1a to #2a2a2a)
- Interior detail (clothing, hair): up to #3a3a3a
- No values brighter than #444444 (reserved for Pass 3 rim lighting)
- The figure should read as a dark shape with subtle interior texture

## What Happens If No Art Exists

The app falls back to the generic SVG placeholder (the current mannequin shape).
You can replace clans one at a time — they don't all need to be done at once.
