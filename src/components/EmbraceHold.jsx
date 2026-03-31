/**
 * EmbraceHold — press-and-hold interaction for clan selection.
 *
 * The user holds the silhouette to "succumb" to the Embrace.
 * A commitment bar fills over EMBRACE_DURATION_MS. The screen
 * darkens and zooms in progressively. Release early = escape.
 * Hold through = the Embrace fires.
 */
import { useRef, useCallback, useEffect } from 'react';

const EMBRACE_DURATION_MS = 2000;

export default function EmbraceHold({ active, holdProgress, onHoldStart, onHoldProgress, onHoldComplete, onHoldCancel, accent }) {
  const holding = useRef(false);
  const startTime = useRef(0);
  const rafRef = useRef(null);

  const tick = useCallback(() => {
    if (!holding.current) return;
    const elapsed = performance.now() - startTime.current;
    const progress = Math.min(1, elapsed / EMBRACE_DURATION_MS);
    onHoldProgress(progress);

    if (progress >= 1) {
      holding.current = false;
      onHoldComplete();
    } else {
      rafRef.current = requestAnimationFrame(tick);
    }
  }, [onHoldProgress, onHoldComplete]);

  const handleDown = useCallback((e) => {
    if (!active) return;
    e.preventDefault();
    holding.current = true;
    startTime.current = performance.now();
    onHoldStart();
    rafRef.current = requestAnimationFrame(tick);
  }, [active, onHoldStart, tick]);

  const handleUp = useCallback(() => {
    if (!holding.current) return;
    holding.current = false;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    onHoldCancel();
  }, [onHoldCancel]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  // Bind pointercancel / pointerleave at window level so we catch
  // cases where the finger slides off the zone
  useEffect(() => {
    const cancel = () => {
      if (holding.current) {
        holding.current = false;
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
        onHoldCancel();
      }
    };
    window.addEventListener('pointercancel', cancel);
    window.addEventListener('pointerup', cancel);
    return () => {
      window.removeEventListener('pointercancel', cancel);
      window.removeEventListener('pointerup', cancel);
    };
  }, [onHoldCancel]);

  const barColor = accent || '#888';

  return (
    <div
      className="embrace-hold"
      onPointerDown={handleDown}
      onPointerUp={handleUp}
      style={{ '--hold-progress': holdProgress }}
    >
      {/* Commitment bar — only visible during hold */}
      <div
        className={`embrace-bar ${holdProgress > 0 ? 'embrace-bar--visible' : ''}`}
      >
        <div className="embrace-bar__track">
          <div
            className="embrace-bar__fill"
            style={{
              transform: `scaleX(${holdProgress})`,
              background: barColor,
              boxShadow: `0 0 ${8 + holdProgress * 16}px ${barColor}`,
            }}
          />
        </div>
        <span className="embrace-bar__label">
          {holdProgress < 1 ? 'HOLD' : 'EMBRACED'}
        </span>
      </div>

      {/* Vignette — darkens screen edges as you hold */}
      <div
        className="embrace-vignette"
        style={{
          opacity: holdProgress * 0.85,
        }}
      />
    </div>
  );
}
