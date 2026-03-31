/**
 * ColorWheel — compact inline HSL color picker for mobile.
 * Renders an HSL hue ring + saturation/brightness square.
 * Saves last-used color to localStorage per field name.
 * Touch-friendly — drag on the ring for hue, drag on the square
 * for saturation/brightness.
 */
import { useRef, useState, useEffect, useCallback } from 'react';

const SIZE = 140;
const RING_W = 18;
const INNER = SIZE / 2 - RING_W - 4;

function hslToHex(h, s, l) {
  s /= 100; l /= 100;
  const a = s * Math.min(l, 1 - l);
  const f = (n) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

function hexToHsl(hex) {
  let r = parseInt(hex.slice(1, 3), 16) / 255;
  let g = parseInt(hex.slice(3, 5), 16) / 255;
  let b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) * 60;
    else if (max === g) h = ((b - r) / d + 2) * 60;
    else h = ((r - g) / d + 4) * 60;
  }
  return [Math.round(h), Math.round(s * 100), Math.round(l * 100)];
}

export default function ColorWheel({ value = '#ff0000', onChange, storageKey = 'color-wheel' }) {
  const [hsl, setHsl] = useState(() => hexToHsl(value));
  const canvasRef = useRef(null);
  const dragging = useRef(null); // 'ring' | 'square' | null

  // Sync from parent value
  useEffect(() => {
    setHsl(hexToHsl(value));
  }, [value]);

  // Draw the wheel
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const cx = SIZE / 2, cy = SIZE / 2;
    const outerR = SIZE / 2 - 1;
    const innerR = outerR - RING_W;

    ctx.clearRect(0, 0, SIZE, SIZE);

    // Hue ring
    for (let a = 0; a < 360; a++) {
      const rad = (a - 90) * Math.PI / 180;
      const rad2 = (a - 89) * Math.PI / 180;
      ctx.beginPath();
      ctx.moveTo(cx + innerR * Math.cos(rad), cy + innerR * Math.sin(rad));
      ctx.lineTo(cx + outerR * Math.cos(rad), cy + outerR * Math.sin(rad));
      ctx.lineTo(cx + outerR * Math.cos(rad2), cy + outerR * Math.sin(rad2));
      ctx.lineTo(cx + innerR * Math.cos(rad2), cy + innerR * Math.sin(rad2));
      ctx.closePath();
      ctx.fillStyle = `hsl(${a}, 100%, 50%)`;
      ctx.fill();
    }

    // Hue indicator
    const hRad = (hsl[0] - 90) * Math.PI / 180;
    const midR = (innerR + outerR) / 2;
    ctx.beginPath();
    ctx.arc(cx + midR * Math.cos(hRad), cy + midR * Math.sin(hRad), RING_W / 2 - 1, 0, Math.PI * 2);
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Saturation/Lightness square inside the ring
    const sq = INNER * Math.sqrt(2) * 0.9;
    const sqX = cx - sq / 2, sqY = cy - sq / 2;
    for (let y = 0; y < sq; y++) {
      for (let x = 0; x < sq; x++) {
        const s = (x / sq) * 100;
        const l = 100 - (y / sq) * 100;
        ctx.fillStyle = `hsl(${hsl[0]}, ${s}%, ${l}%)`;
        ctx.fillRect(sqX + x, sqY + y, 1.5, 1.5);
      }
    }

    // SL indicator
    const slX = sqX + (hsl[1] / 100) * sq;
    const slY = sqY + ((100 - hsl[2]) / 100) * sq;
    ctx.beginPath();
    ctx.arc(slX, slY, 5, 0, Math.PI * 2);
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(slX, slY, 4, 0, Math.PI * 2);
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 1;
    ctx.stroke();
  }, [hsl]);

  const getPos = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const touch = e.touches?.[0] || e;
    return { x: touch.clientX - rect.left, y: touch.clientY - rect.top };
  };

  const handleInteraction = useCallback((e) => {
    const { x, y } = getPos(e);
    const cx = SIZE / 2, cy = SIZE / 2;
    const dx = x - cx, dy = y - cy;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const outerR = SIZE / 2 - 1;
    const innerR = outerR - RING_W;
    const sq = INNER * Math.sqrt(2) * 0.9;
    const sqX = cx - sq / 2, sqY = cy - sq / 2;

    if (dragging.current === 'ring' || (!dragging.current && dist > innerR - 4 && dist < outerR + 4)) {
      dragging.current = 'ring';
      let h = Math.round(Math.atan2(dy, dx) * 180 / Math.PI + 90);
      if (h < 0) h += 360;
      const newHsl = [h, hsl[1], hsl[2]];
      setHsl(newHsl);
      onChange?.(hslToHex(...newHsl));
    } else if (dragging.current === 'square' || (!dragging.current && x >= sqX && x <= sqX + sq && y >= sqY && y <= sqY + sq)) {
      dragging.current = 'square';
      const s = Math.round(Math.max(0, Math.min(100, ((x - sqX) / sq) * 100)));
      const l = Math.round(Math.max(0, Math.min(100, 100 - ((y - sqY) / sq) * 100)));
      const newHsl = [hsl[0], s, l];
      setHsl(newHsl);
      onChange?.(hslToHex(...newHsl));
    }
  }, [hsl, onChange]);

  const handleEnd = useCallback(() => {
    dragging.current = null;
    // Save to localStorage on release
    localStorage.setItem(`cw-${storageKey}`, hslToHex(...hsl));
  }, [hsl, storageKey]);

  return (
    <canvas
      ref={canvasRef}
      width={SIZE}
      height={SIZE}
      style={{ touchAction: 'none', cursor: 'pointer', display: 'block', margin: '4px auto' }}
      onPointerDown={handleInteraction}
      onPointerMove={(e) => { if (dragging.current) handleInteraction(e); }}
      onPointerUp={handleEnd}
      onPointerLeave={handleEnd}
    />
  );
}
