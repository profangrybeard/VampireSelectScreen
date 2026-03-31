/**
 * EmbraceHold — press-and-hold interaction for clan selection.
 *
 * The user holds the silhouette to "succumb" to the Embrace.
 * The screen darkens progressively via vignette.
 * Fang overlay (BiteTransition) handles visual progress.
 * Release early = escape. Hold through = the Embrace fires.
 */
import { useRef, useCallback, useEffect } from 'react';

const EMBRACE_DURATION_MS = 2000;

export default function EmbraceHold({ active, onHoldStart, onHoldProgress, onHoldComplete, onHoldCancel }) {
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

  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

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

  return (
    <div
      className="embrace-hold"
      onPointerDown={handleDown}
      onPointerUp={handleUp}
    />
  );
}
