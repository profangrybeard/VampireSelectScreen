/**
 * Nosferatu Silhouette — "The Monster"
 *
 * Reference: Frankie "Razor" Malloy energy in classic Orlok silhouette.
 * Tall, gaunt, bald, subtly feminine but androgynous.
 * Embraces monstrosity with joy — not skulking, not ashamed.
 *
 * Posture: Standing confident, weight on right leg (viewer's right).
 * Left hand on hip. Right arm hanging with elongated fingers.
 * Head slightly tilted. Pointed ears prominent in silhouette.
 * Punk harness/vest. Boots.
 *
 * CARD RULES:
 * - ViewBox: 200w x 400h (all clans same)
 * - Feet/boots at Y=400 (bottom edge). No padding.
 * - Eye line at ~Y=58
 * - Pointed ears overflow above via overflow:visible
 * - Body mass fills center. Arms overflow sides.
 *
 * Pass 1: Grey fill only.
 */
export default function Nosferatu({ style }) {
  return (
    <svg
      viewBox="0 0 200 400"
      preserveAspectRatio="xMidYMax meet"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{
        width: '100%',
        height: '100%',
        overflow: 'visible',
        ...style,
      }}
    >
      <g fill="#2a2a2a">
        {/* === HEAD — bald, slightly elongated skull === */}
        {/* Cranium */}
        <path d="
          M 100 30
          C 110 30, 118 38, 119 48
          C 120 55, 118 62, 114 67
          L 86 67
          C 82 62, 80 55, 81 48
          C 82 38, 90 30, 100 30 Z
        " />
        {/* Jaw — gaunt, angular. Narrowing to a defined chin */}
        <path d="
          M 86 63
          C 86 68, 87 73, 90 77
          C 93 80, 97 82, 100 83
          C 103 82, 107 80, 110 77
          C 113 73, 114 68, 114 63
          Z
        " />

        {/* === EARS — pointed, swept back. The key silhouette tell. === */}
        {/* Left ear */}
        <path d="
          M 82 46 C 78 40, 73 32, 70 24
          C 74 30, 78 38, 81 44 L 83 52 Z
        " />
        {/* Right ear */}
        <path d="
          M 118 46 C 122 40, 127 32, 130 24
          C 126 30, 122 38, 119 44 L 117 52 Z
        " />

        {/* === NECK — long, thin. Gaunt tendons visible in the narrowness. === */}
        <path d="
          M 93 79 C 92 84, 91 90, 90 98
          L 110 98
          C 109 90, 108 84, 107 79 Z
        " />

        {/* === SHOULDERS + UPPER TORSO === */}
        {/* Angular from the harness/vest. Not rounded — structured. */}
        <path d="
          M 90 98
          C 82 100, 73 104, 66 109
          C 63 111, 62 114, 63 117
          L 68 119
          C 72 120, 74 124, 76 132
          L 76 132
          L 110 98
          Z
        " />
        <path d="
          M 110 98
          C 118 100, 127 104, 134 109
          C 137 111, 138 114, 137 117
          L 132 119
          C 128 120, 126 124, 124 132
          L 124 132
          L 90 98
          Z
        " />

        {/* === TORSO — narrow waist, subtle hip curve === */}
        <path d="
          M 76 132
          C 77 145, 78 158, 80 170
          C 81 178, 82 185, 82 192
          C 82 198, 81 204, 80 210
          L 78 218
          C 76 224, 76 230, 80 236
          L 120 236
          C 124 230, 124 224, 122 218
          L 120 210
          C 119 204, 118 198, 118 192
          C 118 185, 119 178, 120 170
          C 122 158, 123 145, 124 132
          Z
        " />

        {/* === HARNESS DETAIL — cross straps on torso === */}
        {/* These create edge interest where they cross the body outline */}
        <path d="M 78 126 L 82 124 L 112 195 L 108 197 Z" />
        <path d="M 122 126 L 118 124 L 88 195 L 92 197 Z" />
        {/* Waist belt */}
        <path d="M 78 198 L 122 198 L 122 204 L 78 204 Z" />

        {/* === RIGHT ARM (viewer's left) — hanging, relaxed === */}
        <path d="
          M 63 117
          C 59 126, 55 140, 53 158
          C 51 176, 50 194, 50 212
          C 50 226, 50 240, 51 254
          L 58 254
          C 57 240, 56 226, 56 212
          C 56 194, 57 176, 59 158
          C 61 140, 65 126, 68 119
          Z
        " />

        {/* Right hand — elongated fingers. Elegant, predatory. Not claws — fingers. */}
        {/* Thumb */}
        <path d="M 50 252 C 47 256, 44 262, 42 268
          C 44 264, 47 258, 50 254 Z" />
        {/* Index */}
        <path d="M 50 254 C 48 264, 46 276, 44 286
          C 46 278, 48 268, 51 258 Z" />
        {/* Middle — longest */}
        <path d="M 52 254 C 51 266, 50 280, 49 294
          C 51 282, 53 270, 54 258 Z" />
        {/* Ring */}
        <path d="M 54 255 C 54 268, 54 280, 54 290
          C 55 280, 56 268, 56 258 Z" />
        {/* Pinky */}
        <path d="M 56 256 C 57 266, 59 276, 60 282
          C 59 274, 58 264, 57 258 Z" />

        {/* === LEFT ARM (viewer's right) — hand on hip === */}
        {/* Upper arm to elbow */}
        <path d="
          M 137 117
          C 141 126, 146 140, 148 155
          C 149 164, 148 172, 144 178
          L 138 174
          C 140 168, 141 162, 140 153
          C 138 140, 134 128, 132 119
          Z
        " />
        {/* Forearm — elbow back to hip */}
        <path d="
          M 144 178
          C 140 188, 134 198, 128 206
          C 124 212, 122 216, 120 218
          L 124 224
          C 128 218, 134 210, 140 200
          C 144 192, 148 184, 148 180
          Z
        " />

        {/* === LEGS — long. These are almost half the figure. === */}
        {/* Left leg (viewer's left) — free leg, slight angle outward */}
        <path d="
          M 80 236
          C 82 250, 82 266, 80 284
          C 78 302, 78 320, 78 340
          C 77 358, 76 374, 74 390
          L 72 396
          L 68 400 L 84 400 L 88 396
          C 88 382, 88 362, 88 340
          C 88 318, 88 298, 88 280
          C 88 262, 90 246, 92 236
          Z
        " />
        {/* Right leg (viewer's right) — weight leg, straighter */}
        <path d="
          M 108 236
          C 110 246, 112 262, 112 280
          C 112 298, 114 318, 116 340
          C 118 362, 120 382, 120 396
          L 124 400 L 138 400 L 134 396
          C 130 374, 126 358, 124 340
          C 122 320, 122 302, 122 284
          C 122 266, 120 250, 118 236
          Z
        " />

        {/* === BOOTS — chunky, slightly pointed. Practical. === */}
        <path d="M 68 400 L 62 400 C 62 397, 66 394, 70 396 Z" />
        <path d="M 138 400 L 144 400 C 144 397, 138 394, 134 396 Z" />
      </g>
    </svg>
  );
}
