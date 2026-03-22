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
 * Pass 1: Grey only. No clan colors.
 */
import { useRef, useState, useEffect, useCallback } from 'react';

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

export default function Pentagram({ activeIndex = 0, rotationDeg = 0, silhouettes = [] }) {
  const parentRotation = 180 - rotationDeg;
  const containerRef = useRef(null);
  const dotRefs = useRef([]);
  const rafRef = useRef(null);
  const [dotPositions, setDotPositions] = useState([]);

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

  return (
    <>
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
            <circle cx={CX} cy={CY} r={R}
              fill="none" stroke="#222" strokeWidth="0.75" opacity="0.4" />
            <circle cx={CX} cy={CY} r={INNER_R}
              fill="none" stroke="#222" strokeWidth="0.5" opacity="0.3" />
            <polygon points={starLines(CX, CY, R)}
              fill="none" stroke="#333" strokeWidth="1.25"
              strokeLinejoin="round" opacity="0.6" />
            <polygon points={pentagramPoints(CX, CY, R, INNER_R)}
              fill="none" stroke="#2a2a2a" strokeWidth="0.5" opacity="0.3" />

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
          every frame. Movement comes from tracking the pentagram. */}
      {dotPositions.length === 5 && silhouettes.map((Silhouette, i) => {
        if (!Silhouette) return null;
        const pos = dotPositions[i];
        const isActive = i === activeIndex;

        // Normalize depth: front dot (~85%) → 1.0, back dot (~58%) → 0.0
        const depthNorm = Math.max(0, Math.min(1, (pos.y - 58) / 27));
        // Scale: front = 1.4, back = 0.625 (perspective depth, front exaggerated)
        const silScale = 0.625 + depthNorm * 0.775;
        // Brightness: 80% front → 32% back (linear)
        const brightness = 0.32 + depthNorm * 0.48;
        // All on-screen silhouettes visible
        const opacity = depthNorm > 0.05 ? 1 : 0;
        const zIndex = Math.round(depthNorm * 10);

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
            <Silhouette />
          </div>
        );
      })}
    </>
  );
}
