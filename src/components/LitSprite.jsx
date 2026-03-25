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
 * When a normal map is present, the shader computes per-pixel lighting
 * from the point light — rim light, specular, bump response. Without
 * a normal map, the material uses flat normals (the plane's face normal)
 * so the sprite still responds to light direction, just uniformly.
 *
 * Pass 1: Grey light only. Clan color plugs into the point light at Pass 2.
 */
import { useRef, useEffect, useMemo } from 'react';
import * as THREE from 'three';

export default function LitSprite({
  diffuseUrl,
  normalUrl = null,
  lightDir = { x: 0, y: -1, z: 0.5 },
  lightIntensity = 1.5,
  ambientIntensity = 0.08,
  width = 200,
  height = 400,
}) {
  const canvasRef = useRef(null);
  const stateRef = useRef(null);
  const frameRef = useRef(null);

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

    const scene = new THREE.Scene();

    // Orthographic camera — sprite fills the view
    // Aspect 1:2 to match the card viewBox
    const camera = new THREE.OrthographicCamera(-0.5, 0.5, 1, 0, 0.1, 10);
    camera.position.z = 2;

    // Plane geometry — 1:2 aspect matching the PNG card
    const geometry = new THREE.PlaneGeometry(1, 2);

    // Material — MeshStandardMaterial for normal map + specular support
    const material = new THREE.MeshStandardMaterial({
      transparent: true,
      side: THREE.FrontSide,
      roughness: 0.7,
      metalness: 0.0,
      // Slightly emissive so the silhouette isn't pure black in shadow
      emissive: new THREE.Color(0x0a0a0a),
      emissiveIntensity: 1.0,
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(0, 0.5, 0); // Center the 1:2 plane in the camera view
    scene.add(mesh);

    // Point light — driven by parent. Warm grey for Pass 1.
    const pointLight = new THREE.PointLight(0xc8bfb0, 1.5, 6, 1.5);
    scene.add(pointLight);

    // Ambient — very low. The point light does the work.
    const ambientLight = new THREE.AmbientLight(0x888888, 0.08);
    scene.add(ambientLight);

    // Load textures
    const loader = new THREE.TextureLoader();

    loader.load(diffuseUrl, (tex) => {
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.minFilter = THREE.LinearFilter;
      tex.magFilter = THREE.LinearFilter;
      material.map = tex;
      material.needsUpdate = true;
    });

    if (normalUrl) {
      loader.load(normalUrl, (tex) => {
        tex.minFilter = THREE.LinearFilter;
        tex.magFilter = THREE.LinearFilter;
        material.normalMap = tex;
        material.normalScale.set(1.0, 1.0);
        material.needsUpdate = true;
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
    };

    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
      geometry.dispose();
      material.dispose();
      if (material.map) material.map.dispose();
      if (material.normalMap) material.normalMap.dispose();
      renderer.dispose();
      stateRef.current = null;
    };
  }, [diffuseUrl, normalUrl]);

  // Update light and render whenever props change
  useEffect(() => {
    const state = stateRef.current;
    if (!state) return;

    const { renderer, scene, camera, pointLight, ambientLight } = state;

    // Position the light relative to the sprite
    // lightDir.x: horizontal offset (negative = light from left)
    // lightDir.y: vertical offset (negative = light from below — uplight)
    // lightDir.z: depth (positive = in front of plane, negative = behind for rim)
    pointLight.position.set(lightDir.x, lightDir.y, lightDir.z);
    pointLight.intensity = lightIntensity;
    ambientLight.intensity = ambientIntensity;

    // Size the renderer to match the slot
    const w = Math.max(1, Math.round(width));
    const h = Math.max(1, Math.round(height));
    renderer.setSize(w, h, false);

    renderer.render(scene, camera);
  }, [lightDir.x, lightDir.y, lightDir.z, lightIntensity, ambientIntensity, width, height]);

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
