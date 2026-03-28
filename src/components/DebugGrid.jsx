/**
 * Debug Grid Overlay
 * - 10% grid lines (grey, transparent)
 * - Frame border
 * - Golden ratio guidelines (yellow, 3 iterations inward)
 * - Toggleable from debug menu
 *
 * Temporary — removed before final build.
 */
import { useState, useEffect, useRef } from 'react';

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

export default function DebugGrid({
  devLightScale = 1.0, onLightScale,
  devNormalScale = 1.5, onNormalScale,
  devRoughness = 0.4, onRoughness,
  devSpotX = -0.5, onSpotX,
  devSpotY = 1.0, onSpotY,
  devSpotZ = 1.5, onSpotZ,
  devSpotIntensity = 3.0, onSpotIntensity,
  devSpotAngle = 0.3, onSpotAngle,
  devSpotPenumbra = 0.5, onSpotPenumbra,
  devSpotTargetX = 0, onSpotTargetX,
  devSpotTargetY = 0.5, onSpotTargetY,
  devSpotColor = '#c8bfb0', onSpotColor,
  devTintColor = '#2d4a1e', onTintColor,
  devTintOpacity = 0.0, onTintOpacity,
  onSave, onCopy,
}) {
  const [showGrid, setShowGrid] = useState(false);
  const [showGolden, setShowGolden] = useState(false);
  const [showLight, setShowLight] = useState(false);
  const [showTexture, setShowTexture] = useState(false);
  const [saveFlash, setSaveFlash] = useState(false);
  const [copyFlash, setCopyFlash] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [triggerVisible, setTriggerVisible] = useState(true);
  const fadeTimerRef = useRef(null);

  // Auto-fade the bug icon after 5 seconds
  useEffect(() => {
    if (triggerVisible && !menuOpen) {
      fadeTimerRef.current = setTimeout(() => setTriggerVisible(false), 5000);
      return () => clearTimeout(fadeTimerRef.current);
    }
  }, [triggerVisible, menuOpen]);

  const handleTriggerTap = () => {
    if (!triggerVisible) {
      setTriggerVisible(true);
    } else if (menuOpen) {
      // Close everything — menu, panels
      setMenuOpen(false);
      setShowLight(false);
      setShowTexture(false);
    } else {
      setMenuOpen(true);
    }
  };

  const goldenLines = goldenRatioLines(3);

  return (
    <>
      {/* Bug icon trigger — fades out after 5s */}
      <div
        className={`debug-trigger ${triggerVisible ? '' : 'debug-trigger--faded'}`}
        onClick={handleTriggerTap}
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M8 2C6.34 2 5 3.34 5 5v1H3.5l-1 2H4v1.5L2.5 11l1 .5L5 10v1c0 1.66 1.34 3 3 3s3-1.34 3-3v-1l1.5 1.5 1-.5L11.5 9.5V8h1.5l-1-2H11V5c0-1.66-1.34-3-3-3z" fill="currentColor"/>
        </svg>
      </div>

      {/* Flyout menu — slides left to right from the bug icon */}
      {menuOpen && (
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
          <button
            className={`debug-btn ${showLight ? 'debug-btn--active' : ''}`}
            onClick={() => setShowLight(!showLight)}
          >
            Light
          </button>
          <button
            className={`debug-btn ${showTexture ? 'debug-btn--active' : ''}`}
            onClick={() => setShowTexture(!showTexture)}
          >
            Tex
          </button>
          <button
            className="debug-btn"
            onClick={() => { onSave?.(); setSaveFlash(true); setTimeout(() => setSaveFlash(false), 600); }}
            style={saveFlash ? { color: '#4a4', borderColor: '#4a4' } : {}}
          >
            {saveFlash ? 'Saved' : 'Save'}
          </button>
          <button
            className="debug-btn"
            onClick={() => { onCopy?.(); setCopyFlash(true); setTimeout(() => setCopyFlash(false), 600); }}
            style={copyFlash ? { color: '#4a4', borderColor: '#4a4' } : {}}
          >
            {copyFlash ? 'Copied' : 'Copy'}
          </button>
        </div>
      )}

      {menuOpen && (
        <div className="debug-build">{typeof __BUILD_HASH__ !== 'undefined' ? __BUILD_HASH__ : ''}</div>
      )}

      {/* Light controls */}
      {showLight && (
        <div className="dev-panel">
          <div className="dev-panel__header">LIGHT</div>
          <label>
            <span>Fill {devLightScale.toFixed(1)}</span>
            <input type="range" min="0" max="5" step="0.1"
              value={devLightScale}
              onChange={(e) => onLightScale?.(parseFloat(e.target.value))}
            />
          </label>
          <div className="dev-panel__sep">SPOTLIGHT</div>
          <label>
            <span>Spot X {devSpotX.toFixed(1)}</span>
            <input type="range" min="-2" max="2" step="0.1"
              value={devSpotX}
              onChange={(e) => onSpotX?.(parseFloat(e.target.value))}
            />
          </label>
          <label>
            <span>Spot Y {devSpotY.toFixed(1)}</span>
            <input type="range" min="-2" max="4" step="0.1"
              value={devSpotY}
              onChange={(e) => onSpotY?.(parseFloat(e.target.value))}
            />
          </label>
          <label>
            <span>Spot Z {devSpotZ.toFixed(1)}</span>
            <input type="range" min="0" max="3" step="0.1"
              value={devSpotZ}
              onChange={(e) => onSpotZ?.(parseFloat(e.target.value))}
            />
          </label>
          <label>
            <span>Spot Int {devSpotIntensity.toFixed(1)}</span>
            <input type="range" min="0" max="10" step="0.1"
              value={devSpotIntensity}
              onChange={(e) => onSpotIntensity?.(parseFloat(e.target.value))}
            />
          </label>
          <label>
            <span>Angle {devSpotAngle.toFixed(2)}</span>
            <input type="range" min="0.05" max="1.5" step="0.05"
              value={devSpotAngle}
              onChange={(e) => onSpotAngle?.(parseFloat(e.target.value))}
            />
          </label>
          <label>
            <span>Penum {devSpotPenumbra.toFixed(2)}</span>
            <input type="range" min="0" max="1" step="0.05"
              value={devSpotPenumbra}
              onChange={(e) => onSpotPenumbra?.(parseFloat(e.target.value))}
            />
          </label>
          <div className="dev-panel__sep">TARGET</div>
          <label>
            <span>Tgt X {devSpotTargetX.toFixed(1)}</span>
            <input type="range" min="-1" max="1" step="0.05"
              value={devSpotTargetX}
              onChange={(e) => onSpotTargetX?.(parseFloat(e.target.value))}
            />
          </label>
          <label>
            <span>Tgt Y {devSpotTargetY.toFixed(1)}</span>
            <input type="range" min="-1" max="1.5" step="0.05"
              value={devSpotTargetY}
              onChange={(e) => onSpotTargetY?.(parseFloat(e.target.value))}
            />
          </label>
          <div className="dev-panel__sep">COLOR</div>
          <label>
            <span>Spot</span>
            <input type="color"
              value={devSpotColor}
              onChange={(e) => onSpotColor?.(e.target.value)}
              style={{ width: '60px', height: '20px', border: '1px solid #444', background: 'none', cursor: 'pointer' }}
            />
          </label>
        </div>
      )}

      {/* Texture controls */}
      {showTexture && (
        <div className="dev-panel dev-panel--right">
          <div className="dev-panel__header">TEXTURE</div>
          <label>
            <span>Normal {devNormalScale.toFixed(1)}</span>
            <input type="range" min="0" max="5" step="0.1"
              value={devNormalScale}
              onChange={(e) => onNormalScale?.(parseFloat(e.target.value))}
            />
          </label>
          <label>
            <span>Rough {devRoughness.toFixed(2)}</span>
            <input type="range" min="0" max="1" step="0.05"
              value={devRoughness}
              onChange={(e) => onRoughness?.(parseFloat(e.target.value))}
            />
          </label>
          <div className="dev-panel__sep">ADDITIVE TINT</div>
          <label>
            <span>Color</span>
            <input type="color"
              value={devTintColor}
              onChange={(e) => onTintColor?.(e.target.value)}
              style={{ width: '60px', height: '20px', border: '1px solid #444', background: 'none', cursor: 'pointer' }}
            />
          </label>
          <label>
            <span>Opacity {devTintOpacity.toFixed(2)}</span>
            <input type="range" min="0" max="1" step="0.02"
              value={devTintOpacity}
              onChange={(e) => onTintOpacity?.(parseFloat(e.target.value))}
            />
          </label>
        </div>
      )}

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
