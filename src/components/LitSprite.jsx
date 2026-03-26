/**
 * LitSprite — Three.js lit character sprite with normal map support.
 *
 * Renders a transparent PNG on a plane with real per-pixel lighting.
 * The point light position is driven by the parent (Pentagram) based
 * on the candle/floor light position relative to each character.
 *
 * Texture pipeline per clan:
 *   diffuse:  src/silhouettes/art/{clanId}.png        (required)
 *   normal:   src/silhouettes/art/{clanId}-normal.png  (optional)
 *
 * Pass 1: Grey light only. Clan color plugs into the point light at Pass 2.
 */
import { useRef, useEffect } from 'react';
import * as THREE from 'three';

export default function LitSprite({
  diffuseUrl,
  normalUrl = null,
  lightDir = { x: 0, y: -1, z: 0.5 },
  lightIntensity = 1.5,
  ambientIntensity = 0.08,
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
    // left/right = -0.5 to 0.5 (1 unit wide)
    // top/bottom = 1 to -1 (2 units tall)
    const camera = new THREE.OrthographicCamera(-0.5, 0.5, 1, -1, 0.1, 10);
    camera.position.z = 2;

    // Plane geometry — 1 wide x 2 tall, matching the 1:2 card aspect.
    // Centered at origin so it fills the camera frustum exactly.
    const geometry = new THREE.PlaneGeometry(1, 2);

    // Material — MeshStandardMaterial for normal map + specular support
    const material = new THREE.MeshStandardMaterial({
      transparent: true,
      alphaTest: 0.01,
      side: THREE.FrontSide,
      roughness: 0.7,
      metalness: 0.0,
      emissive: new THREE.Color(0x0a0a0a),
      emissiveIntensity: 1.0,
    });

    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    // Point light — driven by parent. Warm grey for Pass 1.
    const pointLight = new THREE.PointLight(0xc8bfb0, 1.5, 6, 1.5);
    scene.add(pointLight);

    // Ambient — very low. The point light does the work.
    const ambientLight = new THREE.AmbientLight(0x888888, 0.08);
    scene.add(ambientLight);

    // Render function — called after texture loads AND on prop changes
    const render = () => {
      const w = canvas.clientWidth || 200;
      const h = canvas.clientHeight || 400;
      renderer.setSize(w, h, false);
      renderer.render(scene, camera);
    };

    // Load textures — render after each loads
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
        material.normalScale.set(1.0, 1.0);
        material.needsUpdate = true;
        render();
      });
    }

    stateRef.current = {
      renderer,
      scene,
      camera,
      pointLight,
      ambientLight,
      material,
      geometry,
      mesh,
      render,
    };

    // Initial render (blank until textures load, but sizes the canvas)
    render();

    return () => {
      geometry.dispose();
      material.dispose();
      if (material.map) material.map.dispose();
      if (material.normalMap) material.normalMap.dispose();
      renderer.dispose();
      stateRef.current = null;
    };
  }, [diffuseUrl, normalUrl]);

  // Update light and re-render whenever props change
  useEffect(() => {
    const state = stateRef.current;
    if (!state) return;

    const { pointLight, ambientLight, render } = state;

    pointLight.position.set(lightDir.x, lightDir.y, lightDir.z);
    pointLight.intensity = lightIntensity;
    ambientLight.intensity = ambientIntensity;

    render();
  }, [lightDir.x, lightDir.y, lightDir.z, lightIntensity, ambientIntensity]);

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
