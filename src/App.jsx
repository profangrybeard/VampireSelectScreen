/**
 * Vampire Clan Select Screen
 * AI 201 — Project 1: Hero Faction Screen (Instructor Demo)
 *
 * Current Pass: 1 — Monochrome Silhouettes
 * Grey values only. No color.
 */
import { useState, useCallback } from 'react';
import './App.css';
import CLANS from './data/clans.js';
import Nosferatu from './silhouettes/Nosferatu.jsx';
import ClanTitle from './components/ClanTitle.jsx';
import IndicatorDots from './components/IndicatorDots.jsx';
import Pentagram from './components/Pentagram.jsx';
import DebugGrid from './components/DebugGrid.jsx';

// All 5 slots use Nosferatu for now
const SILHOUETTE_COMPONENTS = [
  Nosferatu, Nosferatu, Nosferatu, Nosferatu, Nosferatu,
];

export default function App() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [rotationDeg, setRotationDeg] = useState(0);
  const [transitioning, setTransitioning] = useState(false);

  const rotate = useCallback((direction) => {
    if (transitioning) return;
    setTransitioning(true);
    setActiveIndex((prev) => {
      return direction === 'left'
        ? (prev - 1 + CLANS.length) % CLANS.length
        : (prev + 1) % CLANS.length;
    });
    setRotationDeg((prev) => direction === 'left' ? prev - 72 : prev + 72);
    setTimeout(() => setTransitioning(false), 420);
  }, [transitioning]);

  const activeClan = CLANS[activeIndex];

  return (
    <div className="screen">
      {/* Indicator dots */}
      <IndicatorDots count={CLANS.length} active={activeIndex} />

      {/* Pentagram floor + silhouettes anchored to points */}
      <Pentagram
        activeIndex={activeIndex}
        rotationDeg={rotationDeg}
        silhouettes={SILHOUETTE_COMPONENTS}
      />

      {/* Clan title */}
      <ClanTitle name={activeClan.name} archetype={activeClan.archetype} />

      {/* Debug grid overlay */}
      <DebugGrid />

      {/* Tap zones */}
      <div
        className="tap-zone tap-zone--left"
        onClick={() => rotate('left')}
        aria-label="Previous clan"
      />
      <div
        className="tap-zone tap-zone--right"
        onClick={() => rotate('right')}
        aria-label="Next clan"
      />
    </div>
  );
}
