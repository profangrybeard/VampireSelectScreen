/**
 * EmbraceHold — press-and-hold interaction for clan selection.
 *
 * Renders nothing visible — listens on window-level pointer events
 * so it never blocks swipe detection. Checks touch coordinates
 * against the center area of the screen.
 *
 * 300ms dead zone: quick touches/swipes are ignored. Only sustained
 * contact in the center zone engages the hold.
 */
import { useRef, useCallback, useEffect } from 'react';

const DEAD_ZONE_MS = 300;
const EMBRACE_DURATION_MS = 2000;

// Embrace zone: center area of screen (matches old .embrace-hold bounds)
function inEmbraceZone(e) {
  const x = e.clientX / window.innerWidth;
  const y = e.clientY / window.innerHeight;
  return x > 0.22 && x < 0.78 && y > 0.15 && y < 0.80;
}

export default function EmbraceHold({ active, onHoldStart, onHoldProgress, onHoldComplete, onHoldCancel }) {
  const phase = useRef('idle'); // idle | waiting | holding
  const startTime = useRef(0);
  const waitTimer = useRef(null);
  const rafRef = useRef(null);

  const tick = useCallback(() => {
    if (phase.current !== 'holding') return;
    const elapsed = performance.now() - startTime.current;
    const progress = Math.min(1, elapsed / EMBRACE_DURATION_MS);
    onHoldProgress(progress);

    if (progress >= 1) {
      phase.current = 'idle';
      onHoldComplete();
    } else {
      rafRef.current = requestAnimationFrame(tick);
    }
  }, [onHoldProgress, onHoldComplete]);

  const engage = useCallback(() => {
    phase.current = 'holding';
    startTime.current = performance.now();
    onHoldStart();
    rafRef.current = requestAnimationFrame(tick);
  }, [onHoldStart, tick]);

  useEffect(() => {
    const handleDown = (e) => {
      if (!active) return;
      if (!inEmbraceZone(e)) return;
      phase.current = 'waiting';
      waitTimer.current = setTimeout(() => {
        if (phase.current === 'waiting') {
          engage();
        }
      }, DEAD_ZONE_MS);
    };

    const handleUp = () => {
      if (phase.current === 'waiting') {
        clearTimeout(waitTimer.current);
        phase.current = 'idle';
        return;
      }
      if (phase.current === 'holding') {
        phase.current = 'idle';
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
        onHoldCancel();
      }
    };

    const handleCancel = () => {
      if (phase.current === 'waiting') {
        clearTimeout(waitTimer.current);
        phase.current = 'idle';
      }
      if (phase.current === 'holding') {
        phase.current = 'idle';
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
        onHoldCancel();
      }
    };

    window.addEventListener('pointerdown', handleDown);
    window.addEventListener('pointerup', handleUp);
    window.addEventListener('pointercancel', handleCancel);
    return () => {
      window.removeEventListener('pointerdown', handleDown);
      window.removeEventListener('pointerup', handleUp);
      window.removeEventListener('pointercancel', handleCancel);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      clearTimeout(waitTimer.current);
    };
  }, [active, engage, onHoldCancel]);

  // No DOM element — purely event-driven, never blocks other interactions
  return null;
}
