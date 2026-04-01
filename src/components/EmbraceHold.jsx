/**
 * EmbraceHold — press-and-hold interaction for clan selection.
 *
 * Renders nothing visible — listens on window-level pointer events
 * so it never blocks swipe detection. Checks touch coordinates
 * against the center area of the .screen container.
 *
 * 300ms dead zone: quick touches/swipes are ignored. Only sustained
 * contact in the center zone engages the hold.
 */
import { useRef, useCallback, useEffect } from 'react';

const DEAD_ZONE_MS = 300;
const EMBRACE_DURATION_MS = 2000;

export default function EmbraceHold({ active, onHoldStart, onHoldProgress, onHoldComplete, onHoldCancel }) {
  const phase = useRef('idle'); // idle | waiting | holding
  const startTime = useRef(0);
  const waitTimer = useRef(null);
  const rafRef = useRef(null);

  // Store callbacks and active in refs so the effect doesn't re-run
  // when they change (which would kill an in-progress hold)
  const activeRef = useRef(active);
  activeRef.current = active;
  const onHoldStartRef = useRef(onHoldStart);
  onHoldStartRef.current = onHoldStart;
  const onHoldProgressRef = useRef(onHoldProgress);
  onHoldProgressRef.current = onHoldProgress;
  const onHoldCompleteRef = useRef(onHoldComplete);
  onHoldCompleteRef.current = onHoldComplete;
  const onHoldCancelRef = useRef(onHoldCancel);
  onHoldCancelRef.current = onHoldCancel;

  const tick = useCallback(() => {
    if (phase.current !== 'holding') return;
    const elapsed = performance.now() - startTime.current;
    const progress = Math.min(1, elapsed / EMBRACE_DURATION_MS);
    onHoldProgressRef.current(progress);

    if (progress >= 1) {
      phase.current = 'idle';
      onHoldCompleteRef.current();
    } else {
      rafRef.current = requestAnimationFrame(tick);
    }
  }, []);

  const engage = useCallback(() => {
    phase.current = 'holding';
    startTime.current = performance.now();
    onHoldStartRef.current();
    rafRef.current = requestAnimationFrame(tick);
  }, [tick]);

  useEffect(() => {
    const handleDown = (e) => {
      if (!activeRef.current) return;

      // Check touch is in the center zone of the .screen container
      const screen = document.querySelector('.screen');
      if (!screen) return;
      const rect = screen.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      if (x < 0.22 || x > 0.78 || y < 0.15 || y > 0.80) return;

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
        onHoldCancelRef.current();
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
        onHoldCancelRef.current();
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
  }, [engage]);

  return null;
}
