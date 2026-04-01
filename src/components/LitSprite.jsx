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
  lineWeight = 0.5,
  lineSmooth = 0.15,
  holdProgress = 0,
  rimDarkness = 0.0,
  rimWidth = 0.5,
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
      premultipliedAlpha: true,
      antialias: false,  // kills the halo — AA bleeds edge pixels
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
    // --- LINE WEIGHT UNIFORMS ---
    // Shared uniforms for the ink normalization shader.
    // lineWeight: threshold center (0 = only darkest ink, 1 = everything becomes ink)
    // lineSmooth: transition width (smaller = harder edge, larger = softer falloff)
    const inkUniforms = {
      uLineWeight: { value: lineWeight },
      uLineSmooth: { value: lineSmooth },
    };

    const material = new THREE.MeshStandardMaterial({
      color: new THREE.Color(baseColor),
      transparent: false,   // no blending — alphaTest handles cutout
      alphaTest: 0.65,      // sharp cutoff — kills soft edge fringe
      side: THREE.FrontSide,
      roughness: roughness,
      metalness: 0.0,
      emissive: new THREE.Color(0x020202),
      emissiveIntensity: 1.0,
    });

    // --- INK NORMALIZATION + TINT SHADER ---
    // Injects into MeshStandardMaterial's fragment shader.
    // Pre-lighting: normalizes ink line weight across sketches.
    // Post-lighting: applies tint color via soft-light blend so
    // the hue rides on top of normal-map lighting detail instead
    // of crushing it. The blend function preserves darks and lights
    // while shifting the midtones toward the tint color.
    const tintUniforms = {
      uTintColor: { value: new THREE.Color(0x000000) },
      uTintOpacity: { value: 0.0 },
    };
    const rimUniforms = {
      uRimDarkness: { value: rimDarkness },
      uRimWidth: { value: rimWidth },
    };

    material.onBeforeCompile = (shader) => {
      shader.uniforms.uLineWeight = inkUniforms.uLineWeight;
      shader.uniforms.uLineSmooth = inkUniforms.uLineSmooth;
      shader.uniforms.uTintColor = tintUniforms.uTintColor;
      shader.uniforms.uTintOpacity = tintUniforms.uTintOpacity;
      shader.uniforms.uRimDarkness = rimUniforms.uRimDarkness;
      shader.uniforms.uRimWidth = rimUniforms.uRimWidth;

      shader.fragmentShader = shader.fragmentShader.replace(
        '#include <common>',
        `#include <common>
uniform float uLineWeight;
uniform float uLineSmooth;
uniform vec3 uTintColor;
uniform float uTintOpacity;
uniform float uRimDarkness;
uniform float uRimWidth;

// Soft-light blend per channel (Photoshop formula).
// Preserves darks/lights, shifts midtones toward tint color.
vec3 blendSoftLight(vec3 base, vec3 blend) {
  return mix(
    2.0 * base * blend + base * base * (1.0 - 2.0 * blend),
    sqrt(base) * (2.0 * blend - 1.0) + 2.0 * base * (1.0 - blend),
    step(0.5, blend)
  );
}`
      );

      // After the map fragment samples diffuseColor, normalize ink lines.
      shader.fragmentShader = shader.fragmentShader.replace(
        '#include <map_fragment>',
        `#include <map_fragment>
// --- ink normalization ---
float lum = dot(diffuseColor.rgb, vec3(0.299, 0.587, 0.114));
float ink = 1.0 - smoothstep(uLineWeight - uLineSmooth, uLineWeight + uLineSmooth, lum);
diffuseColor.rgb = vec3(ink * 0.12);`
      );

      // After all lighting is computed, apply rim darkening + tint.
      // gl_FragColor.rgb already has the fully lit result at this point.
      shader.fragmentShader = shader.fragmentShader.replace(
        '#include <dithering_fragment>',
        `#include <dithering_fragment>
// --- dark inner rim (cel-shader edge) ---
// Uses the normal map Z component: at form edges, normals face
// sideways (low Z). We darken those pixels to create a dark
// inner outline that pairs with the existing outer glow.
// Guarded by alpha to avoid artifacts on edge pixels where
// normal data may be unreliable.
#ifdef USE_NORMALMAP
  vec3 rimNormal = texture2D(normalMap, vNormalMapUv).xyz * 2.0 - 1.0;
  float facing = clamp(rimNormal.z, 0.0, 1.0);
  float rimFactor = 1.0 - pow(facing, mix(0.3, 3.0, uRimWidth));
  // Fade rim out near alpha edges to prevent halo artifacts
  float edgeMask = smoothstep(0.65, 0.85, gl_FragColor.a);
  gl_FragColor.rgb *= mix(1.0, 1.0 - rimFactor, uRimDarkness * edgeMask);
#endif

// --- tint via soft-light blend ---
vec3 tinted = blendSoftLight(gl_FragColor.rgb, uTintColor);
gl_FragColor.rgb = mix(gl_FragColor.rgb, tinted, uTintOpacity);`
      );
    };

    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    // Tint is now handled inside the character shader (soft-light blend).
    // No separate geometry needed — tint uniforms live on the material.

    // --- LIGHTS ---
    // Main point light — driven by candle/floor position
    const pointLight = new THREE.PointLight(0xc8bfb0, lightIntensity, 8, 1.0);
    scene.add(pointLight);

    // Low fill light — rescues lower body from vanishing into black.
    // Positioned below center, faint warm grey. Catches boots, legs,
    // lower dress details so silhouette stays intact to the floor.
    const lowFill = new THREE.PointLight(0x998888, 0.8, 6, 1.0);
    lowFill.position.set(0, -0.8, 1.0);
    scene.add(lowFill);

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
      pointLight, lowFill, ambientLight, spotLights,
      material, geometry, mesh,
      tintUniforms, inkUniforms, rimUniforms,
      render,
    };

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

    const { pointLight, lowFill, ambientLight, spotLights, material, tintUniforms, inkUniforms, rimUniforms, render } = state;

    // Point light
    pointLight.position.set(lightDir.x, lightDir.y, lightDir.z);
    pointLight.intensity = lightIntensity;
    ambientLight.intensity = ambientIntensity * (1 - holdProgress);

    // Low fill — only on active character, off for background. Dims during hold.
    lowFill.intensity = spotActive ? 0.8 * (1 - holdProgress) : 0;

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

    // Tint — soft-light blend in shader
    if (tint.color) tintUniforms.uTintColor.value.set(tint.color);
    tintUniforms.uTintOpacity.value = tint.opacity ?? 0;

    // Ink normalization uniforms
    inkUniforms.uLineWeight.value = lineWeight;
    inkUniforms.uLineSmooth.value = lineSmooth;

    // Dark inner rim
    rimUniforms.uRimDarkness.value = rimDarkness;
    rimUniforms.uRimWidth.value = rimWidth;

    // Skip render for background characters during rapid updates —
    // they're crushed to silhouettes and don't need 60fps.
    if (!spotActive) {
      const now = performance.now();
      if (now - (stateRef.current._lastBgRender || 0) < 200) return; // 5fps cap
      stateRef.current._lastBgRender = now;
    }
    render();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lightDir.x, lightDir.y, lightDir.z, lightIntensity, ambientIntensity, normalScale, roughness, baseColor, spotActive, JSON.stringify(spotPos), tint.color, tint.opacity, lineWeight, lineSmooth, rimDarkness, rimWidth, holdProgress]);

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
