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
 * Volumetric cone is handled by VolumetricCone.jsx (screen-space).
 *
 * Pass 1: Grey light only. Clan color plugs into lights at Pass 2.
 */
import { useRef, useEffect } from 'react';
import * as THREE from 'three';

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
  tint = {},
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

    // --- ADDITIVE TINT LAYER ---
    // A plane in front of the character with additive blending.
    // Uses the diffuse alpha as its own alpha so the tint only
    // appears on the figure, not the background.
    const tintGeometry = new THREE.PlaneGeometry(1, 2);
    const tintMaterial = new THREE.MeshBasicMaterial({
      color: new THREE.Color(0x2d4a1e),
      transparent: true,
      opacity: 0,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const tintMesh = new THREE.Mesh(tintGeometry, tintMaterial);
    tintMesh.position.z = 0.01; // just in front of character
    tintMesh.renderOrder = 1;
    scene.add(tintMesh);

    // --- LIGHTS ---
    const pointLight = new THREE.PointLight(0xc8bfb0, lightIntensity, 8, 1.0);
    scene.add(pointLight);

    const ambientLight = new THREE.AmbientLight(0x888888, ambientIntensity);
    scene.add(ambientLight);

    // Up to 3 spotlights — key/fill/accent rig per character
    const spotLights = [];
    for (let s = 0; s < 3; s++) {
      const sl = new THREE.SpotLight(0xc8bfb0, 0, 10, 0.3, 0.5, 1.0);
      sl.position.set(-0.5, 1.0, 1.5);
      sl.target.position.set(0, 0.5, 0);
      scene.add(sl);
      scene.add(sl.target);
      spotLights.push(sl);
    }

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
      // Share the texture with the tint layer — its alpha channel
      // masks the tint to the figure shape. With additive blending,
      // only the tint color matters (dark diffuse pixels add ~nothing).
      tintMaterial.map = tex;
      tintMaterial.alphaTest = 0.5;
      tintMaterial.needsUpdate = true;
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
      pointLight, ambientLight, spotLights,
      material, geometry, mesh,
      tintMaterial, tintMesh,
      render,
    };

    render();

    return () => {
      geometry.dispose();
      tintGeometry.dispose();
      tintMaterial.dispose();
      material.dispose();
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

    const { pointLight, ambientLight, spotLights, material, tintMaterial, render } = state;

    // Point light
    pointLight.position.set(lightDir.x, lightDir.y, lightDir.z);
    pointLight.intensity = lightIntensity;
    ambientLight.intensity = ambientIntensity;

    // Spotlights — only on active character. Up to 3 from spots array.
    const spots = (spotActive && spotPos.spots) ? spotPos.spots : [];
    for (let s = 0; s < spotLights.length; s++) {
      const sl = spotLights[s];
      const cfg = spots[s];
      if (cfg) {
        sl.intensity = cfg.intensity ?? 3.0;
        sl.position.set(cfg.x ?? -0.5, cfg.y ?? 1.0, cfg.z ?? 1.5);
        sl.target.position.set(cfg.targetX ?? 0, cfg.targetY ?? 0.5, 0);
        sl.angle = cfg.angle ?? 0.3;
        sl.penumbra = cfg.penumbra ?? 0.5;
        if (cfg.color) sl.color.set(cfg.color);
      } else {
        sl.intensity = 0;
      }
    }

    // Material tunables
    material.roughness = roughness;
    material.color.set(baseColor);
    if (material.normalMap) {
      material.normalScale.set(normalScale, normalScale);
    }

    // Additive tint layer
    if (tint.color) tintMaterial.color.set(tint.color);
    tintMaterial.opacity = tint.opacity ?? 0;

    render();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lightDir.x, lightDir.y, lightDir.z, lightIntensity, ambientIntensity, normalScale, roughness, baseColor, spotActive, JSON.stringify(spotPos), tint.color, tint.opacity]);

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
