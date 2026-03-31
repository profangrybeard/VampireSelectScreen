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
import CelebrationOverlay from './components/CelebrationOverlay.jsx';
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
  // 'browse' | 'holding' | 'celebrating' | 'trailer' | 'returning'
  const [holdProgress, setHoldProgress] = useState(0);
  const [selectedClanIndex, setSelectedClanIndex] = useState(null);

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

  // === PERSISTENCE — ONE SOURCE OF TRUTH ===
  // Single localStorage key: vss-settings
  // Format: { nosferatu: { slots: { A: {...}, B: {...}, C: {...} }, active: "A" }, ... }
  // Bump SETTINGS_VERSION to invalidate all saved presets when defaults change.
  const STORAGE_KEY = 'vss-settings';
  const SETTINGS_VERSION = 3;

  // Wipe stale localStorage when version changes
  useEffect(() => {
    const ver = localStorage.getItem('vss-settings-version');
    if (ver !== String(SETTINGS_VERSION)) {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.setItem('vss-settings-version', String(SETTINGS_VERSION));
    }
  }, []);

  const readStorage = useCallback(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); }
    catch { return {}; }
  }, []);

  const writeStorage = useCallback((data) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, []);

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

  // Get the effective settings for a clan: active slot → CLANS fallback
  const getEffectiveForClan = useCallback((clanId) => {
    const store = readStorage();
    const clanData = store[clanId];
    if (clanData?.active && clanData.slots?.[clanData.active]) {
      return clanData.slots[clanData.active];
    }
    // Fallback to CLANS defaults
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
  }, [readStorage]);

  const [activeSlot, setActiveSlot] = useState(() => {
    const store = readStorage();
    return store[CLANS[0]?.id]?.active || null;
  });

  // Save to slot: write current values, mark as active, persist immediately
  const saveToSlot = useCallback((slot) => {
    const clanId = CLANS[activeIndex]?.id || 'unknown';
    const s = getDevSettings();
    const store = readStorage();
    if (!store[clanId]) store[clanId] = { slots: {}, active: null };
    store[clanId].slots[slot] = s;
    store[clanId].active = slot;
    writeStorage(store);
    setActiveSlot(slot);
  }, [getDevSettings, activeIndex, readStorage, writeStorage]);

  // Load from slot: apply values, mark as active
  const loadFromSlot = useCallback((slot) => {
    const clanId = CLANS[activeIndex]?.id || 'unknown';
    const store = readStorage();
    const s = store[clanId]?.slots?.[slot];
    if (s) {
      applySettings(s);
      store[clanId].active = slot;
      writeStorage(store);
      setActiveSlot(slot);
    }
  }, [activeIndex, readStorage, writeStorage, applySettings]);

  // Reset to source defaults: load clans.js values for current clan
  const resetToDefaults = useCallback(() => {
    const clan = CLANS[activeIndex];
    if (!clan) return;
    const lighting = clan.lighting || {};
    const spot = lighting.spots?.[0] || {};
    applySettings({
      lightScale: lighting.lightScale ?? 1.0,
      normalScale: lighting.normalScale ?? 1.5,
      roughness: lighting.roughness ?? 0.4,
      spot: { x: spot.x ?? -0.5, y: spot.y ?? 1.0, z: spot.z ?? 1.5, intensity: spot.intensity ?? 3.0, angle: spot.angle ?? 0.3, penumbra: spot.penumbra ?? 0.5, targetX: spot.targetX ?? 0, targetY: spot.targetY ?? 0.5, color: spot.color || '#c8bfb0' },
      tint: lighting.tint || { color: '#000000', opacity: 0 },
      lineWeight: lighting.lineWeight ?? 0.5,
      lineSmooth: lighting.lineSmooth ?? 0.15,
      rimDarkness: lighting.rimDarkness ?? 0.0,
      rimWidth: lighting.rimWidth ?? 0.5,
    });
    // Clear active slot — we're back to source
    const store = readStorage();
    const clanId = clan.id;
    if (store[clanId]) {
      store[clanId].active = null;
      writeStorage(store);
    }
    setActiveSlot(null);
  }, [activeIndex, applySettings, readStorage, writeStorage]);

  // Get slot preview for UI
  const getSlotPreview = useCallback((slot) => {
    const clanId = CLANS[activeIndex]?.id || 'unknown';
    const store = readStorage();
    return store[clanId]?.slots?.[slot] || null;
  }, [activeIndex, readStorage]);

  const handleCopy = useCallback(() => {
    const clanId = CLANS[activeIndex]?.id || 'unknown';
    const s = { clan: clanId, ...getDevSettings() };
    navigator.clipboard.writeText(JSON.stringify(s, null, 2)).catch(() => {
      window.prompt('Copy this JSON:', JSON.stringify(s));
    });
  }, [getDevSettings, activeIndex]);

  // On mount: load the active slot for the initial clan
  useEffect(() => {
    const clanId = CLANS[0]?.id;
    const s = getEffectiveForClan(clanId);
    applySettings(s);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // On rotation: load the new clan's settings IMMEDIATELY so the dev
  // sliders already hold the target values by the time the Pentagram
  // lerp reaches 1. The old approach (setTimeout 460ms) caused a flash
  // because lerpT hit 1 before dev state caught up.
  useEffect(() => {
    const clanId = CLANS[activeIndex]?.id;
    const s = getEffectiveForClan(clanId);
    applySettings(s);
    const store = readStorage();
    setActiveSlot(store[clanId]?.active || null);
  }, [activeIndex, getEffectiveForClan, applySettings, readStorage]);

  const rotate = useCallback((direction) => {
    if (transitioning || selectionPhase !== 'browse') return;
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
    setSelectionPhase('celebrating');
    setHoldProgress(0);
  }, [activeIndex]);

  const handleHoldCancel = useCallback(() => {
    setSelectionPhase('browse');
    setHoldProgress(0);
  }, []);

  const handleCelebrationComplete = useCallback(() => {
    setSelectionPhase('trailer');
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
    selectionPhase === 'holding' && 'screen--holding',
    selectionPhase === 'celebrating' && 'screen--celebrating',
    (selectionPhase === 'trailer' || selectionPhase === 'returning') && 'screen--trailer',
  ].filter(Boolean).join(' ');

  return (
    <div className={screenClass}>
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
        selectionPhase={selectionPhase}
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
        activeSlot={activeSlot}
        onSaveSlot={saveToSlot}
        onLoadSlot={loadFromSlot}
        getSlotPreview={getSlotPreview}
      />

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

      {/* Swipe zone — center area, avoids Android edge gesture zones */}
      <SwipeZone onSwipeLeft={() => rotate('left')} onSwipeRight={() => rotate('right')} />

      {/* Hold-to-Embrace — covers center silhouette area */}
      <EmbraceHold
        active={selectionPhase === 'browse' && !transitioning}
        holdProgress={holdProgress}
        onHoldStart={handleHoldStart}
        onHoldProgress={handleHoldProgress}
        onHoldComplete={handleHoldComplete}
        onHoldCancel={handleHoldCancel}
        accent={activeClan.accent}
      />

      {/* Celebration — white flash + supernova + blackout */}
      <CelebrationOverlay
        active={selectionPhase === 'celebrating'}
        accent={activeClan.accent}
        onComplete={handleCelebrationComplete}
      />

      {/* Trailer — vertically cropped YouTube embed */}
      <TrailerEmbed
        visible={selectionPhase === 'trailer'}
        onClose={handleTrailerClose}
      />

      {/* Return fade — reuses blackout overlay for reverse transition */}
      {selectionPhase === 'returning' && (
        <div className="celebration-blackout celebration-blackout--active" style={{ opacity: 1, transition: 'opacity 600ms ease-out' }} />
      )}
    </div>
  );
}
