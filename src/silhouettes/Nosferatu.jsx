/**
 * Generic Vampire Silhouette (placeholder for all clans)
 *
 * Reference: Standing vampire in long coat, walking forward,
 * hands out with splayed fingers, boots grounded.
 *
 * CARD RULES:
 * - ViewBox: 200w x 400h (all clans same height)
 * - Feet/boots at Y=400 (bottom edge). No padding.
 * - Eye line at ~Y=55 (14% from top)
 * - Accents (hat brim, coat tails) can overflow via overflow:visible
 * - Body mass fills center. Arms/coat overflow sides.
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
        {/* Head — slightly forward, intense */}
        <ellipse cx="100" cy="42" rx="16" ry="20" />

        {/* Hair / swept back volume */}
        <path d={`
          M 84 38 C 82 28, 86 18, 96 14
          C 106 10, 116 14, 120 22
          C 122 28, 120 36, 116 40
          C 112 34, 104 30, 96 32
          C 90 34, 86 36, 84 38 Z
        `} />

        {/* Neck */}
        <path d={`
          M 92 58 L 92 68 L 108 68 L 108 58 Z
        `} />

        {/* Shoulders + upper coat — broad, structured */}
        <path d={`
          M 92 66
          L 58 76
          C 52 78, 48 82, 48 88
          L 48 96
          L 70 90
          L 70 100
          L 56 104

          L 56 160
          C 58 170, 62 178, 66 184
          L 72 200

          L 80 240
          L 84 260

          L 84 270
          L 116 270
          L 116 260

          L 120 240
          L 128 200

          C 132 190, 136 178, 140 168
          L 144 160

          L 144 104
          L 130 100
          L 130 90
          L 152 96
          L 152 88
          C 152 82, 148 78, 142 76
          L 108 66
          Z
        `} />

        {/* Left arm — out to the side, substantial */}
        <path d={`
          M 56 104
          C 42 114, 28 130, 18 148
          C 14 156, 10 164, 8 170
          L 4 178
          L 14 178
          C 18 168, 24 156, 32 144
          C 42 130, 52 118, 60 112
          Z
        `} />

        {/* Left hand — fingers splayed, thick enough to see */}
        <path d="M 6 172 L -12 162 L -18 156 L -10 162 L 4 172 Z" />
        <path d="M 4 176 L -14 174 L -20 172 L -10 172 L 4 176 Z" />
        <path d="M 4 180 L -12 184 L -18 188 L -8 182 L 6 178 Z" />
        <path d="M 8 182 L -4 194 L -6 200 L 0 192 L 8 182 Z" />

        {/* Right arm — out to the other side, substantial */}
        <path d={`
          M 144 104
          C 158 114, 172 130, 182 148
          C 186 156, 190 164, 192 170
          L 196 178
          L 186 178
          C 182 168, 176 156, 168 144
          C 158 130, 148 118, 140 112
          Z
        `} />

        {/* Right hand — fingers splayed, thick enough to see */}
        <path d="M 194 172 L 212 162 L 218 156 L 210 162 L 196 172 Z" />
        <path d="M 196 176 L 214 174 L 220 172 L 210 172 L 196 176 Z" />
        <path d="M 196 180 L 212 184 L 218 188 L 208 182 L 194 178 Z" />
        <path d="M 192 182 L 204 194 L 206 200 L 200 192 L 192 182 Z" />

        {/* Long coat — flowing below waist, gives mass */}
        <path d={`
          M 72 200
          C 68 220, 62 250, 56 280
          C 50 310, 44 340, 38 370
          L 34 386
          L 30 396
          L 36 400
          L 50 400
          L 56 396
          C 60 380, 64 360, 68 340
          C 72 320, 76 300, 80 282

          L 84 270
          L 88 282

          L 90 330
          L 90 370
          L 88 390
          L 86 396
          L 92 400
          L 108 400
          L 114 396
          L 112 390

          L 110 370
          L 110 330
          L 112 282

          L 116 270
          L 120 282

          C 124 300, 128 320, 132 340
          C 136 360, 140 380, 144 396
          L 150 400
          L 166 400
          L 170 396
          L 162 370
          C 156 340, 150 310, 144 280
          C 138 250, 132 220, 128 200
          Z
        `} />

        {/* Coat flare — left side drama */}
        <path d={`
          M 56 280
          C 48 290, 38 300, 28 310
          C 22 318, 18 328, 16 340
          C 14 352, 16 364, 22 376
          L 30 388
          L 34 386
          C 38 370, 44 350, 50 330
          C 54 310, 56 294, 56 280
          Z
        `} />

        {/* Coat flare — right side */}
        <path d={`
          M 144 280
          C 152 290, 162 300, 172 310
          C 178 318, 182 328, 184 340
          C 186 352, 184 364, 178 376
          L 170 388
          L 166 386
          C 162 370, 156 350, 150 330
          C 146 310, 144 294, 144 280
          Z
        `} />
      </g>
    </svg>
  );
}
