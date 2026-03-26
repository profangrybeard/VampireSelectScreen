/**
 * LitSprite — Three.js lit character sprite with normal map support.
 *
 * NORMAL-FIRST WORKFLOW:
 * The diffuse texture is used for its alpha channel (figure shape)
 * and multiplied dark by material.color. All visible surface detail
 * comes from the normal map catching the lights.
 *
 * LIGHTS:
 * - Point light: candle uplight from the floor (always on)
 * - Spot light: film noir key light (active character only)
 * - Volumetric cone: visible light beam behind the character.
 *   Drawn as a second plane at Z=-0.1 with a procedural cone
 *   texture matching the spotlight params. The character's alpha
 *   naturally occludes it — beam visible in the air, blocked by
 *   the figure's silhouette.
 *
 * Pass 1: Grey light only. Clan color plugs into lights at Pass 2.
 */
import { useRef, useEffect } from 'react';
import * as THREE from 'three';

/**
 * Generate a volumetric light cone texture on a 2D canvas.
 * Draws a cone from the spotlight origin, fanning toward the target,
 * with penumbra falloff and noise for the particulate/dust look.
 */
function generateConeTexture(w, h, spotX, spotY, angle, penumbra, intensity) {
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');

  // Clear
  ctx.clearRect(0, 0, w, h);

  // Map spotlight position from Three.js coords to canvas coords
  // Three.js: X -0.5..0.5 → canvas 0..w, Y -1..1 → canvas h..0 (inverted)
  const originX = (spotX + 0.5) * w;
  const originY = (1 - spotY) * (h / 2);

  // Target is center of sprite (0, 0.5) → canvas center
  const targetX = w / 2;
  const targetY = h / 4; // 0.5 in Three.js Y → 25% from top

  // Direction from origin to target
  const dx = targetX - originX;
  const dy = targetY - originY;
  const dist = Math.sqrt(dx * dx + dy * dy);
  const dirX = dx / dist;
  const dirY = dy / dist;

  // Cone half-angle in 2D (radians)
  const halfAngle = angle * 1.2; // slightly wider than the spot for the volumetric feel

  // Perpendicular direction
  const perpX = -dirY;
  const perpY = dirX;

  // Draw the cone as a gradient-filled triangle/fan
  // We'll iterate over pixels for the noise + cone shape
  const imageData = ctx.createImageData(w, h);
  const data = imageData.data;

  // Simple PRNG for noise (deterministic per pixel)
  const noise = (x, y) => {
    const n = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
    return n - Math.floor(n);
  };

  const maxReach = Math.max(w, h) * 1.5;
  const coneAlpha = Math.min(1, intensity * 0.02); // very subtle base

  for (let py = 0; py < h; py++) {
    for (let px = 0; px < w; px++) {
      // Vector from origin to this pixel
      const vx = px - originX;
      const vy = py - originY;
      const vDist = Math.sqrt(vx * vx + vy * vy);

      if (vDist < 1) continue; // skip origin pixel

      // Angle between the direction vector and the pixel vector
      const dot = (vx * dirX + vy * dirY) / vDist;
      const pixelAngle = Math.acos(Math.max(-1, Math.min(1, dot)));

      // Is this pixel within the cone?
      if (pixelAngle > halfAngle) continue;

      // Penumbra falloff at the edges
      const edgeFactor = pixelAngle / halfAngle; // 0 at center, 1 at edge
      let falloff;
      if (penumbra <= 0) {
        falloff = edgeFactor < 1 ? 1 : 0;
      } else {
        const penumbraStart = 1 - penumbra;
        if (edgeFactor < penumbraStart) {
          falloff = 1;
        } else {
          falloff = 1 - (edgeFactor - penumbraStart) / penumbra;
        }
      }

      // Distance falloff — further from origin = dimmer
      const distFalloff = Math.max(0, 1 - vDist / maxReach);

      // Only show cone going AWAY from origin toward target (dot > 0)
      if (dot < 0) continue;

      // Combine
      let brightness = falloff * distFalloff * coneAlpha;

      // Add noise for particulate/dust
      const n = noise(px, py);
      brightness *= 0.6 + n * 0.4; // 60-100% variation

      // Warm grey color
      const r = 200;
      const g = 191;
      const b = 176;
      const a = Math.round(brightness * 255);

      const idx = (py * w + px) * 4;
      data[idx] = r;
      data[idx + 1] = g;
      data[idx + 2] = b;
      data[idx + 3] = a;
    }
  }

  ctx.putImageData(imageData, 0, 0);
  return canvas;
}

export default function LitSprite({
  diffuseUrl,
  normalUrl = null,
  lightDir = { x: 0, y: -1, z: 0.5 },
  lightIntensity = 2.5,
  ambientIntensity = 0.02,
  normalScale = 1.5,
  roughness = 0.4,
  baseColor = 0x1a1a1a,
  spotActive = false,
  spotPos = {},
}) {
  const canvasRef = useRef(null);
  const stateRef = useRef(null);

  // Build the Three.js scene once
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      powerPreference: 'low-power',
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.setClearColor(0x000000, 0);

    const scene = new THREE.Scene();

    // Orthographic camera — matches the 1:2 plane exactly.
    const camera = new THREE.OrthographicCamera(-0.5, 0.5, 1, -1, 0.1, 10);
    camera.position.z = 2;

    // --- VOLUMETRIC CONE PLANE (behind character) ---
    const coneGeometry = new THREE.PlaneGeometry(1, 2);
    const coneTexture = new THREE.CanvasTexture(
      generateConeTexture(128, 256, -0.5, 1.0, 0.3, 0.5, 3.0)
    );
    coneTexture.minFilter = THREE.LinearFilter;
    coneTexture.magFilter = THREE.LinearFilter;
    const coneMaterial = new THREE.MeshBasicMaterial({
      map: coneTexture,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const coneMesh = new THREE.Mesh(coneGeometry, coneMaterial);
    coneMesh.position.z = -0.1; // behind the character
    coneMesh.visible = false; // off by default
    scene.add(coneMesh);

    // --- CHARACTER PLANE ---
    const geometry = new THREE.PlaneGeometry(1, 2);
    const material = new THREE.MeshStandardMaterial({
      color: new THREE.Color(baseColor),
      transparent: true,
      alphaTest: 0.5,
      side: THREE.FrontSide,
      roughness: roughness,
      metalness: 0.0,
      emissive: new THREE.Color(0x060606),
      emissiveIntensity: 1.0,
    });

    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    // --- LIGHTS ---
    const pointLight = new THREE.PointLight(0xc8bfb0, lightIntensity, 8, 1.0);
    scene.add(pointLight);

    const ambientLight = new THREE.AmbientLight(0x888888, ambientIntensity);
    scene.add(ambientLight);

    const spotLight = new THREE.SpotLight(0xc8bfb0, 0, 10, 0.3, 0.5, 1.0);
    spotLight.position.set(-0.5, 1.0, 1.5);
    spotLight.target.position.set(0, 0.5, 0);
    scene.add(spotLight);
    scene.add(spotLight.target);

    // Render function
    const render = () => {
      const w = canvas.clientWidth || 200;
      const h = canvas.clientHeight || 400;
      renderer.setSize(w, h, false);
      renderer.render(scene, camera);
    };

    // Load textures
    const loader = new THREE.TextureLoader();

    loader.load(diffuseUrl, (tex) => {
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.minFilter = THREE.LinearFilter;
      tex.magFilter = THREE.LinearFilter;
      material.map = tex;
      material.needsUpdate = true;
      render();
    });

    if (normalUrl) {
      loader.load(normalUrl, (tex) => {
        tex.minFilter = THREE.LinearFilter;
        tex.magFilter = THREE.LinearFilter;
        material.normalMap = tex;
        material.normalScale.set(normalScale, normalScale);
        material.needsUpdate = true;
        render();
      });
    }

    stateRef.current = {
      renderer, scene, camera,
      pointLight, ambientLight, spotLight,
      coneMesh, coneMaterial, coneTexture,
      material, geometry, mesh, render,
    };

    render();

    return () => {
      geometry.dispose();
      coneGeometry.dispose();
      material.dispose();
      coneMaterial.dispose();
      coneTexture.dispose();
      if (material.map) material.map.dispose();
      if (material.normalMap) material.normalMap.dispose();
      renderer.dispose();
      stateRef.current = null;
    };
  }, [diffuseUrl, normalUrl]);

  // Update tunable props and re-render
  useEffect(() => {
    const state = stateRef.current;
    if (!state) return;

    const { pointLight, ambientLight, spotLight, coneMesh, coneMaterial, coneTexture, material, render } = state;

    // Point light
    pointLight.position.set(lightDir.x, lightDir.y, lightDir.z);
    pointLight.intensity = lightIntensity;
    ambientLight.intensity = ambientIntensity;

    // Spotlight + volumetric cone — only on active character
    if (spotActive) {
      const sx = spotPos.x ?? -0.5;
      const sy = spotPos.y ?? 1.0;
      const sz = spotPos.z ?? 1.5;
      const sIntensity = spotPos.intensity ?? 3.0;
      const sAngle = spotPos.angle ?? 0.3;
      const sPenumbra = spotPos.penumbra ?? 0.5;

      spotLight.intensity = sIntensity;
      spotLight.position.set(sx, sy, sz);
      spotLight.angle = sAngle;
      spotLight.penumbra = sPenumbra;

      // Regenerate cone texture to match spotlight params
      const newConeCanvas = generateConeTexture(128, 256, sx, sy, sAngle, sPenumbra, sIntensity);
      coneTexture.image = newConeCanvas;
      coneTexture.needsUpdate = true;
      coneMesh.visible = true;
    } else {
      spotLight.intensity = 0;
      coneMesh.visible = false;
    }

    // Material tunables
    material.roughness = roughness;
    material.color.set(baseColor);
    if (material.normalMap) {
      material.normalScale.set(normalScale, normalScale);
    }

    render();
  }, [lightDir.x, lightDir.y, lightDir.z, lightIntensity, ambientIntensity, normalScale, roughness, baseColor, spotActive, spotPos.x, spotPos.y, spotPos.z, spotPos.intensity, spotPos.angle, spotPos.penumbra]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        width: '100%',
        height: '100%',
        display: 'block',
        pointerEvents: 'none',
      }}
    />
  );
}
