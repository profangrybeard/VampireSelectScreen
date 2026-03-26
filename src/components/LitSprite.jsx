/**
 * LitSprite — Three.js lit character sprite with normal map support.
 *
 * NORMAL-FIRST WORKFLOW:
 * The diffuse texture is used ONLY for its alpha channel (figure shape).
 * The base color is a near-black flat tone. All visible surface detail
 * comes from the normal map catching the point light. This isolates
 * the lighting contribution so we can tune normals before adding albedo.
 *
 * Tunable props:
 *   normalScale — exaggerates normal map detail (1.0 = default, 2.0+ = dramatic)
 *   roughness   — lower = more specular catch on normal ridges (0.3 = wet WoD look)
 *   baseColor   — flat body color (default near-black, override for testing)
 *
 * Texture pipeline per clan:
 *   diffuse:  src/silhouettes/art/{clanId}.png        (alpha source)
 *   normal:   src/silhouettes/art/{clanId}-normal.png  (lighting detail)
 *
 * Pass 1: Grey light only. Clan color plugs into the point light at Pass 2.
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

    // Plane geometry — 1 wide x 2 tall, matching the 1:2 card aspect.
    const geometry = new THREE.PlaneGeometry(1, 2);

    // Material — dark base color multiplied with the diffuse texture.
    // The diffuse texture's ALPHA CHANNEL drives opacity (figure=opaque,
    // background=transparent). The color darkens the diffuse so the
    // normal map does the visual heavy lifting.
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

    // Point light — driven by parent. Warm grey for Pass 1.
    // Higher intensity to compensate for dark base color.
    const pointLight = new THREE.PointLight(0xc8bfb0, lightIntensity, 8, 1.0);
    scene.add(pointLight);

    // Ambient — barely there. The point light does the work.
    const ambientLight = new THREE.AmbientLight(0x888888, ambientIntensity);
    scene.add(ambientLight);

    // Render function
    const render = () => {
      const w = canvas.clientWidth || 200;
      const h = canvas.clientHeight || 400;
      renderer.setSize(w, h, false);
      renderer.render(scene, camera);
    };

    // Load textures
    const loader = new THREE.TextureLoader();

    // Diffuse — used as map. Its RGB is multiplied by material.color
    // (darkening it). Its ALPHA CHANNEL drives opacity — figure pixels
    // are opaque, background pixels are transparent. NOT alphaMap
    // (which reads greyscale and would make dark areas transparent).
    loader.load(diffuseUrl, (tex) => {
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.minFilter = THREE.LinearFilter;
      tex.magFilter = THREE.LinearFilter;
      material.map = tex;
      material.needsUpdate = true;
      render();
    });

    // Normal map — this is where all the visible detail comes from.
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

    // Initial render
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

  // Update tunable props and re-render
  useEffect(() => {
    const state = stateRef.current;
    if (!state) return;

    const { pointLight, ambientLight, material, render } = state;

    // Light position and intensity
    pointLight.position.set(lightDir.x, lightDir.y, lightDir.z);
    pointLight.intensity = lightIntensity;
    ambientLight.intensity = ambientIntensity;

    // Material tunables
    material.roughness = roughness;
    material.color.set(baseColor);
    if (material.normalMap) {
      material.normalScale.set(normalScale, normalScale);
    }

    render();
  }, [lightDir.x, lightDir.y, lightDir.z, lightIntensity, ambientIntensity, normalScale, roughness, baseColor]);

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
