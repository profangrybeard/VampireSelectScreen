/**
 * Vampire Clan Select Screen
 * AI 201 — Project 1: Hero Faction Screen (Instructor Demo)
 *
 * Current Pass: 1 — Monochrome Silhouettes
 * Grey values only. No color.
 */
import { useState, useCallback, useEffect } from 'react';
import './App.css';
import CLANS from './data/clans.js';
import Nosferatu from './silhouettes/Nosferatu.jsx';
import ClanTitle from './components/ClanTitle.jsx';
import StatsPanel from './components/StatsPanel.jsx';
import IndicatorDots from './components/IndicatorDots.jsx';
import Pentagram from './components/Pentagram.jsx';
import DebugGrid from './components/DebugGrid.jsx';

// All 5 slots use Nosferatu for now
const SILHOUETTE_COMPONENTS = [
  Nosferatu, Nosferatu, Nosferatu, Nosferatu, Nosferatu,
];

export default function App() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [prevActiveIndex, setPrevActiveIndex] = useState(0);
  const [rotationDeg, setRotationDeg] = useState(0);
  const [transitioning, setTransitioning] = useState(false);
  const [statsOpen, setStatsOpen] = useState(false);

  // Dev controls — tunable lighting props
  const [devLightScale, setDevLightScale] = useState(1.0);
  const [devNormalScale, setDevNormalScale] = useState(1.0);
  const [devRoughness, setDevRoughness] = useState(0.65);

  // Spotlight dev controls — Nosferatu defaults from tuning session
  const [devSpotX, setDevSpotX] = useState(-1.7);
  const [devSpotY, setDevSpotY] = useState(2.6);
  const [devSpotZ, setDevSpotZ] = useState(1.0);
  const [devSpotIntensity, setDevSpotIntensity] = useState(9.0);
  const [devSpotAngle, setDevSpotAngle] = useState(0.20);
  const [devSpotPenumbra, setDevSpotPenumbra] = useState(0.50);
  const [devSpotTargetX, setDevSpotTargetX] = useState(-0.1);
  const [devSpotTargetY, setDevSpotTargetY] = useState(0.6);
  const [devSpotColor, setDevSpotColor] = useState('#c8bfb0');

  // Additive tint controls
  const [devTintColor, setDevTintColor] = useState('#2d4a1e');
  const [devTintOpacity, setDevTintOpacity] = useState(0.0);

  // --- Save/Load/Copy dev settings ---
  const getDevSettings = useCallback(() => ({
    lightScale: devLightScale,
    normalScale: devNormalScale,
    roughness: devRoughness,
    spot: { x: devSpotX, y: devSpotY, z: devSpotZ, intensity: devSpotIntensity, angle: devSpotAngle, penumbra: devSpotPenumbra, targetX: devSpotTargetX, targetY: devSpotTargetY, color: devSpotColor },
    tint: { color: devTintColor, opacity: devTintOpacity },
  }), [devLightScale, devNormalScale, devRoughness, devSpotX, devSpotY, devSpotZ, devSpotIntensity, devSpotAngle, devSpotPenumbra, devSpotTargetX, devSpotTargetY, devSpotColor, devTintColor, devTintOpacity]);

  const applyDevSettings = useCallback((s) => {
    if (!s) return;
    if (s.lightScale != null) setDevLightScale(s.lightScale);
    if (s.normalScale != null) setDevNormalScale(s.normalScale);
    if (s.roughness != null) setDevRoughness(s.roughness);
    if (s.spot) {
      if (s.spot.x != null) setDevSpotX(s.spot.x);
      if (s.spot.y != null) setDevSpotY(s.spot.y);
      if (s.spot.z != null) setDevSpotZ(s.spot.z);
      if (s.spot.intensity != null) setDevSpotIntensity(s.spot.intensity);
      if (s.spot.angle != null) setDevSpotAngle(s.spot.angle);
      if (s.spot.penumbra != null) setDevSpotPenumbra(s.spot.penumbra);
      if (s.spot.targetX != null) setDevSpotTargetX(s.spot.targetX);
      if (s.spot.targetY != null) setDevSpotTargetY(s.spot.targetY);
      if (s.spot.color != null) setDevSpotColor(s.spot.color);
    }
    if (s.tint) {
      if (s.tint.color != null) setDevTintColor(s.tint.color);
      if (s.tint.opacity != null) setDevTintOpacity(s.tint.opacity);
    }
  }, []);

  const handleSave = useCallback(() => {
    const s = getDevSettings();
    localStorage.setItem('vss-dev-settings', JSON.stringify(s));
  }, [getDevSettings]);

  const handleCopy = useCallback(() => {
    const s = getDevSettings();
    navigator.clipboard.writeText(JSON.stringify(s, null, 2)).catch(() => {
      // Fallback: prompt with the text
      window.prompt('Copy this JSON:', JSON.stringify(s));
    });
  }, [getDevSettings]);

  // Load saved settings on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem('vss-dev-settings');
      if (raw) applyDevSettings(JSON.parse(raw));
    } catch (e) { /* ignore parse errors */ }
  }, [applyDevSettings]);

  // When active clan changes, load its lighting preset into the dev sliders
  useEffect(() => {
    const lighting = CLANS[activeIndex]?.lighting;
    if (!lighting) return;
    const spot = lighting.spots?.[0] || {};
    setDevLightScale(lighting.lightScale ?? 1.0);
    setDevNormalScale(lighting.normalScale ?? 1.5);
    setDevRoughness(lighting.roughness ?? 0.4);
    setDevSpotX(spot.x ?? -0.5);
    setDevSpotY(spot.y ?? 1.0);
    setDevSpotZ(spot.z ?? 1.5);
    setDevSpotIntensity(spot.intensity ?? 3.0);
    setDevSpotAngle(spot.angle ?? 0.3);
    setDevSpotPenumbra(spot.penumbra ?? 0.5);
    setDevSpotTargetX(spot.targetX ?? 0);
    setDevSpotTargetY(spot.targetY ?? 0.5);
    if (spot.color) setDevSpotColor(spot.color);
    const tint = lighting.tint || {};
    if (tint.color) setDevTintColor(tint.color);
    setDevTintOpacity(tint.opacity ?? 0);
  }, [activeIndex]);

  const rotate = useCallback((direction) => {
    if (transitioning) return;
    setTransitioning(true);
    setPrevActiveIndex(activeIndex);
    setActiveIndex((prev) => {
      return direction === 'left'
        ? (prev - 1 + CLANS.length) % CLANS.length
        : (prev + 1) % CLANS.length;
    });
    setRotationDeg((prev) => direction === 'left' ? prev - 72 : prev + 72);
    setTimeout(() => setTransitioning(false), 420);
  }, [transitioning, activeIndex]);

  const toggleStats = useCallback(() => {
    setStatsOpen((prev) => !prev);
  }, []);

  const activeClan = CLANS[activeIndex];

  return (
    <div className="screen">
      {/* Indicator dots */}
      <IndicatorDots count={CLANS.length} active={activeIndex} />

      {/* Pentagram floor + silhouettes anchored to points */}
      <Pentagram
        activeIndex={activeIndex}
        prevActiveIndex={prevActiveIndex}
        rotationDeg={rotationDeg}
        silhouettes={SILHOUETTE_COMPONENTS}
        clanIds={CLANS.map(c => c.id)}
        transitioning={transitioning}
        devLightScale={devLightScale}
        devNormalScale={devNormalScale}
        devRoughness={devRoughness}
        devSpot={{ x: devSpotX, y: devSpotY, z: devSpotZ, targetX: devSpotTargetX, targetY: devSpotTargetY, intensity: devSpotIntensity, angle: devSpotAngle, penumbra: devSpotPenumbra, color: devSpotColor }}
        devTint={{ color: devTintColor, opacity: devTintOpacity }}
      />

      {/* Clan title — tap to toggle stats */}
      <ClanTitle
        name={activeClan.name}
        archetype={activeClan.archetype}
        onClick={toggleStats}
      />

      {/* Stats panel — slides down from title */}
      <StatsPanel clan={activeClan} isOpen={statsOpen} />

      {/* Debug grid overlay + dev controls */}
      <DebugGrid
        devLightScale={devLightScale} onLightScale={setDevLightScale}
        devNormalScale={devNormalScale} onNormalScale={setDevNormalScale}
        devRoughness={devRoughness} onRoughness={setDevRoughness}
        devSpotX={devSpotX} onSpotX={setDevSpotX}
        devSpotY={devSpotY} onSpotY={setDevSpotY}
        devSpotZ={devSpotZ} onSpotZ={setDevSpotZ}
        devSpotIntensity={devSpotIntensity} onSpotIntensity={setDevSpotIntensity}
        devSpotAngle={devSpotAngle} onSpotAngle={setDevSpotAngle}
        devSpotPenumbra={devSpotPenumbra} onSpotPenumbra={setDevSpotPenumbra}
        devSpotTargetX={devSpotTargetX} onSpotTargetX={setDevSpotTargetX}
        devSpotTargetY={devSpotTargetY} onSpotTargetY={setDevSpotTargetY}
        devSpotColor={devSpotColor} onSpotColor={setDevSpotColor}
        devTintColor={devTintColor} onTintColor={setDevTintColor}
        devTintOpacity={devTintOpacity} onTintOpacity={setDevTintOpacity}
        onSave={handleSave}
        onCopy={handleCopy}
      />

      {/* Build number */}
      <div className="build-tag">{__BUILD_HASH__}</div>

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
