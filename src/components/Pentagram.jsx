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
import CLANS from '../data/clans.js';

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
// Trimmed from 12 to 8 for mobile perf — kept the tallest/best spread.
// 8 candles × 2 smoke columns = 16 animated elements (was 36).
const CANDLES = [
  { dx: -4,  dy: -6,  height: 44, width: 9,  flameH: 16, id: 'c0' },
  { dx: 12,  dy: -10, height: 28, width: 7,  flameH: 12, id: 'c1' },
  { dx: -18, dy: -2,  height: 36, width: 8,  flameH: 15, id: 'c2' },
  { dx: 8,   dy: 2,   height: 32, width: 7,  flameH: 13, id: 'c3' },
  { dx: 16,  dy: 4,   height: 24, width: 6,  flameH: 11, id: 'c5' },
  { dx: -6,  dy: -12, height: 26, width: 7,  flameH: 11, id: 'c9' },
  { dx: 20,  dy: 8,   height: 22, width: 6,  flameH: 10, id: 'c8' },
  { dx: -10, dy: 6,   height: 20, width: 6,  flameH: 10, id: 'c4' },
];

// Lerp a single number
function lerp(a, b, t) { return a + (b - a) * t; }

// Lerp a hex color string (#rrggbb)
function lerpColor(a, b, t) {
  const ar = parseInt((a || '#c8bfb0').slice(1, 3), 16);
  const ag = parseInt((a || '#c8bfb0').slice(3, 5), 16);
  const ab = parseInt((a || '#c8bfb0').slice(5, 7), 16);
  const br = parseInt((b || '#c8bfb0').slice(1, 3), 16);
  const bg = parseInt((b || '#c8bfb0').slice(3, 5), 16);
  const bb = parseInt((b || '#c8bfb0').slice(5, 7), 16);
  const r = Math.round(lerp(ar, br, t)).toString(16).padStart(2, '0');
  const g = Math.round(lerp(ag, bg, t)).toString(16).padStart(2, '0');
  const bv = Math.round(lerp(ab, bb, t)).toString(16).padStart(2, '0');
  return `#${r}${g}${bv}`;
}

// Lerp between two spotlight configs
function lerpSpot(from, to, t) {
  if (!from && !to) return {};
  const f = from || to;
  const tgt = to || from;
  return {
    x: lerp(f.x ?? -0.5, tgt.x ?? -0.5, t),
    y: lerp(f.y ?? 1.0, tgt.y ?? 1.0, t),
    z: lerp(f.z ?? 1.5, tgt.z ?? 1.5, t),
    targetX: lerp(f.targetX ?? 0, tgt.targetX ?? 0, t),
    targetY: lerp(f.targetY ?? 0.5, tgt.targetY ?? 0.5, t),
    intensity: lerp(f.intensity ?? 3.0, tgt.intensity ?? 3.0, t),
    angle: lerp(f.angle ?? 0.3, tgt.angle ?? 0.3, t),
    penumbra: lerp(f.penumbra ?? 0.5, tgt.penumbra ?? 0.5, t),
    color: lerpColor(f.color, tgt.color, t),
  };
}

// Ease-in-out for smooth transitions
function easeInOut(t) {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

export default function Pentagram({ activeIndex = 0, prevActiveIndex = 0, rotationDeg = 0, silhouettes = [], clanIds = [], transitioning = false, devLightScale = 1.0, devNormalScale = 1.5, devRoughness = 0.4, devSpot = {}, devTint = {}, devLineWeight = 0.5, devLineSmooth = 0.15, devRimDarkness = 0.0, devRimWidth = 0.5 }) {
  const parentRotation = 180 - rotationDeg;
  const containerRef = useRef(null);
  const dotRefs = useRef([]);
  const centerRef = useRef(null);
  const candleRefs = useRef([]);
  const rafRef = useRef(null);
  // Candle/center positions use refs — they don't need to trigger React re-renders.
  // Only dot positions and lerpT trigger re-renders (silhouette placement).
  const [dotPositions, setDotPositions] = useState([]);
  const centerPosRef = useRef(null);
  const candlePosRef = useRef([]);
  const [candlePositions, setCandlePositions] = useState([]);
  const [lerpT, setLerpT] = useState(1); // 0 = at prev clan, 1 = at active clan

  // Read all positions in one batched DOM read — called every animation frame.
  // All getBoundingClientRect calls happen together before any state updates
  // to avoid interleaved layout thrashing.
  const readPositions = useCallback(() => {
    const screen = containerRef.current?.closest('.screen');
    if (!screen) return;
    const screenRect = screen.getBoundingClientRect();
    const sl = screenRect.left, st = screenRect.top;
    const sw = screenRect.width, sh = screenRect.height;

    // Batch all DOM reads first (no state updates between reads)
    const dotRects = dotRefs.current.map(d => d?.getBoundingClientRect());
    const centerRect = centerRef.current?.getBoundingClientRect();
    const candleRects = candleRefs.current.map(d => d?.getBoundingClientRect());

    // Convert to percentages
    const toPos = (r) => r ? {
      x: ((r.left + r.right) / 2 - sl) / sw * 100,
      y: ((r.top + r.bottom) / 2 - st) / sh * 100,
    } : { x: 50, y: 50 };

    // Now set state (single batch)
    setDotPositions(dotRects.map(toPos));
    centerPosRef.current = centerRect ? toPos(centerRect) : null;

    const cPos = candleRects.map(toPos);
    candlePosRef.current = cPos;
    setCandlePositions(cPos);
  }, []);

  // On every rotation change, start an rAF loop that tracks dot positions
  // for the duration of the CSS transition. The silhouettes follow frame-by-frame.
  useEffect(() => {
    const TRANSITION_MS = 620; // slightly longer than the 552ms CSS transition
    const startTime = performance.now();

    let lastTick = 0;
    function tick(now) {
      // Throttle to ~30fps (33ms) — saves half the DOM reads + renders
      if (now - lastTick < 33) {
        const elapsed = now - startTime;
        if (elapsed < TRANSITION_MS) {
          rafRef.current = requestAnimationFrame(tick);
        }
        return;
      }
      lastTick = now;
      readPositions();
      const elapsed = now - startTime;
      const t = Math.min(1, elapsed / TRANSITION_MS);
      setLerpT(easeInOut(t));
      if (elapsed < TRANSITION_MS) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        setLerpT(1);
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
  const cp = centerPosRef.current;
  const floorLightPos = cp ? {
    x: cp.x,
    y: cp.y + 18,
  } : null;

  // Compute uplight style for a silhouette based on its position
  // CSS drop-shadow rim light removed — it created a fuzzy halo
  // around every character that looked like a bad cutout artifact.
  // All lighting is now handled inside the Three.js shader
  // (spotlight, normal map, rim darkening). No CSS light effects.

  // Get effective lighting for a clan — checks localStorage (vss-settings)
  // for the active slot, falls back to CLANS defaults.
  function getEffectiveLighting(clanIndex) {
    const clanId = CLANS[clanIndex]?.id;
    try {
      const store = JSON.parse(localStorage.getItem('vss-settings') || '{}');
      const clanData = store[clanId];
      if (clanData?.active && clanData.slots?.[clanData.active]) {
        const saved = clanData.slots[clanData.active];
        return {
          normalScale: saved.normalScale ?? 1.5,
          roughness: saved.roughness ?? 0.4,
          lightScale: saved.lightScale ?? 1.0,
          tint: saved.tint || { color: '#000000', opacity: 0 },
          spots: [saved.spot || {}],
          lineWeight: saved.lineWeight ?? 0.5,
          lineSmooth: saved.lineSmooth ?? 0.15,
          rimDarkness: saved.rimDarkness ?? 0.0,
          rimWidth: saved.rimWidth ?? 0.5,
        };
      }
    } catch (e) { /* ignore */ }
    return CLANS[clanIndex]?.lighting || {};
  }

  // Compute lerped spotlight config between prev and active clan.
  // During transition (lerpT < 1): interpolate using effective configs.
  // At rest (lerpT >= 1): use dev slider overrides for live tuning.
  const prevEffective = getEffectiveLighting(prevActiveIndex);
  const activeEffective = getEffectiveLighting(activeIndex);

  // Lerp all spots (up to 3) between prev and active clan
  const maxSpots = Math.max(prevEffective.spots?.length || 0, activeEffective.spots?.length || 0, 1);
  const lerpedSpots = [];
  for (let s = 0; s < maxSpots; s++) {
    const prev = prevEffective.spots?.[s] || {};
    const active = activeEffective.spots?.[s] || {};
    lerpedSpots.push(lerpT >= 1 ? (s === 0 ? devSpot : active) : lerpSpot(prev, active, lerpT));
  }

  const lerpedNormalScale = lerpT >= 1 ? devNormalScale : lerp(prevEffective.normalScale ?? 1.5, activeEffective.normalScale ?? 1.5, lerpT);
  const lerpedRoughness = lerpT >= 1 ? devRoughness : lerp(prevEffective.roughness ?? 0.4, activeEffective.roughness ?? 0.4, lerpT);
  const lerpedLightScale = lerpT >= 1 ? devLightScale : lerp(prevEffective.lightScale ?? 1.0, activeEffective.lightScale ?? 1.0, lerpT);
  const prevTint = prevEffective.tint || {};
  const activeTint = activeEffective.tint || {};
  const lerpedTint = lerpT >= 1 ? devTint : {
    color: lerpColor(prevTint.color || '#000000', activeTint.color || '#000000', lerpT),
    opacity: lerp(prevTint.opacity ?? 0, activeTint.opacity ?? 0, lerpT),
  };
  const lerpedLineWeight = lerpT >= 1 ? devLineWeight : lerp(prevEffective.lineWeight ?? 0.5, activeEffective.lineWeight ?? 0.5, lerpT);
  const lerpedLineSmooth = lerpT >= 1 ? devLineSmooth : lerp(prevEffective.lineSmooth ?? 0.15, activeEffective.lineSmooth ?? 0.15, lerpT);
  const lerpedRimDarkness = lerpT >= 1 ? devRimDarkness : lerp(prevEffective.rimDarkness ?? 0.0, activeEffective.rimDarkness ?? 0.0, lerpT);
  const lerpedRimWidth = lerpT >= 1 ? devRimWidth : lerp(prevEffective.rimWidth ?? 0.5, activeEffective.rimWidth ?? 0.5, lerpT);

  // Lerped clan accent color — drives pentagram lines, candle flames, backdrop
  const prevAccent = CLANS[prevActiveIndex]?.accent || '#333';
  const activeAccent = CLANS[activeIndex]?.accent || '#333';
  const lerpedAccent = lerpColor(prevAccent, activeAccent, lerpT);

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
            opacity: transitioning ? 0.15 : 0.55,
            '--glow-color': lerpColor('#c8c0b0', lerpedAccent, 0.5),
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
                The pentagram glows from within, tinted to clan accent. */}
            <defs>
              <radialGradient id="pentagram-glow-grad" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor={lerpColor('#888', lerpedAccent, 0.6)} />
                <stop offset="40%" stopColor={lerpColor('#555', lerpedAccent, 0.4)} />
                <stop offset="100%" stopColor={lerpColor('#2a2a2a', lerpedAccent, 0.2)} />
              </radialGradient>
              <radialGradient id="pentagram-star-grad" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor={lerpColor('#aaa', lerpedAccent, 0.5)} />
                <stop offset="35%" stopColor={lerpColor('#666', lerpedAccent, 0.4)} />
                <stop offset="100%" stopColor={lerpColor('#383838', lerpedAccent, 0.2)} />
              </radialGradient>
              <radialGradient id="pentagram-fill-grad" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor={lerpedAccent} stopOpacity="0.35" />
                <stop offset="70%" stopColor={lerpedAccent} stopOpacity="0.15" />
                <stop offset="100%" stopColor={lerpedAccent} stopOpacity="0" />
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

            {/* Candle floor circles — visible rings on the pentagram plane
                that anchor each candle visually to the ground. */}
            {CANDLES.map((c) => (
              <circle
                key={`ring-${c.id}`}
                cx={CX + c.dx}
                cy={CY + c.dy}
                r={c.width * 0.8}
                fill="none"
                stroke={lerpColor('#b4af9f', lerpedAccent, 0.5)}
                opacity={0.2}
                strokeWidth="0.5"
              />
            ))}

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
                  fill={lerpedAccent}
                  className="pentagram-anchor"
                  style={{
                    opacity: i === activeIndex ? 0.8 : 0.15,
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
      {/* Compute candle flame colors from the active tint */}
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
        const w = candle.width * depthScale * 0.7;
        const h = (candle.height + candle.flameH * 1.4) * depthScale * 0.7;

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
              viewBox={`0 0 ${candle.width} ${candle.height + candle.flameH * 1.4}`}
              preserveAspectRatio="xMidYMax meet"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Flame glow filter */}
              <defs>
                <filter id={`fg-${candle.id}`} x="-150%" y="-150%" width="400%" height="400%">
                  <feGaussianBlur in="SourceGraphic" stdDeviation="3.5" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
                <radialGradient id={`fgrad-${candle.id}`} cx="50%" cy="35%" r="55%">
                  <stop offset="0%" stopColor={lerpColor('#ffffff', lerpedAccent, 0.15)} />
                  <stop offset="40%" stopColor={lerpColor('#fff0d0', lerpedAccent, 0.3)} />
                  <stop offset="100%" stopColor={lerpColor('#cc9850', lerpedAccent, 0.5)} />
                </radialGradient>
                {/* Wax body gradient — dark at base, lit near flame */}
                <linearGradient id={`wax-${candle.id}`} x1="0" y1="1" x2="0" y2="0">
                  <stop offset="0%" stopColor="#1a1816" />
                  <stop offset="40%" stopColor="#3a3530" />
                  <stop offset="85%" stopColor="#706858" />
                  <stop offset="100%" stopColor="#8a8070" />
                </linearGradient>
              </defs>

              {/* Candle body — dark base fading to lit wax near flame */}
              <rect
                x={0}
                y={candle.flameH * 1.4}
                width={candle.width}
                height={candle.height}
                rx={1}
                fill={`url(#wax-${candle.id})`}
              />
              {/* Wax top — warm but subdued, catches flame light */}
              <ellipse
                cx={candle.width / 2}
                cy={candle.flameH * 1.4}
                rx={candle.width / 2 + 0.5}
                ry={candle.width * 0.2}
                fill="#8a8070"
              />

              {/* Flame — taller, wider, brighter */}
              <g filter={`url(#fg-${candle.id})`}>
                <path
                  className="candle-flame"
                  d={`M${candle.width / 2} ${candle.flameH * 1.4} Q${candle.width / 2 - 3.5} ${candle.flameH * 0.65} ${candle.width / 2} 0 Q${candle.width / 2 + 3.5} ${candle.flameH * 0.65} ${candle.width / 2} ${candle.flameH * 1.4} Z`}
                  fill={`url(#fgrad-${candle.id})`}
                  opacity="1"
                />
              </g>
            </svg>
            {/* Smoke wisps — rising incense trails from each candle.
                3 wisps per candle, staggered delays, CSS-animated.
                Grey only (monochrome safe). Compositional element to
                add atmosphere and help pop the front character. */}
            {[0, 1].map((wi) => (
              <div
                key={`smoke-${candle.id}-${wi}`}
                className={`candle-smoke candle-smoke--${wi}`}
                style={{
                  '--smoke-seed': ((i * 3 + wi) * 137.5) % 360,
                  '--smoke-color': lerpedAccent,
                }}
              />
            ))}
          </div>
        );
      })}

      {/* Graphic backdrop removed — replaced by smoke columns + pentagram fill */}

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
        // Brightness curve: aggressive contrast.
        // Front character: strong value range for key light to carve.
        // Background figures: crushed into near-black silhouettes —
        // barely visible, no internal lighting competing with main char.
        const brightness = i === activeIndex
          ? 0.20 + depthNorm * 0.60
          : 0.10 + depthNorm * 0.12;
        // All on-screen silhouettes visible
        const opacity = depthNorm > 0.05 ? 1 : 0;
        const zIndex = Math.round(depthNorm * 10);

        // Three.js light direction — convert screen-space floor light
        // position to a 3D vector relative to this sprite.
        // X: horizontal offset (screen % mapped to -2..2 range)
        // Y: vertical offset (inverted — screen Y down, Three.js Y up)
        // Z: depth. Slightly in front for fill, behind for rim.
        const lightDir = floorLightPos ? {
          x: (floorLightPos.x - pos.x) * 0.04,
          y: (pos.y - floorLightPos.y) * -0.04,
          z: 0.8 + depthNorm * 0.4,
        } : { x: 0, y: -1, z: 0.5 };

        // Light intensity: front character scales with dev lightScale.
        // Background figures get a fixed subtle fill — NOT scaled by
        // lightScale so they're always readable regardless of per-clan tuning.
        const lightIntensity = i === activeIndex
          ? (0.8 + depthNorm * 2.0) * lerpedLightScale
          : 0.6 + depthNorm * 0.4;

        return (
          <div
            key={i}
            className="silhouette-slot"
            style={{
              left: `${pos.x}%`,
              top: `${pos.y}%`,
              transform: `translate(-50%, -100%) scale(${silScale})`,
              opacity,
              filter: `brightness(${brightness})`,
              zIndex,
              // NO transition — position is updated every frame by rAF
            }}
          >
            {/* Each slot uses its OWN clan's texture preset.
                Only the active/front character gets lerped + dev overrides. */}
            <SilhouetteLoader
              clanId={clanIds[i] || ''}
              FallbackSVG={Silhouette}
              lightDir={lightDir}
              lightIntensity={lightIntensity}
              normalScale={i === activeIndex ? lerpedNormalScale : (CLANS[i]?.lighting?.normalScale ?? 1.5)}
              roughness={i === activeIndex ? lerpedRoughness : (CLANS[i]?.lighting?.roughness ?? 0.4)}
              spotActive={i === activeIndex}
              spotPos={{ spots: lerpedSpots }}
              tint={i === activeIndex ? lerpedTint : (CLANS[i]?.lighting?.tint || { color: '#000000', opacity: 0 })}
              lineWeight={i === activeIndex ? lerpedLineWeight : (CLANS[i]?.lighting?.lineWeight ?? 0.5)}
              lineSmooth={i === activeIndex ? lerpedLineSmooth : (CLANS[i]?.lighting?.lineSmooth ?? 0.15)}
              rimDarkness={i === activeIndex ? lerpedRimDarkness : (CLANS[i]?.lighting?.rimDarkness ?? 0.0)}
              rimWidth={i === activeIndex ? lerpedRimWidth : (CLANS[i]?.lighting?.rimWidth ?? 0.5)}
            />
          </div>
        );
      })}
    </>
  );
}
