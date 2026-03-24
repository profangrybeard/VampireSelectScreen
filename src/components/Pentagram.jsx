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
 * Grey only for Pass 1.
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
const TILT_DEG = 75;

export default function Pentagram({ activeIndex = 0, rotationDeg = 0, silhouettes = [], clanIds = [], transitioning = false }) {
  const parentRotation = 180 - rotationDeg;
  const containerRef = useRef(null);
  const dotRefs = useRef([]);
  const centerRef = useRef(null);
  const rafRef = useRef(null);
  const [dotPositions, setDotPositions] = useState([]);
  const [centerPos, setCenterPos] = useState(null);

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

    // Shadow offset distance — scales with depth
    const dist = 2 + depthNorm * 5;
    // Blur — softer spread for uplight
    const blur = 4 + depthNorm * 7;
    // Opacity — front characters closest to light get strongest glow
    const alpha = 0.15 + depthNorm * 0.35;

    // Dim during transition — light is "resetting" between clans
    const dimFactor = transitioning ? 0.3 : 1;
    const finalAlpha = alpha * dimFactor;

    // Shadow pushes away from floor light (upward for all characters)
    const shadowX = Math.cos(angle) * dist;
    const shadowY = Math.sin(angle) * dist;

    return `drop-shadow(${shadowX.toFixed(1)}px ${shadowY.toFixed(1)}px ${blur.toFixed(1)}px rgba(200,200,200,${finalAlpha.toFixed(2)}))`;
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
        // Brightness: 80% front → 32% back (linear)
        const brightness = 0.32 + depthNorm * 0.48;
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
