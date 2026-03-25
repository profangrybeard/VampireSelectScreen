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
const TILT_DEG = 80;

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
              {/* Flame glow — soft bloom around each flame tip */}
              <filter id="flame-glow" x="-100%" y="-100%" width="300%" height="300%">
                <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              {/* Flame gradient — warm grey, hot center to dim edge */}
              <radialGradient id="flame-grad" cx="50%" cy="40%" r="50%">
                <stop offset="0%" stopColor="#ddd8cc" />
                <stop offset="60%" stopColor="#b0a898" />
                <stop offset="100%" stopColor="#887860" />
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

            {/* Candle cluster — ritual light source at pentagram center.
                Varying heights, organic placement. Flames have .candle-flame
                class for clan color targeting in Pass 2. */}
            <g className="candle-cluster">
              {/* Candle bodies — dark wax columns */}
              {/* Tall center candle */}
              <rect x="196" y="162" width="8" height="38" rx="1" fill="#1a1816" />
              <ellipse cx="200" cy="162" rx="5" ry="1.5" fill="#222018" />
              {/* Left tall */}
              <rect x="184" y="168" width="7" height="32" rx="1" fill="#1c1a17" />
              <ellipse cx="187.5" cy="168" rx="4.5" ry="1.2" fill="#242018" />
              {/* Right medium */}
              <rect x="208" y="174" width="6" height="26" rx="1" fill="#1a1816" />
              <ellipse cx="211" cy="174" rx="4" ry="1.2" fill="#222018" />
              {/* Far left short */}
              <rect x="176" y="180" width="6" height="20" rx="1" fill="#1c1a17" />
              <ellipse cx="179" cy="180" rx="3.5" ry="1" fill="#242018" />
              {/* Far right medium */}
              <rect x="216" y="176" width="5" height="24" rx="1" fill="#181614" />
              <ellipse cx="218.5" cy="176" rx="3.5" ry="1" fill="#201c18" />
              {/* Front left small */}
              <rect x="190" y="183" width="5" height="17" rx="1" fill="#1a1816" />
              <ellipse cx="192.5" cy="183" rx="3" ry="0.8" fill="#222018" />
              {/* Front right small */}
              <rect x="205" y="181" width="5" height="19" rx="1" fill="#1c1a17" />
              <ellipse cx="207.5" cy="181" rx="3" ry="0.8" fill="#242018" />
              {/* Back center */}
              <rect x="198" y="170" width="5" height="30" rx="1" fill="#181614" />
              <ellipse cx="200.5" cy="170" rx="3.5" ry="1" fill="#201c18" />

              {/* Wax drips — organic melted shapes */}
              <path d="M195 198 Q193 202 196 200 Z" fill="#1c1a17" opacity="0.6" />
              <path d="M210 198 Q213 201 211 200 Z" fill="#1a1816" opacity="0.5" />
              <path d="M185 199 Q183 202 186 200 Z" fill="#1c1a17" opacity="0.5" />
              <path d="M217 199 Q220 201 218 200 Z" fill="#181614" opacity="0.4" />

              {/* Flames — warm grey, glowing. Class-ready for clan color. */}
              <g filter="url(#flame-glow)">
                {/* Center tall flame */}
                <path className="candle-flame" d="M200 162 Q196 154 200 146 Q204 154 200 162 Z" fill="url(#flame-grad)" opacity="0.9" />
                {/* Left tall flame */}
                <path className="candle-flame" d="M187.5 168 Q184 161 187.5 153 Q191 161 187.5 168 Z" fill="url(#flame-grad)" opacity="0.85" />
                {/* Right medium flame */}
                <path className="candle-flame" d="M211 174 Q208 168 211 161 Q214 168 211 174 Z" fill="url(#flame-grad)" opacity="0.8" />
                {/* Far left flame */}
                <path className="candle-flame" d="M179 180 Q177 175 179 170 Q181 175 179 180 Z" fill="url(#flame-grad)" opacity="0.75" />
                {/* Far right flame */}
                <path className="candle-flame" d="M218.5 176 Q216 170 218.5 164 Q221 170 218.5 176 Z" fill="url(#flame-grad)" opacity="0.8" />
                {/* Front left flame */}
                <path className="candle-flame" d="M192.5 183 Q191 179 192.5 175 Q194 179 192.5 183 Z" fill="url(#flame-grad)" opacity="0.7" />
                {/* Front right flame */}
                <path className="candle-flame" d="M207.5 181 Q206 176 207.5 172 Q209 176 207.5 181 Z" fill="url(#flame-grad)" opacity="0.75" />
                {/* Back center flame */}
                <path className="candle-flame" d="M200.5 170 Q198 164 200.5 158 Q203 164 200.5 170 Z" fill="url(#flame-grad)" opacity="0.8" />
              </g>
            </g>

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
