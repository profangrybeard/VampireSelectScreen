/**
 * EmbraceHold — dual-modality interaction for clan selection.
 *
 * Touch: press-and-hold in center zone (300ms dead zone, 2s fill).
 * Mouse: double-click in center zone (instant embrace, no hold).
 *
 * Renders nothing visible — listens on window-level pointer events
 * so it never blocks swipe detection. Checks coordinates against
 * the center area of the .screen container.
 */
import { useRef, useCallback, useEffect } from 'react';

const DEAD_ZONE_MS = 300;
const EMBRACE_DURATION_MS = 2000;
const DOUBLE_CLICK_MS = 400;

function inCenterZone(e) {
  const screen = document.querySelector('.screen');
  if (!screen) return false;
  const rect = screen.getBoundingClientRect();
  const x = (e.clientX - rect.left) / rect.width;
  const y = (e.clientY - rect.top) / rect.height;
  return x >= 0.22 && x <= 0.78 && y >= 0.15 && y <= 0.80;
}

export default function EmbraceHold({ active, onHoldStart, onHoldProgress, onHoldComplete, onHoldCancel }) {
  const phase = useRef('idle'); // idle | waiting | holding
  const startTime = useRef(0);
  const waitTimer = useRef(null);
  const rafRef = useRef(null);
  const lastClickTime = useRef(0);

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

  const startPos = useRef({ x: 0, y: 0 });

  const engage = useCallback((x, y) => {
    phase.current = 'holding';
    startTime.current = performance.now();
    startPos.current = { x, y };
    onHoldStartRef.current(x, y);
    rafRef.current = requestAnimationFrame(tick);
  }, [tick]);

  // Mouse double-click: skip the hold, fire the full sequence instantly
  const instantEmbrace = useCallback(() => {
    onHoldStartRef.current();
    onHoldProgressRef.current(1);
    onHoldCompleteRef.current();
  }, []);

  useEffect(() => {
    const handleDown = (e) => {
      if (!activeRef.current) return;
      if (document.querySelector('.debug-menu')) return;
      if (!inCenterZone(e)) return;

      // Mouse path: double-click detection
      if (e.pointerType === 'mouse') {
        const now = performance.now();
        if (now - lastClickTime.current < DOUBLE_CLICK_MS) {
          // Second click — embrace
          lastClickTime.current = 0;
          instantEmbrace();
        } else {
          lastClickTime.current = now;
        }
        return;
      }

      // Touch/pen path: hold gesture
      const px = e.clientX, py = e.clientY;
      phase.current = 'waiting';
      waitTimer.current = setTimeout(() => {
        if (phase.current === 'waiting') {
          engage(px, py);
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
  }, [engage, instantEmbrace]);

  return null;
}
