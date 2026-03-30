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

export default function Pentagram({ activeIndex = 0, prevActiveIndex = 0, rotationDeg = 0, silhouettes = [], clanIds = [], transitioning = false, devLightScale = 1.0, devNormalScale = 1.5, devRoughness = 0.4, devSpot = {}, devTint = {}, devLineWeight = 0.5, devLineSmooth = 0.15 }) {
  const parentRotation = 180 - rotationDeg;
  const containerRef = useRef(null);
  const dotRefs = useRef([]);
  const centerRef = useRef(null);
  const candleRefs = useRef([]);
  const rafRef = useRef(null);
  const [dotPositions, setDotPositions] = useState([]);
  const [centerPos, setCenterPos] = useState(null);
  const [candlePositions, setCandlePositions] = useState([]);
  const [lerpT, setLerpT] = useState(1); // 0 = at prev clan, 1 = at active clan

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
      const elapsed = performance.now() - startTime;
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
    const alpha = 0.08 + depthNorm * 0.37; // front: 0.45, flanking: ~0.25, back: 0.08

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

  const prevSpot = prevEffective.spots?.[0] || {};
  const activeSpot = activeEffective.spots?.[0] || {};
  const lerpedSpotConfig = lerpT >= 1 ? devSpot : lerpSpot(prevSpot, activeSpot, lerpT);

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
                <stop offset="0%" stopColor="#888" />
                <stop offset="40%" stopColor="#555" />
                <stop offset="100%" stopColor="#2a2a2a" />
              </radialGradient>
              <radialGradient id="pentagram-star-grad" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#aaa" />
                <stop offset="35%" stopColor="#666" />
                <stop offset="100%" stopColor="#383838" />
              </radialGradient>
              <radialGradient id="pentagram-fill-grad" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="rgba(220,215,200,0.1)" />
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

            {/* Candle floor circles — visible rings on the pentagram plane
                that anchor each candle visually to the ground. */}
            {CANDLES.map((c) => (
              <circle
                key={`ring-${c.id}`}
                cx={CX + c.dx}
                cy={CY + c.dy}
                r={c.width * 0.8}
                fill="none"
                stroke="rgba(180,175,160,0.2)"
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
                  <stop offset="0%" stopColor={lerpColor('#ffffff', lerpedTint.color || '#ffffff', lerpedTint.opacity ?? 0)} />
                  <stop offset="40%" stopColor={lerpColor('#fff0d0', lerpedTint.color || '#fff0d0', lerpedTint.opacity ?? 0)} />
                  <stop offset="100%" stopColor={lerpColor('#cc9850', lerpedTint.color || '#cc9850', lerpedTint.opacity ?? 0)} />
                </radialGradient>
              </defs>

              {/* Candle body — waxy off-white columns */}
              <rect
                x={0}
                y={candle.flameH * 1.4}
                width={candle.width}
                height={candle.height}
                rx={1}
                fill="#b8b0a0"
              />
              {/* Wax top — slightly brighter to catch light */}
              <ellipse
                cx={candle.width / 2}
                cy={candle.flameH * 1.4}
                rx={candle.width / 2 + 0.5}
                ry={candle.width * 0.2}
                fill="#cdc5b5"
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
            {[0, 1, 2].map((wi) => (
              <div
                key={`smoke-${candle.id}-${wi}`}
                className={`candle-smoke candle-smoke--${wi}`}
                style={{
                  '--smoke-seed': ((i * 3 + wi) * 137.5) % 360,
                }}
              />
            ))}
          </div>
        );
      })}

      {/* Ritual circle — vertical occult geometry behind the front character.
          Clean thin lines, very low opacity. The summoning circle projecting
          upward from the floor. Provides contrast to separate the character
          from pure black without noise. */}
      {dotPositions.length === 5 && (() => {
        const frontPos = dotPositions[activeIndex];
        if (!frontPos) return null;
        return (
          <div
            className="ritual-circle"
            style={{
              left: `${frontPos.x}%`,
              top: `${frontPos.y - 32}%`,
            }}
          >
            <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
              {/* Outer circle */}
              <circle cx="100" cy="100" r="95" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="0.5" />
              {/* Inner circle */}
              <circle cx="100" cy="100" r="72" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="0.4" />
              {/* Inner-inner circle */}
              <circle cx="100" cy="100" r="48" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="0.3" />
              {/* Radial lines — 12 spokes */}
              {Array.from({ length: 12 }, (_, j) => {
                const a = (j * Math.PI * 2) / 12;
                const x1 = 100 + 48 * Math.cos(a);
                const y1 = 100 + 48 * Math.sin(a);
                const x2 = 100 + 95 * Math.cos(a);
                const y2 = 100 + 95 * Math.sin(a);
                return (
                  <line key={j} x1={x1} y1={y1} x2={x2} y2={y2}
                    stroke="rgba(255,255,255,0.03)" strokeWidth="0.3" />
                );
              })}
              {/* Small inner pentagram */}
              <polygon
                points={Array.from({ length: 5 }, (_, j) => {
                  const a = -Math.PI / 2 + (j * 2 * Math.PI) / 5;
                  return `${100 + 30 * Math.cos(a)},${100 + 30 * Math.sin(a)}`;
                }).join(' ')}
                fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="0.3"
              />
              {/* Connecting star lines */}
              {[0, 2, 4, 1, 3, 0].map((j, idx, arr) => {
                if (idx === arr.length - 1) return null;
                const a1 = -Math.PI / 2 + (j * 2 * Math.PI) / 5;
                const next = arr[idx + 1];
                const a2 = -Math.PI / 2 + (next * 2 * Math.PI) / 5;
                return (
                  <line key={`s${idx}`}
                    x1={100 + 30 * Math.cos(a1)} y1={100 + 30 * Math.sin(a1)}
                    x2={100 + 30 * Math.cos(a2)} y2={100 + 30 * Math.sin(a2)}
                    stroke="rgba(255,255,255,0.035)" strokeWidth="0.3" />
                );
              })}
              {/* Arcane tick marks on the outer ring */}
              {Array.from({ length: 36 }, (_, j) => {
                const a = (j * Math.PI * 2) / 36;
                const r1 = j % 3 === 0 ? 88 : 91;
                const x1 = 100 + r1 * Math.cos(a);
                const y1 = 100 + r1 * Math.sin(a);
                const x2 = 100 + 95 * Math.cos(a);
                const y2 = 100 + 95 * Math.sin(a);
                return (
                  <line key={`t${j}`} x1={x1} y1={y1} x2={x2} y2={y2}
                    stroke="rgba(255,255,255,0.04)" strokeWidth="0.2" />
                );
              })}
            </svg>
          </div>
        );
      })()}

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
        // Brightness curve: front 75%, flanking ~28%, far back 15%.
        // Flanking characters (mid-depth) get a bump so they frame the
        // front character as dark compositional bookends.
        const brightness = i === activeIndex
          ? 0.18 + depthNorm * 0.57
          : 0.15 + depthNorm * 0.2 + Math.pow(depthNorm, 0.5) * 0.12;
        // All on-screen silhouettes visible
        const opacity = depthNorm > 0.05 ? 1 : 0;
        const zIndex = Math.round(depthNorm * 10);

        // Directional light from pentagram center
        const shadowFilter = getLightStyle(pos, depthNorm);

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

        // Light intensity scales with depth — front character gets more
        // devLightScale multiplies the base intensity for live tuning
        const lightIntensity = (0.5 + depthNorm * 1.5) * lerpedLightScale;

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
              spotPos={{ spots: [{ ...lerpedSpotConfig }] }}
              tint={i === activeIndex ? lerpedTint : (CLANS[i]?.lighting?.tint || { color: '#000000', opacity: 0 })}
              lineWeight={i === activeIndex ? lerpedLineWeight : (CLANS[i]?.lighting?.lineWeight ?? 0.5)}
              lineSmooth={i === activeIndex ? lerpedLineSmooth : (CLANS[i]?.lighting?.lineSmooth ?? 0.15)}
            />
          </div>
        );
      })}
    </>
  );
}
