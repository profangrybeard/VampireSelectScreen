/**
 * EmbraceHold — press-and-hold interaction for clan selection.
 *
 * Touch detection with 300ms dead zone: quick touches/swipes pass
 * through. Only after 300ms of still contact does the embrace
 * engage and start filling holdProgress toward completion.
 */
import { useRef, useCallback, useEffect } from 'react';

const DEAD_ZONE_MS = 300;
const EMBRACE_DURATION_MS = 2000;

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

  const handleDown = useCallback((e) => {
    if (!active) return;
    // Don't prevent default — let swipe zone see the touch
    phase.current = 'waiting';
    waitTimer.current = setTimeout(() => {
      if (phase.current === 'waiting') {
        engage();
      }
    }, DEAD_ZONE_MS);
  }, [active, engage]);

  const handleUp = useCallback(() => {
    if (phase.current === 'waiting') {
      // Released before dead zone — was a tap/swipe, ignore
      clearTimeout(waitTimer.current);
      phase.current = 'idle';
      return;
    }
    if (phase.current === 'holding') {
      phase.current = 'idle';
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      onHoldCancel();
    }
  }, [onHoldCancel]);

  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      clearTimeout(waitTimer.current);
    };
  }, []);

  useEffect(() => {
    const cancel = () => {
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
