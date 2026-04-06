/**
 * Vampire Clan Select Screen
 * AI 201 — Project 1: Hero Faction Screen (Instructor Demo)
 *
 * Current Pass: 1 — Monochrome Silhouettes
 * Grey values only. No color.
 */
import { useState, useCallback, useEffect, useRef } from 'react';
import './App.css';
import CLANS from './data/clans.js';
import Nosferatu from './silhouettes/Nosferatu.jsx';
import ClanTitle from './components/ClanTitle.jsx';
import StatsPanel from './components/StatsPanel.jsx';
import IndicatorDots from './components/IndicatorDots.jsx';
import Pentagram from './components/Pentagram.jsx';
import DebugGrid from './components/DebugGrid.jsx';
import EmbraceHold from './components/EmbraceHold.jsx';
import TrailerEmbed from './components/TrailerEmbed.jsx';

// Swipe detection for the center card area.
// Inset from edges to avoid Android back gesture zones.
function SwipeZone({ onSwipeLeft, onSwipeRight }) {
  const ref = useRef(null);
  const touchStart = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const handleTouchStart = (e) => {
      const t = e.touches[0];
      touchStart.current = { x: t.clientX, y: t.clientY, time: Date.now() };
    };

    const handleTouchEnd = (e) => {
      if (!touchStart.current) return;
      const t = e.changedTouches[0];
      const dx = t.clientX - touchStart.current.x;
      const dy = t.clientY - touchStart.current.y;
      const dt = Date.now() - touchStart.current.time;
      touchStart.current = null;

      // Must be horizontal, fast enough, and far enough
      if (Math.abs(dx) < 40 || Math.abs(dy) > Math.abs(dx) * 0.7 || dt > 500) return;

      if (dx < 0) onSwipeLeft?.();
      else onSwipeRight?.();
    };

    el.addEventListener('touchstart', handleTouchStart, { passive: true });
    el.addEventListener('touchend', handleTouchEnd, { passive: true });
    return () => {
      el.removeEventListener('touchstart', handleTouchStart);
      el.removeEventListener('touchend', handleTouchEnd);
    };
  }, [onSwipeLeft, onSwipeRight]);

  return <div ref={ref} className="swipe-zone" />;
}

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

  // === EMBRACE SELECTION FLOW ===
  const [selectionPhase, setSelectionPhase] = useState('browse');
  // 'browse' | 'holding' | 'blackout' | 'trailer' | 'returning'
  const [holdProgress, setHoldProgress] = useState(0);
  const [selectedClanIndex, setSelectedClanIndex] = useState(null);
  const [idle, setIdle] = useState(false);
  const idleTimer = useRef(null);

  // Dev controls — tunable lighting props
  const [devLightScale, setDevLightScale] = useState(1.0);
  const [devNormalScale, setDevNormalScale] = useState(3.7);
  const [devRoughness, setDevRoughness] = useState(0.55);

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

  // Soft-light tint controls
  const [devTintColor, setDevTintColor] = useState('#ffffff');
  const [devTintOpacity, setDevTintOpacity] = useState(0.7);

  // Ink normalization controls
  const [devLineWeight, setDevLineWeight] = useState(0.5);
  const [devLineSmooth, setDevLineSmooth] = useState(0.15);

  // Dark inner rim controls
  const [devRimDarkness, setDevRimDarkness] = useState(0.6);
  const [devRimWidth, setDevRimWidth] = useState(0.12);

  // === SETTINGS — clans.js is the single source of truth ===
  // Dev sliders override at rest (lerpT >= 1) for live tuning.
  // Copy captures current slider state. Reset reloads clans.js defaults.

  const getDevSettings = useCallback(() => ({
    lightScale: devLightScale,
    normalScale: devNormalScale,
    roughness: devRoughness,
    spot: { x: devSpotX, y: devSpotY, z: devSpotZ, intensity: devSpotIntensity, angle: devSpotAngle, penumbra: devSpotPenumbra, targetX: devSpotTargetX, targetY: devSpotTargetY, color: devSpotColor },
    tint: { color: devTintColor, opacity: devTintOpacity },
    lineWeight: devLineWeight,
    lineSmooth: devLineSmooth,
    rimDarkness: devRimDarkness,
    rimWidth: devRimWidth,
  }), [devLightScale, devNormalScale, devRoughness, devSpotX, devSpotY, devSpotZ, devSpotIntensity, devSpotAngle, devSpotPenumbra, devSpotTargetX, devSpotTargetY, devSpotColor, devTintColor, devTintOpacity, devLineWeight, devLineSmooth, devRimDarkness, devRimWidth]);

  const applySettings = useCallback((s) => {
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
    if (s.lineWeight != null) setDevLineWeight(s.lineWeight);
    if (s.lineSmooth != null) setDevLineSmooth(s.lineSmooth);
    if (s.rimDarkness != null) setDevRimDarkness(s.rimDarkness);
    if (s.rimWidth != null) setDevRimWidth(s.rimWidth);
  }, []);

  // Read clan defaults directly from clans.js — no localStorage
  const getClanDefaults = useCallback((clanId) => {
    const clan = CLANS.find(c => c.id === clanId);
    const lighting = clan?.lighting || {};
    const spot = lighting.spots?.[0] || {};
    return {
      lightScale: lighting.lightScale ?? 1.0,
      normalScale: lighting.normalScale ?? 1.5,
      roughness: lighting.roughness ?? 0.4,
      spot: { x: spot.x ?? -0.5, y: spot.y ?? 1.0, z: spot.z ?? 1.5, intensity: spot.intensity ?? 3.0, angle: spot.angle ?? 0.3, penumbra: spot.penumbra ?? 0.5, targetX: spot.targetX ?? 0, targetY: spot.targetY ?? 0.5, color: spot.color || '#c8bfb0' },
      tint: lighting.tint || { color: '#000000', opacity: 0 },
      lineWeight: lighting.lineWeight ?? 0.5,
      lineSmooth: lighting.lineSmooth ?? 0.15,
      rimDarkness: lighting.rimDarkness ?? 0.0,
      rimWidth: lighting.rimWidth ?? 0.5,
    };
  }, []);

  // Reset to source defaults: load clans.js values for current clan
  const resetToDefaults = useCallback(() => {
    const clan = CLANS[activeIndex];
    if (!clan) return;
    applySettings(getClanDefaults(clan.id));
  }, [activeIndex, applySettings, getClanDefaults]);

  const handleCopy = useCallback(() => {
    const clanId = CLANS[activeIndex]?.id || 'unknown';
    const s = { clan: clanId, ...getDevSettings() };
    navigator.clipboard.writeText(JSON.stringify(s, null, 2)).catch(() => {
      window.prompt('Copy this JSON:', JSON.stringify(s));
    });
  }, [getDevSettings, activeIndex]);

  // On mount: load defaults for the initial clan
  useEffect(() => {
    applySettings(getClanDefaults(CLANS[0]?.id));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // On rotation: load the new clan's clans.js defaults into dev sliders
  useEffect(() => {
    applySettings(getClanDefaults(CLANS[activeIndex]?.id));
  }, [activeIndex, getClanDefaults, applySettings]);

  // Idle timer — show "Hold to Embrace" after 3s of no interaction
  const resetIdle = useCallback(() => {
    setIdle(false);
    clearTimeout(idleTimer.current);
    idleTimer.current = setTimeout(() => setIdle(true), 3000);
  }, []);

  // Start idle timer on mount and when phase returns to browse
  useEffect(() => {
    if (selectionPhase === 'browse') resetIdle();
    return () => clearTimeout(idleTimer.current);
  }, [selectionPhase, activeIndex, resetIdle]);

  const rotate = useCallback((direction) => {
    if (transitioning || selectionPhase !== 'browse') return;
    resetIdle();
    setTransitioning(true);
    setPrevActiveIndex(activeIndex);
    setActiveIndex((prev) => {
      return direction === 'left'
        ? (prev - 1 + CLANS.length) % CLANS.length
        : (prev + 1) % CLANS.length;
    });
    setRotationDeg((prev) => direction === 'left' ? prev - 72 : prev + 72);
    setTimeout(() => setTransitioning(false), 420);
  }, [transitioning, activeIndex, resetIdle]);

  const toggleStats = useCallback(() => {
    setStatsOpen((prev) => !prev);
  }, []);

  // === EMBRACE HANDLERS ===
  const handleHoldStart = useCallback(() => {
    if (selectionPhase !== 'browse' || transitioning) return;
    setSelectionPhase('holding');
    setStatsOpen(false);
    setHoldProgress(0);
  }, [selectionPhase, transitioning]);

  const handleHoldProgress = useCallback((progress) => {
    setHoldProgress(progress);
  }, []);

  const handleHoldComplete = useCallback(() => {
    setSelectedClanIndex(activeIndex);
    setHoldProgress(0);
    // Go black first, then bring up trailer after a beat
    setSelectionPhase('blackout');
    setTimeout(() => setSelectionPhase('trailer'), 400);
  }, [activeIndex]);

  const handleHoldCancel = useCallback(() => {
    setSelectionPhase('browse');
    setHoldProgress(0);
  }, []);

  const handleTrailerClose = useCallback(() => {
    setSelectionPhase('returning');
    setTimeout(() => {
      setSelectionPhase('browse');
      setSelectedClanIndex(null);
    }, 600);
  }, []);

  const activeClan = CLANS[activeIndex];

  // Screen class drives CSS phase gating
  const screenClass = [
    'screen',
    idle && selectionPhase === 'browse' && 'screen--idle',
    selectionPhase === 'holding' && 'screen--holding',
    (selectionPhase === 'blackout' || selectionPhase === 'trailer' || selectionPhase === 'returning') && 'screen--trailer',
  ].filter(Boolean).join(' ');

  return (
    <div className={screenClass} style={{ '--hold-progress': holdProgress }}>
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
        devLineWeight={devLineWeight}
        devLineSmooth={devLineSmooth}
        devRimDarkness={devRimDarkness}
        devRimWidth={devRimWidth}
        holdProgress={holdProgress}
      />

      {/* Clan title — tap to toggle stats */}
      <ClanTitle
        name={activeClan.name}
        archetype={activeClan.archetype}
        accent={activeClan.accent}
        statsOpen={statsOpen}
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
        devLineWeight={devLineWeight} onLineWeight={setDevLineWeight}
        devLineSmooth={devLineSmooth} onLineSmooth={setDevLineSmooth}
        devRimDarkness={devRimDarkness} onRimDarkness={setDevRimDarkness}
        devRimWidth={devRimWidth} onRimWidth={setDevRimWidth}
        onCopy={handleCopy}
        onReset={resetToDefaults}
      />

      {/* Tap zones */}
      <div
        className="tap-zone tap-zone--left"
        onClick={() => rotate('right')}
        aria-label="Previous clan"
      />
      <div
        className="tap-zone tap-zone--right"
        onClick={() => rotate('left')}
        aria-label="Next clan"
      />

      {/* Swipe zone — center area, avoids Android edge gesture zones */}
      <SwipeZone onSwipeLeft={() => rotate('left')} onSwipeRight={() => rotate('right')} />

      {/* Embrace signifier — fades in after idle */}
      <div className="embrace-signifier">
        <span className="embrace-signifier__touch">Hold to Embrace</span>
        <span className="embrace-signifier__mouse">Double-Click to Embrace</span>
      </div>

      {/* Hold-to-Embrace — covers center silhouette area */}
      <EmbraceHold
        active={selectionPhase === 'browse' && !transitioning}
        onHoldStart={handleHoldStart}
        onHoldProgress={handleHoldProgress}
        onHoldComplete={handleHoldComplete}
        onHoldCancel={handleHoldCancel}
      />

      {/* Blackout — solid black between hold and trailer */}
      {(selectionPhase === 'blackout' || selectionPhase === 'trailer' || selectionPhase === 'returning') && (
        <div style={{ position: 'absolute', inset: 0, zIndex: 44, background: '#000', pointerEvents: 'none' }} />
      )}

      {/* Trailer — vertically cropped YouTube embed */}
      <TrailerEmbed
        visible={selectionPhase === 'trailer'}
        preload={selectionPhase === 'holding' || selectionPhase === 'blackout'}
        onClose={handleTrailerClose}
      />
    </div>
  );
}
