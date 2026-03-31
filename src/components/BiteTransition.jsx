/**
 * BiteTransition — fang overlay that replaces the celebration sequence.
 *
 * During hold: fangs drift down from above, driven by holdProgress (0→1).
 * On complete: fangs snap shut (fast translateY), screen crushes to black.
 * Calls onComplete when blackout is total → triggers trailer.
 */
import { useState, useEffect, useRef } from 'react';
import fangsSrc from '../assets/embrace-fangs.png';

export default function BiteTransition({ holdProgress, biting, onComplete }) {
  const [phase, setPhase] = useState('idle'); // idle | snap | black | done
  const timerRefs = useRef([]);

  useEffect(() => {
    if (!biting) {
      setPhase('idle');
      return;
    }

    // Bite sequence: snap shut → hold black → done
    setPhase('snap');

    timerRefs.current.push(
      setTimeout(() => setPhase('black'), 250)
    );
    timerRefs.current.push(
      setTimeout(() => {
        setPhase('done');
        onComplete?.();
      }, 900)
    );

    return () => {
      timerRefs.current.forEach(clearTimeout);
      timerRefs.current = [];
    };
  }, [biting, onComplete]);

  // Fangs are visible during hold OR during bite sequence
  const visible = holdProgress > 0 || phase !== 'idle';

  if (!visible) return null;

  // During hold: fangs drift from -100% (off screen above) toward 0% (closed)
  // They reach about -20% at full hold (not fully closed yet — the snap does that)
  const driftY = phase === 'idle'
    ? -100 + holdProgress * 80  // -100% → -20% over hold duration
    : phase === 'snap'
      ? 0   // snap to closed position
      : 0;

  const blackoutOpacity = phase === 'black' || phase === 'done' ? 1 : 0;

  return (
    <>
      {/* Fang overlay — drifts down during hold, snaps on bite */}
      <div
        className={`bite-fangs ${phase === 'snap' || phase === 'black' || phase === 'done' ? 'bite-fangs--snap' : ''}`}
        style={{
          transform: `translateY(${driftY}%)`,
        }}
      >
        <img src={fangsSrc} alt="" className="bite-fangs__img" />
      </div>

      {/* Blackout — crushes to black after snap */}
      <div
        className="bite-blackout"
        style={{ opacity: blackoutOpacity }}
      />
    </>
  );
}
