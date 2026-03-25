/**
 * Pentagram — ritual floor graphic + silhouette carousel.
 *
 * ARCHITECTURE — ONE MOTION SYSTEM:
 * The pentagram CSS transition is the DRIVER. It's the only thing
 * that transitions. The silhouettes have NO independent transitions.
 * Instead, on every animation frame, we read where the dots actually
 * are on screen and position the silhouettes there. The silhouettes
 * follow the dots like shadows — same speed, same curve, same feel.
 *
 * LIGHTING SYSTEM:
 * A floor-level light source at the pentagram's center uplights all
 * silhouettes. The glow sits on the floor plane, so shadows push
 * upward on every character. The pentagram lines themselves radiate
 * from a bright center to dim edges — magically imbued from within.
 *
 * CANDLE CLUSTER:
 * Candles are separate screen-space elements, NOT inside the pentagram
 * SVG. Each candle has an invisible anchor dot on the pentagram floor
 * near center. The candles track those dots via rAF (same system as
 * silhouettes) but stand vertically — they don't tilt with the floor.
 * On rotation, the 3D-projected positions shift differently per candle,
 * creating natural parallax and overlap.
 *
 * Pass 1: Grey only. No clan colors.
 */
import { useRef, useState, useEffect, useCallback } from 'react';
import SilhouetteLoader from '../silhouettes/SilhouetteLoader.jsx';

// Star line connections (tip-to-tip, skipping one)
function starLines(cx, cy, r) {
  const tips = [];
  for (let i = 0; i < 5; i++) {
    const angle = -Math.PI / 2 + (i * 2 * Math.PI) / 5;
    tips.push([cx + r * Math.cos(angle), cy + r * Math.sin(angle)]);
  }
  const order = [0, 2, 4, 1, 3, 0];
  return order.map((i) => `${tips[i][0].toFixed(1)},${tips[i][1].toFixed(1)}`).join(' ');
}

// Full 10-point star outline
function pentagramPoints(cx, cy, outerR, innerR) {
  const pts = [];
  for (let i = 0; i < 5; i++) {
    const outerAngle = -Math.PI / 2 + (i * 2 * Math.PI) / 5;
    const innerAngle = outerAngle + Math.PI / 5;
    pts.push([cx + outerR * Math.cos(outerAngle), cy + outerR * Math.sin(outerAngle)]);
    pts.push([cx + innerR * Math.cos(innerAngle), cy + innerR * Math.sin(innerAngle)]);
  }
  return pts.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
}

const CX = 200;
const CY = 200;
const R = 180;
const INNER_R = R * 0.382;
const TILT_DEG = 80;

// Candle definitions — offsets from pentagram center in SVG coords.
// Spread in a noisy cluster so they parallax on rotation.
// Heights are deliberately irregular — no two adjacent candles
// should align to the same height or form visible lines.
const CANDLES = [
  { dx: -4,  dy: -6,  height: 44, width: 9,  flameH: 16, id: 'c0' },
  { dx: 12,  dy: -10, height: 28, width: 7,  flameH: 12, id: 'c1' },
  { dx: -18, dy: -2,  height: 36, width: 8,  flameH: 15, id: 'c2' },
  { dx: 8,   dy: 2,   height: 32, width: 7,  flameH: 13, id: 'c3' },
  { dx: -10, dy: 6,   height: 20, width: 6,  flameH: 10, id: 'c4' },
  { dx: 16,  dy: 4,   height: 24, width: 6,  flameH: 11, id: 'c5' },
  { dx: -22, dy: 9,   height: 15, width: 5,  flameH: 8,  id: 'c6' },
  { dx: 2,   dy: 8,   height: 18, width: 6,  flameH: 9,  id: 'c7' },
  { dx: 20,  dy: 8,   height: 22, width: 6,  flameH: 10, id: 'c8' },
  { dx: -6,  dy: -12, height: 26, width: 7,  flameH: 11, id: 'c9' },
  { dx: 6,   dy: 12,  height: 12, width: 5,  flameH: 7,  id: 'c10' },
  { dx: -14, dy: 10,  height: 16, width: 5,  flameH: 8,  id: 'c11' },
];

export default function Pentagram({ activeIndex = 0, rotationDeg = 0, silhouettes = [], clanIds = [], transitioning = false }) {
  const parentRotation = 180 - rotationDeg;
  const containerRef = useRef(null);
  const dotRefs = useRef([]);
  const centerRef = useRef(null);
  const candleRefs = useRef([]);
  const rafRef = useRef(null);
  const [dotPositions, setDotPositions] = useState([]);
  const [centerPos, setCenterPos] = useState(null);
  const [candlePositions, setCandlePositions] = useState([]);

  // Read dot positions from the DOM — called every animation frame during transitions
  const readPositions = useCallback(() => {
    const screen = containerRef.current?.closest('.screen');
    if (!screen) return;
    const screenRect = screen.getBoundingClientRect();

    const positions = dotRefs.current.map((dot) => {
      if (!dot) return { x: 50, y: 50 };
      const r = dot.getBoundingClientRect();
      return {
        x: ((r.left + r.right) / 2 - screenRect.left) / screenRect.width * 100,
        y: ((r.top + r.bottom) / 2 - screenRect.top) / screenRect.height * 100,
      };
    });

    setDotPositions(positions);

    // Track center point for lighting
    const cd = centerRef.current;
    if (cd) {
      const cr = cd.getBoundingClientRect();
      setCenterPos({
        x: ((cr.left + cr.right) / 2 - screenRect.left) / screenRect.width * 100,
        y: ((cr.top + cr.bottom) / 2 - screenRect.top) / screenRect.height * 100,
      });
    }

    // Track candle anchor positions
    const cPositions = candleRefs.current.map((dot) => {
      if (!dot) return { x: 50, y: 50 };
      const r = dot.getBoundingClientRect();
      return {
        x: ((r.left + r.right) / 2 - screenRect.left) / screenRect.width * 100,
        y: ((r.top + r.bottom) / 2 - screenRect.top) / screenRect.height * 100,
      };
    });
    setCandlePositions(cPositions);
  }, []);

  // On every rotation change, start an rAF loop that tracks dot positions
  // for the duration of the CSS transition. The silhouettes follow frame-by-frame.
  useEffect(() => {
    const TRANSITION_MS = 450; // slightly longer than the 400ms CSS transition
    const startTime = performance.now();

    function tick() {
      readPositions();
      if (performance.now() - startTime < TRANSITION_MS) {
        rafRef.current = requestAnimationFrame(tick);
      }
    }

    // Start tracking
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [rotationDeg, readPositions]);

  // Floor-level light position — the glow sits on the pentagram floor,
  // below all characters. We offset the tracked center down toward the
  // front character's feet so all shadows push upward (uplight).
  const floorLightPos = centerPos ? {
    x: centerPos.x,
    y: centerPos.y + 18,
  } : null;

  // Compute uplight style for a silhouette based on its position
  // relative to the floor light. All characters get shadows that
  // push upward — light is below them on the floor plane.
  function getLightStyle(pos, depthNorm) {
    if (!floorLightPos) return '';

    // Vector from floor light to silhouette
    const dx = pos.x - floorLightPos.x;
    const dy = pos.y - floorLightPos.y;
    const angle = Math.atan2(dy, dx);

    // Tight rim light — small offset, minimal blur.
    // The reference: razor-thin edge catch, not a soft halo.
    const dist = 1 + depthNorm * 1.5;   // front: 2.5px, back: 1px
    const blur = 1 + depthNorm * 2;     // front: 3px, back: 1px — crisp edge
    const alpha = 0.05 + depthNorm * 0.4; // front: 0.45, back: 0.05 — barely there in back

    // Dim during transition — light is "resetting" between clans
    const dimFactor = transitioning ? 0.3 : 1;
    const finalAlpha = alpha * dimFactor;

    // Shadow offsets TOWARD the light source. CSS drop-shadow renders
    // the glow on the side it's offset to — so pushing toward the light
    // puts the glow on the edge facing the candles. Not away from them.
    const shadowX = -Math.cos(angle) * dist;
    const shadowY = -Math.sin(angle) * dist;

    // Warm grey — not pure white. Candlelight even in monochrome.
    return `drop-shadow(${shadowX.toFixed(1)}px ${shadowY.toFixed(1)}px ${blur.toFixed(1)}px rgba(180,170,155,${finalAlpha.toFixed(2)}))`;
  }

  return (
    <>
      {/* Floor glow — the ritual light source.
          Positioned on the pentagram floor plane, below all characters.
          All silhouettes are uplit from this point. */}
      {floorLightPos && (
        <div
          className="pentagram-glow"
          style={{
            left: `${floorLightPos.x}%`,
            top: `${floorLightPos.y}%`,
            opacity: transitioning ? 0.08 : 0.35,
          }}
        />
      )}

      {/* Pentagram floor — the ONE thing that transitions */}
      <div className="pentagram-container" ref={containerRef}>
        <div
          className="pentagram-perspective"
          style={{
            transform: `rotateX(${TILT_DEG}deg) rotate(${parentRotation}deg)`,
          }}
        >
          <svg
            viewBox="0 0 400 400"
            xmlns="http://www.w3.org/2000/svg"
            className="pentagram-svg"
          >
            {/* Radial gradient — bright center, dim at edges.
                The pentagram glows from within, magically imbued. */}
            <defs>
              <radialGradient id="pentagram-glow-grad" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#666" />
                <stop offset="40%" stopColor="#444" />
                <stop offset="100%" stopColor="#222" />
              </radialGradient>
              <radialGradient id="pentagram-star-grad" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#888" />
                <stop offset="35%" stopColor="#555" />
                <stop offset="100%" stopColor="#333" />
              </radialGradient>
              <radialGradient id="pentagram-fill-grad" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="rgba(200,200,200,0.06)" />
                <stop offset="100%" stopColor="rgba(200,200,200,0)" />
              </radialGradient>
            </defs>

            {/* Subtle center fill — floor glow on the pentagram plane */}
            <circle cx={CX} cy={CY} r={R} fill="url(#pentagram-fill-grad)" />

            <circle cx={CX} cy={CY} r={R}
              fill="none" stroke="url(#pentagram-glow-grad)" strokeWidth="0.75" opacity="0.4" />
            <circle cx={CX} cy={CY} r={INNER_R}
              fill="none" stroke="url(#pentagram-glow-grad)" strokeWidth="0.5" opacity="0.3" />
            <polygon points={starLines(CX, CY, R)}
              fill="none" stroke="url(#pentagram-star-grad)" strokeWidth="1.25"
              strokeLinejoin="round" opacity="0.6" />
            <polygon points={pentagramPoints(CX, CY, R, INNER_R)}
              fill="none" stroke="url(#pentagram-glow-grad)" strokeWidth="0.5" opacity="0.3" />

            {/* Center reference point — invisible, tracked for lighting */}
            <circle
              ref={centerRef}
              cx={CX}
              cy={CY}
              r={2}
              fill="none"
            />

            {/* Candle anchor dots — invisible, on the floor near center.
                Each candle tracks its anchor via rAF for parallax. */}
            {CANDLES.map((c, i) => (
              <circle
                key={c.id}
                ref={(el) => { candleRefs.current[i] = el; }}
                cx={CX + c.dx}
                cy={CY + c.dy}
                r={1}
                fill="none"
              />
            ))}

            {/* Anchor dots — these are what we track */}
            {Array.from({ length: 5 }, (_, i) => {
              const angle = -Math.PI / 2 + (i * 2 * Math.PI) / 5;
              const x = CX + R * Math.cos(angle);
              const y = CY + R * Math.sin(angle);
              return (
                <circle
                  key={i}
                  ref={(el) => { dotRefs.current[i] = el; }}
                  cx={x.toFixed(1)}
                  cy={y.toFixed(1)}
                  r={4}
                  fill="#555"
                  className="pentagram-anchor"
                  style={{
                    opacity: i === activeIndex ? 0.7 : 0,
                    transition: 'opacity 500ms ease',
                  }}
                />
              );
            })}
          </svg>
        </div>
      </div>

      {/* Candles — screen-space, standing vertical.
          Positioned at tracked floor anchors. Parallax from 3D projection.
          Z-index from Y position so they overlap naturally. */}
      {candlePositions.length === CANDLES.length && CANDLES.map((candle, i) => {
        const pos = candlePositions[i];
        if (!pos) return null;

        // Z-index: candles sit on the floor, behind all silhouettes.
        // Silhouettes use z-index 0-10. Candles stay at 2-4 so the
        // front character (z-index ~10) always obscures them.
        // Within the cluster, lower Y (further back) = lower z.
        const zIndex = 2 + Math.round((pos.y / 100) * 2);
        // Scale candles slightly by depth — further = smaller
        const depthScale = 0.7 + (pos.y / 100) * 0.4;
        const w = candle.width * depthScale * 0.6;
        const h = (candle.height + candle.flameH) * depthScale * 0.6;

        return (
          <div
            key={candle.id}
            className="candle-slot"
            style={{
              left: `${pos.x}%`,
              top: `${pos.y}%`,
              width: `${w}px`,
              height: `${h}px`,
              transform: 'translate(-50%, -100%)',
              zIndex,
            }}
          >
            <svg
              viewBox={`0 0 ${candle.width} ${candle.height + candle.flameH}`}
              preserveAspectRatio="xMidYMax meet"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Flame glow filter */}
              <defs>
                <filter id={`fg-${candle.id}`} x="-100%" y="-100%" width="300%" height="300%">
                  <feGaussianBlur in="SourceGraphic" stdDeviation="1.5" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
                <radialGradient id={`fgrad-${candle.id}`} cx="50%" cy="40%" r="50%">
                  <stop offset="0%" stopColor="#ddd8cc" />
                  <stop offset="60%" stopColor="#b0a898" />
                  <stop offset="100%" stopColor="#887860" />
                </radialGradient>
              </defs>

              {/* Candle body */}
              <rect
                x={0}
                y={candle.flameH}
                width={candle.width}
                height={candle.height}
                rx={1}
                fill="#1a1816"
              />
              {/* Wax top */}
              <ellipse
                cx={candle.width / 2}
                cy={candle.flameH}
                rx={candle.width / 2 + 0.5}
                ry={candle.width * 0.2}
                fill="#222018"
              />

              {/* Flame */}
              <g filter={`url(#fg-${candle.id})`}>
                <path
                  className="candle-flame"
                  d={`M${candle.width / 2} ${candle.flameH} Q${candle.width / 2 - 2.5} ${candle.flameH * 0.5} ${candle.width / 2} 0 Q${candle.width / 2 + 2.5} ${candle.flameH * 0.5} ${candle.width / 2} ${candle.flameH} Z`}
                  fill={`url(#fgrad-${candle.id})`}
                  opacity="0.85"
                />
              </g>
            </svg>
          </div>
        );
      })}

      {/* Silhouettes — NO transitions. Positioned directly at dot locations
          every frame. Movement comes from tracking the pentagram.
          Directional lighting applied via drop-shadow from central light. */}
      {dotPositions.length === 5 && silhouettes.map((Silhouette, i) => {
        if (!Silhouette) return null;
        const pos = dotPositions[i];

        // Normalize depth: front dot (~85%) → 1.0, back dot (~58%) → 0.0
        const depthNorm = Math.max(0, Math.min(1, (pos.y - 58) / 27));
        // Scale: front = 1.4, back = 0.625 (perspective depth, front exaggerated)
        const silScale = 0.625 + depthNorm * 0.775;
        // Brightness: 75% front → 18% back
        // Back characters are dark shapes, barely visible. Not reflective ghosts.
        const brightness = 0.18 + depthNorm * 0.57;
        // All on-screen silhouettes visible
        const opacity = depthNorm > 0.05 ? 1 : 0;
        const zIndex = Math.round(depthNorm * 10);

        // Directional light from pentagram center
        const shadowFilter = getLightStyle(pos, depthNorm);

        return (
          <div
            key={i}
            className="silhouette-slot"
            style={{
              left: `${pos.x}%`,
              top: `${pos.y}%`,
              transform: `translate(-50%, -100%) scale(${silScale})`,
              opacity,
              filter: `brightness(${brightness}) ${shadowFilter}`,
              zIndex,
              // NO transition — position is updated every frame by rAF
            }}
          >
            <SilhouetteLoader
              clanId={clanIds[i] || ''}
              FallbackSVG={Silhouette}
            />
          </div>
        );
      })}
    </>
  );
}
