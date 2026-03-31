/**
 * CelebrationOverlay — the Embrace detonation sequence.
 *
 * Beat 1 (0–150ms):   White-hot flash — full screen blows out
 * Beat 2 (150–800ms): Flash fades, pentagram supernova holds
 * Beat 3 (800–1500ms): Everything crushes to black
 *
 * Calls onComplete when the blackout is total.
 */
import { useState, useEffect, useRef } from 'react';

export default function CelebrationOverlay({ active, accent, onComplete }) {
  const [phase, setPhase] = useState('idle'); // idle | flash | supernova | blackout | done
  const timerRefs = useRef([]);

  useEffect(() => {
    if (!active) {
      setPhase('idle');
      return;
    }

    // Clear any lingering timers
    timerRefs.current.forEach(clearTimeout);
    timerRefs.current = [];

    // Sequence the beats
    setPhase('flash');

    timerRefs.current.push(
      setTimeout(() => setPhase('supernova'), 150)
    );
    timerRefs.current.push(
      setTimeout(() => setPhase('blackout'), 800)
    );
    timerRefs.current.push(
      setTimeout(() => {
        setPhase('done');
        onComplete?.();
      }, 1500)
    );

    return () => {
      timerRefs.current.forEach(clearTimeout);
      timerRefs.current = [];
    };
  }, [active, onComplete]);

  if (phase === 'idle') return null;

  return (
    <>
      {/* White flash */}
      <div
        className={`celebration-flash ${phase === 'flash' ? 'celebration-flash--active' : ''}`}
      />

      {/* Pentagram supernova glow — blooms outward from center */}
      <div
        className={`celebration-supernova ${phase === 'supernova' || phase === 'blackout' || phase === 'done' ? 'celebration-supernova--active' : ''}`}
        style={{
          '--supernova-color': accent || '#fff',
        }}
      />

      {/* Crush to black */}
      <div
        className={`celebration-blackout ${phase === 'blackout' || phase === 'done' ? 'celebration-blackout--active' : ''} ${phase === 'done' ? 'celebration-blackout--solid' : ''}`}
      />
    </>
  );
}
