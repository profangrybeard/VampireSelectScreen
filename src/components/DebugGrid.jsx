/**
 * Debug Grid Overlay
 * - 10% grid lines (grey, transparent)
 * - Frame border
 * - Golden ratio guidelines (yellow, 3 iterations inward)
 * - Toggleable from debug menu
 *
 * Temporary — removed before final build.
 */
import { useState } from 'react';

// Golden ratio
const PHI = 1.618033988749895;

/**
 * Generate golden ratio rectangles, iterating inward N times.
 * Each iteration splits the remaining rectangle by phi.
 * Returns array of { x, y, w, h } as percentages.
 */
function goldenRatioLines(iterations) {
  const lines = [];

  // Horizontal golden cuts (from top and bottom)
  let top = 0;
  let bottom = 100;
  for (let i = 0; i < iterations; i++) {
    const height = bottom - top;
    const cut = height / PHI;
    // Line from top
    const fromTop = top + cut;
    // Line from bottom
    const fromBottom = bottom - cut;
    lines.push({ type: 'h', pos: fromTop });
    lines.push({ type: 'h', pos: fromBottom });
    top = fromBottom;
    bottom = fromTop;
  }

  // Vertical golden cuts (from left and right)
  let left = 0;
  let right = 100;
  for (let i = 0; i < iterations; i++) {
    const width = right - left;
    const cut = width / PHI;
    const fromLeft = left + cut;
    const fromRight = right - cut;
    lines.push({ type: 'v', pos: fromLeft });
    lines.push({ type: 'v', pos: fromRight });
    left = fromRight;
    right = fromLeft;
  }

  return lines;
}

export default function DebugGrid() {
  const [showGrid, setShowGrid] = useState(false);
  const [showGolden, setShowGolden] = useState(false);

  const goldenLines = goldenRatioLines(3);

  return (
    <>
      {/* Debug menu — lower left */}
      <div className="debug-menu">
        <button
          className={`debug-btn ${showGrid ? 'debug-btn--active' : ''}`}
          onClick={() => setShowGrid(!showGrid)}
        >
          Grid
        </button>
        <button
          className={`debug-btn ${showGolden ? 'debug-btn--active' : ''}`}
          onClick={() => setShowGolden(!showGolden)}
        >
          φ
        </button>
      </div>

      {/* Grid overlay */}
      {(showGrid || showGolden) && (
        <div className="debug-overlay">
          <svg
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            xmlns="http://www.w3.org/2000/svg"
            className="debug-svg"
          >
            {showGrid && (
              <g>
                {/* Frame border */}
                <rect
                  x="0" y="0" width="100" height="100"
                  fill="none" stroke="#555" strokeWidth="0.3"
                />

                {/* 10% horizontal lines */}
                {Array.from({ length: 9 }, (_, i) => {
                  const y = (i + 1) * 10;
                  return (
                    <line key={`h${i}`}
                      x1="0" y1={y} x2="100" y2={y}
                      stroke="#444" strokeWidth="0.15" opacity="0.5"
                    />
                  );
                })}

                {/* 10% vertical lines */}
                {Array.from({ length: 9 }, (_, i) => {
                  const x = (i + 1) * 10;
                  return (
                    <line key={`v${i}`}
                      x1={x} y1="0" x2={x} y2="100"
                      stroke="#444" strokeWidth="0.15" opacity="0.5"
                    />
                  );
                })}

                {/* Percentage labels */}
                {Array.from({ length: 9 }, (_, i) => {
                  const pos = (i + 1) * 10;
                  return (
                    <g key={`lbl${i}`}>
                      <text x="0.5" y={pos - 0.3}
                        fill="#555" fontSize="1.8" fontFamily="monospace"
                      >
                        {pos}%
                      </text>
                      <text x={pos + 0.3} y="2"
                        fill="#555" fontSize="1.8" fontFamily="monospace"
                      >
                        {pos}%
                      </text>
                    </g>
                  );
                })}
              </g>
            )}

            {showGolden && (
              <g>
                {goldenLines.map((line, i) => (
                  line.type === 'h' ? (
                    <line key={`g${i}`}
                      x1="0" y1={line.pos} x2="100" y2={line.pos}
                      stroke="#c8a832" strokeWidth="0.15" opacity="0.6"
                      strokeDasharray="1 0.5"
                    />
                  ) : (
                    <line key={`g${i}`}
                      x1={line.pos} y1="0" x2={line.pos} y2="100"
                      stroke="#c8a832" strokeWidth="0.15" opacity="0.6"
                      strokeDasharray="1 0.5"
                    />
                  )
                ))}
              </g>
            )}
          </svg>
        </div>
      )}
    </>
  );
}
