// Detailed landmark models rendered inside the MapLibre map (custom 3D layer).
// Every model is built in metres from published dimensions (see README) and
// placed on its OpenStreetMap footprint. Materials use procedural albedo +
// normal maps, a baked contact-shadow pass and real shadows on the ground.
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/addons/loaders/DRACOLoader.js";

const TEX = 1.2; // metres covered by one texture tile
let seed = 11;
const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);

/* ---------------------------------------------------------------- textures */
function canvas2(size) {
  const c = document.createElement("canvas");
  c.width = c.height = size;
  return [c, c.getContext("2d", { willReadFrequently: true })];
}

function speckle(ctx, s, { count = 900, size = 3, alpha = 0.16, light = "255,250,235", dark = "20,14,8", blur = 1 } = {}) {
  ctx.save();
  ctx.filter = `blur(${blur}px)`;
  for (let i = 0; i < count; i++) {
    const r = size * (0.4 + rand());
    ctx.fillStyle = `rgba(${rand() > 0.5 ? light : dark},${rand() * alpha})`;
    ctx.fillRect(rand() * s, rand() * s, r, r);
  }
  ctx.restore();
}

function streaks(ctx, s, { count = 14, alpha = 0.22, color = "35,28,18" } = {}) {
  for (let i = 0; i < count; i++) {
    const x = rand() * s, w = 2 + rand() * 7, len = s * (0.25 + rand() * 0.75), y = rand() * s * 0.3;
    const g = ctx.createLinearGradient(0, y, 0, y + len);
    g.addColorStop(0, `rgba(${color},${alpha * rand()})`);
    g.addColorStop(1, `rgba(${color},0)`);
    ctx.fillStyle = g;
    ctx.fillRect(x, y, w, len);
  }
}

function normalFromHeight(hc, strength) {
  const s = hc.width;
  const src = hc.getContext("2d", { willReadFrequently: true }).getImageData(0, 0, s, s).data;
  const [nc, nctx] = canvas2(s);
  const out = nctx.createImageData(s, s);
  const h = (x, y) => src[(((y + s) % s) * s + ((x + s) % s)) * 4] / 255;
  for (let y = 0; y < s; y++) {
    for (let x = 0; x < s; x++) {
      const dx = (h(x + 1, y) - h(x - 1, y)) * strength;
      const dy = (h(x, y + 1) - h(x, y - 1)) * strength;
      const l = Math.hypot(dx, dy, 1);
      const i = (y * s + x) * 4;
      out.data[i] = (-dx / l * 0.5 + 0.5) * 255;
      out.data[i + 1] = (dy / l * 0.5 + 0.5) * 255;
      out.data[i + 2] = (1 / l * 0.5 + 0.5) * 255;
      out.data[i + 3] = 255;
    }
  }
  nctx.putImageData(out, 0, 0);
  return nc;
}

function texture(canvas, srgb) {
  const t = new THREE.CanvasTexture(canvas);
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(1 / TEX, 1 / TEX);
  t.anisotropy = 8;
  return t;
}

function pbr(draw, { size = 256, roughness = 0.85, metalness = 0, normal = 3, normalScale = 1, side } = {}) {
  const [ac, actx] = canvas2(size);
  const [hc, hctx] = canvas2(size);
  hctx.fillStyle = "#808080";
  hctx.fillRect(0, 0, size, size);
  draw(actx, hctx, size);
  return new THREE.MeshStandardMaterial({
    map: texture(ac, true),
    normalMap: texture(normalFromHeight(hc, normal), false),
    normalScale: new THREE.Vector2(normalScale, normalScale),
    roughness,
    metalness,
    vertexColors: true,
    ...(side !== undefined ? { side } : {}),
  });
}

const plain = (color, roughness = 0.8, metalness = 0, extra = {}) =>
  new THREE.MeshStandardMaterial({ color, roughness, metalness, vertexColors: true, ...extra });

function brickDraw(tint) {
  return (a, h, s) => {
    a.fillStyle = tint.mortar;
    a.fillRect(0, 0, s, s);
    h.fillStyle = "#3a3a3a";
    h.fillRect(0, 0, s, s);
    const rows = 18, cols = 5, bh = s / rows, bw = s / cols;
    for (let r = 0; r < rows; r++) {
      for (let c = -1; c <= cols; c++) {
        const x = c * bw + (r % 2) * bw / 2;
        const k = rand();
        a.fillStyle = `rgb(${tint.r + k * 34 | 0},${tint.g + k * 22 | 0},${tint.b + k * 16 | 0})`;
        a.fillRect(x + 1.5, r * bh + 1.5, bw - 3, bh - 2.5);
        h.fillStyle = `rgb(${190 + rand() * 50 | 0},0,0)`;
        h.fillRect(x + 1.5, r * bh + 1.5, bw - 3, bh - 2.5);
      }
    }
    speckle(a, s, { count: 700, alpha: 0.2 });
    streaks(a, s, { count: 10, alpha: 0.35 });
    speckle(h, s, { count: 500, alpha: 0.25, light: "255,255,255", dark: "0,0,0" });
  };
}

function plasterDraw(base, { damp = true } = {}) {
  return (a, h, s) => {
    a.fillStyle = base;
    a.fillRect(0, 0, s, s);
    speckle(a, s, { count: 1400, size: 6, alpha: 0.09, blur: 3 });
    streaks(a, s, { count: 18, alpha: 0.28 });
    if (damp) {
      const g = a.createLinearGradient(0, s * 0.7, 0, s);
      g.addColorStop(0, "rgba(60,58,40,0)");
      g.addColorStop(1, "rgba(60,58,40,0.18)");
      a.fillStyle = g;
      a.fillRect(0, 0, s, s);
    }
    speckle(h, s, { count: 2200, size: 3, alpha: 0.35, light: "255,255,255", dark: "0,0,0", blur: 1.2 });
  };
}

// Ngói mũi hài: overlapping flat tiles with a rounded lower edge.
function tileDraw(a, h, s) {
  a.fillStyle = "#3b1d16";
  a.fillRect(0, 0, s, s);
  h.fillStyle = "#202020";
  h.fillRect(0, 0, s, s);
  const cols = 7, rows = 9, tw = s / cols, rh = s / rows;
  for (let r = -1; r <= rows; r++) {
    for (let c = -1; c <= cols; c++) {
      const x = c * tw + (r % 2 ? tw / 2 : 0), y = r * rh;
      const path = new Path2D();
      path.moveTo(x + 1, y - rh * 0.6);
      path.lineTo(x + tw - 1, y - rh * 0.6);
      path.lineTo(x + tw - 1, y + rh * 0.55);
      path.quadraticCurveTo(x + tw - 1, y + rh * 1.05, x + tw / 2, y + rh * 1.05);
      path.quadraticCurveTo(x + 1, y + rh * 1.05, x + 1, y + rh * 0.55);
      path.closePath();
      const k = rand();
      const g = a.createLinearGradient(0, y - rh * 0.6, 0, y + rh * 1.05);
      g.addColorStop(0, `rgb(${92 + k * 20 | 0},${40 + k * 10 | 0},${28 + k * 8 | 0})`);
      g.addColorStop(0.8, `rgb(${150 + k * 35 | 0},${70 + k * 18 | 0},${46 + k * 12 | 0})`);
      g.addColorStop(1, `rgb(${120 + k * 25 | 0},${58 + k * 10 | 0},${38 | 0})`);
      a.fillStyle = g;
      a.fill(path);
      a.strokeStyle = "rgba(30,12,8,0.6)";
      a.lineWidth = 1.2;
      a.stroke(path);
      const hg = h.createLinearGradient(0, y - rh * 0.6, 0, y + rh * 1.05);
      hg.addColorStop(0, "#404040");
      hg.addColorStop(1, "#e8e8e8");
      h.fillStyle = hg;
      h.fill(path);
    }
  }
  // Moss and soot.
  speckle(a, s, { count: 260, size: 9, alpha: 0.22, light: "88,98,60", dark: "18,16,12", blur: 3 });
}

function graniteDraw(base) {
  return (a, h, s) => {
    a.fillStyle = base;
    a.fillRect(0, 0, s, s);
    speckle(a, s, { count: 9000, size: 1.6, alpha: 0.35, blur: 0 });
    speckle(a, s, { count: 400, size: 10, alpha: 0.06, blur: 4 });
    // Slab joints every 0.6 m.
    a.fillStyle = "rgba(30,30,28,0.45)";
    h.fillStyle = "#101010";
    for (const v of [0, s / 2]) {
      a.fillRect(0, v, s, 1.5);
      h.fillRect(0, v, s, 1.5);
      a.fillRect(v, 0, 1.5, s);
      h.fillRect(v, 0, 1.5, s);
    }
    speckle(h, s, { count: 3000, size: 1.5, alpha: 0.3, light: "255,255,255", dark: "0,0,0", blur: 0 });
  };
}

function woodDraw(base, dark) {
  return (a, h, s) => {
    a.fillStyle = base;
    a.fillRect(0, 0, s, s);
    for (let i = 0; i < 70; i++) {
      const y = rand() * s;
      a.fillStyle = `rgba(${dark},${0.08 + rand() * 0.22})`;
      a.fillRect(0, y, s, 0.6 + rand() * 1.8);
      h.fillStyle = `rgba(0,0,0,${0.2 + rand() * 0.3})`;
      h.fillRect(0, y, s, 1);
    }
    // Board seams.
    for (let k = 0; k < 6; k++) {
      a.fillStyle = "rgba(10,6,3,0.55)";
      a.fillRect(0, k * s / 6, s, 1.6);
      h.fillStyle = "#000";
      h.fillRect(0, k * s / 6, s, 1.6);
    }
  };
}

function lacquerDraw(a, h, s) {
  a.fillStyle = "#86281f";
  a.fillRect(0, 0, s, s);
  speckle(a, s, { count: 900, size: 7, alpha: 0.12, light: "190,90,60", dark: "40,8,6", blur: 3 });
  streaks(a, s, { count: 8, alpha: 0.2, color: "30,6,4" });
  speckle(h, s, { count: 600, size: 2, alpha: 0.15, light: "255,255,255", dark: "0,0,0" });
}

function pavingDraw(a, h, s) {
  const n = 4, w = s / n;
  a.fillStyle = "#4a3a2c";
  a.fillRect(0, 0, s, s);
  h.fillStyle = "#202020";
  h.fillRect(0, 0, s, s);
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      const k = rand();
      a.fillStyle = `rgb(${150 + k * 30 | 0},${88 + k * 20 | 0},${62 + k * 14 | 0})`;
      a.fillRect(i * w + 1.5, j * w + 1.5, w - 3, w - 3);
      h.fillStyle = `rgb(${200 + rand() * 40 | 0},0,0)`;
      h.fillRect(i * w + 1.5, j * w + 1.5, w - 3, w - 3);
    }
  }
  speckle(a, s, { count: 600, size: 5, alpha: 0.18, blur: 2 });
}

function leafCardMaterial() {
  const [c, ctx] = canvas2(256);
  for (let i = 0; i < 260; i++) {
    const x = 128 + (rand() - 0.5) * 220, y = 128 + (rand() - 0.5) * 220;
    if (Math.hypot(x - 128, y - 128) > 118) continue;
    const g = 70 + rand() * 70;
    ctx.fillStyle = `rgb(${30 + rand() * 30 | 0},${g | 0},${28 + rand() * 25 | 0})`;
    ctx.beginPath();
    ctx.ellipse(x, y, 5 + rand() * 6, 2.5 + rand() * 3, rand() * Math.PI, 0, Math.PI * 2);
    ctx.fill();
  }
  const map = new THREE.CanvasTexture(c);
  map.colorSpace = THREE.SRGBColorSpace;
  return new THREE.MeshStandardMaterial({ map, alphaTest: 0.5, side: THREE.DoubleSide, roughness: 0.9 });
}

/* Weathering layer injected into the standard PBR shader: moss on surfaces
   that face the sky, rain streaks on walls, rising damp near the ground.
   Works in model space (metres), so every model weathers consistently. */
const NOISE_GLSL = `
varying vec3 vWPos;
varying vec3 vWNormal;
uniform float uMoss;
uniform float uGrime;
float w_hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float w_noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(w_hash(i), w_hash(i + vec2(1.0, 0.0)), f.x), mix(w_hash(i + vec2(0.0, 1.0)), w_hash(i + vec2(1.0, 1.0)), f.x), f.y);
}
float w_fbm(vec2 p) { float v = 0.0, a = 0.5; for (int i = 0; i < 4; i++) { v += a * w_noise(p); p *= 2.03; a *= 0.5; } return v; }
`;

function weather(material, { moss = 0, grime = 0.6 } = {}) {
  material.onBeforeCompile = (shader) => {
    shader.uniforms.uMoss = { value: moss };
    shader.uniforms.uGrime = { value: grime };
    shader.vertexShader = shader.vertexShader
      .replace("#include <common>", "#include <common>\nvarying vec3 vWPos;\nvarying vec3 vWNormal;")
      .replace("#include <fog_vertex>", "#include <fog_vertex>\nvWPos = (modelMatrix * vec4(transformed, 1.0)).xyz;\nvWNormal = normalize(mat3(modelMatrix) * objectNormal);");
    shader.fragmentShader = shader.fragmentShader
      .replace("#include <common>", `#include <common>\n${NOISE_GLSL}`)
      .replace("#include <map_fragment>", `#include <map_fragment>
  float w_up = clamp(normalize(vWNormal).y, 0.0, 1.0);
  float w_n = w_fbm(vWPos.xz * 1.3 + vWPos.y * 0.7);
  float w_moss = uMoss * smoothstep(0.45, 0.95, w_up) * smoothstep(0.42, 0.7, w_n);
  diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.29, 0.35, 0.19) * (0.75 + 0.5 * w_n), w_moss);
  float w_streak = w_fbm(vec2((vWPos.x + vWPos.z) * 2.6, vWPos.y * 0.3));
  float w_grime = uGrime * (1.0 - w_up) * smoothstep(0.52, 0.85, w_streak) * 0.32;
  float w_damp = uGrime * (1.0 - smoothstep(0.0, 1.3, vWPos.y)) * 0.3;
  diffuseColor.rgb *= 1.0 - w_grime - w_damp;`)
      .replace("#include <roughnessmap_fragment>", "#include <roughnessmap_fragment>\n  roughnessFactor = mix(roughnessFactor, 0.97, w_moss);");
  };
  material.customProgramCacheKey = () => `weather-${moss}-${grime}`;
  return material;
}

let M = null;
function materials() {
  if (M) return M;
  seed = 11;
  const physical = (base, extra) => {
    const m = new THREE.MeshPhysicalMaterial({ map: base.map, normalMap: base.normalMap, normalScale: base.normalScale, roughness: base.roughness, metalness: base.metalness, vertexColors: true, ...extra });
    base.dispose();
    return m;
  };
  M = {
    brick: weather(pbr(brickDraw({ mortar: "#9d917a", r: 118, g: 70, b: 50 }), { normal: 4 }), { moss: 0.5, grime: 0.8 }),
    brickOld: weather(pbr(brickDraw({ mortar: "#8b8577", r: 104, g: 84, b: 70 }), { normal: 4.5 }), { moss: 0.7, grime: 1 }),
    clay: weather(pbr(plasterDraw("#7d4630"), { roughness: 0.95, normal: 3 }), { moss: 0.3, grime: 1 }),
    plaster: weather(pbr(plasterDraw("#d8caa6")), { moss: 0.35, grime: 0.8 }),
    plasterWhite: weather(pbr(plasterDraw("#e6dfcf", { damp: false }), { roughness: 0.8 }), { moss: 0.25, grime: 0.6 }),
    plasterOld: weather(pbr(plasterDraw("#b9ab89"), { normal: 3.5 }), { moss: 0.5, grime: 1 }),
    ochre: weather(pbr(plasterDraw("#d4a756")), { moss: 0.3, grime: 0.8 }),
    tile: weather(pbr(tileDraw, { roughness: 0.78, normal: 5, normalScale: 1.4 }), { moss: 0.45, grime: 0.2 }),
    tileUnder: plain(0x2a1d16, 0.9),
    granite: weather(physical(pbr(graniteDraw("#8d8b84"), { roughness: 0.5, normal: 1.5 }), { clearcoat: 0.25, clearcoatRoughness: 0.35 }), { grime: 0.35 }),
    graniteLight: weather(physical(pbr(graniteDraw("#aeaaa0"), { roughness: 0.45, normal: 1.5 }), { clearcoat: 0.25, clearcoatRoughness: 0.35 }), { grime: 0.35 }),
    graniteDark: weather(physical(pbr(graniteDraw("#55534e"), { roughness: 0.4, normal: 1.5 }), { clearcoat: 0.35, clearcoatRoughness: 0.25 }), { grime: 0.2 }),
    wood: weather(pbr(woodDraw("#6a3f26", "30,15,6"), { roughness: 0.75 }), { grime: 0.5 }),
    woodDark: weather(pbr(woodDraw("#3d2416", "10,5,2"), { roughness: 0.8 }), { grime: 0.5 }),
    shutter: weather(pbr(woodDraw("#3e5a49", "15,25,18"), { roughness: 0.7 }), { grime: 0.5 }),
    lacquer: weather(physical(pbr(lacquerDraw, { roughness: 0.42, normal: 1.5 }), { clearcoat: 0.8, clearcoatRoughness: 0.18, sheen: 0.2 }), { grime: 0.35 }),
    paving: weather(pbr(pavingDraw, { roughness: 0.9, normal: 3 }), { moss: 0.6, grime: 0.4 }),
    gold: new THREE.MeshPhysicalMaterial({ color: 0xc9a050, roughness: 0.28, metalness: 1, clearcoat: 0.3, vertexColors: true }),
    ink: plain(0x14120f, 0.9),
    glass: new THREE.MeshPhysicalMaterial({ color: 0x1d2a2c, roughness: 0.05, metalness: 0.1, clearcoat: 1, vertexColors: true }),
    grass: weather(plain(0x5d7041, 0.95), { moss: 0.6, grime: 0 }),
    earth: weather(plain(0x6a5a40, 0.95), { moss: 0.3, grime: 0.3 }),
    leaf: leafCardMaterial(),
    lamp: new THREE.MeshStandardMaterial({ color: 0xffe2a0, emissive: 0xffbe5c, emissiveIntensity: 2 }),
  };
  return M;
}

/* ---------------------------------------------------------------- sky env */
// Outdoor environment for reflections: gradient sky with a warm sun disc,
// prefiltered with PMREM so lacquer, granite, bronze and glass reflect it.
const SUN_DIR = new THREE.Vector3(-0.55, 0.62, 0.56).normalize();
function makeEnvironment(renderer) {
  const scene = new THREE.Scene();
  const sky = new THREE.Mesh(
    new THREE.SphereGeometry(50, 48, 24),
    new THREE.ShaderMaterial({
      side: THREE.BackSide,
      uniforms: { uSun: { value: SUN_DIR } },
      vertexShader: "varying vec3 vDir; void main(){ vDir = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }",
      fragmentShader: `uniform vec3 uSun; varying vec3 vDir;
        void main(){
          float h = vDir.y;
          vec3 zenith = vec3(0.42, 0.62, 0.85), horizon = vec3(0.95, 0.90, 0.80), ground = vec3(0.36, 0.33, 0.28);
          vec3 c = h > 0.0 ? mix(horizon, zenith, pow(h, 0.55)) : mix(horizon, ground, pow(-h, 0.4));
          float s = max(dot(vDir, uSun), 0.0);
          c += vec3(1.0, 0.86, 0.6) * (pow(s, 600.0) * 30.0 + pow(s, 8.0) * 0.35);
          gl_FragColor = vec4(c, 1.0);
        }`,
    }),
  );
  scene.add(sky);
  const pmrem = new THREE.PMREMGenerator(renderer);
  const env = pmrem.fromScene(scene, 0).texture;
  pmrem.dispose();
  return env;
}

/* ---------------------------------------------------------------- water */
// Animated lake surface: layered directional waves + fbm detail give the
// normal; fresnel blends jade-green depth with the analytic sky reflection,
// and the sun produces moving glints. Ripples spread from the island.
function waterMaterial() {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    uniforms: {
      uTime: { value: 0 },
      uEye: { value: new THREE.Vector3(0, 100, 100) },
      uSun: { value: SUN_DIR },
      uDeep: { value: new THREE.Color(0x2f4a36) },
      uShallow: { value: new THREE.Color(0x5f7d55) },
    },
    vertexShader: `varying vec3 vPos; void main(){ vPos = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: `
      uniform float uTime; uniform vec3 uEye; uniform vec3 uSun; uniform vec3 uDeep; uniform vec3 uShallow;
      varying vec3 vPos;
      float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
      float noise(vec2 p){ vec2 i = floor(p), f = fract(p); f = f*f*(3.0-2.0*f);
        return mix(mix(hash(i), hash(i+vec2(1,0)), f.x), mix(hash(i+vec2(0,1)), hash(i+vec2(1,1)), f.x), f.y); }
      float height(vec2 p){
        float h = 0.0;
        h += sin(dot(p, vec2(0.12, 0.05)) + uTime * 0.9) * 0.05;
        h += sin(dot(p, vec2(-0.07, 0.15)) + uTime * 1.3) * 0.035;
        h += sin(dot(p, vec2(0.31, -0.22)) + uTime * 2.1) * 0.018;
        h += (noise(p * 0.9 + uTime * vec2(0.25, 0.1)) - 0.5) * 0.04;
        h += (noise(p * 2.7 - uTime * vec2(0.1, 0.35)) - 0.5) * 0.015;
        float d = length(p);
        h += sin(d * 1.6 - uTime * 2.4) * 0.025 * exp(-d * 0.06) * smoothstep(5.0, 9.0, d);
        return h;
      }
      vec3 sky(vec3 r){
        float h = max(r.y, 0.0);
        vec3 c = mix(vec3(0.93, 0.90, 0.82), vec3(0.45, 0.64, 0.86), pow(h, 0.5));
        return c;
      }
      void main(){
        vec2 p = vPos.xz;
        float e = 0.15;
        float hx = height(p + vec2(e, 0.0)) - height(p - vec2(e, 0.0));
        float hz = height(p + vec2(0.0, e)) - height(p - vec2(0.0, e));
        vec3 n = normalize(vec3(-hx / (2.0 * e) * 6.0, 1.0, -hz / (2.0 * e) * 6.0));
        vec3 v = normalize(uEye - vPos);
        float fres = 0.03 + 0.97 * pow(1.0 - max(dot(n, v), 0.0), 5.0);
        vec3 r = reflect(-v, n);
        vec3 body = mix(uDeep, uShallow, 0.35 + 0.35 * noise(p * 0.05));
        vec3 col = mix(body, sky(r), fres * 0.85);
        float spec = pow(max(dot(r, uSun), 0.0), 220.0);
        col += vec3(1.0, 0.9, 0.7) * spec * 2.2;
        col += vec3(1.0) * smoothstep(0.985, 1.0, max(dot(r, uSun), 0.0)) * step(0.82, noise(p * 3.0 + uTime)) * 1.5;
        gl_FragColor = vec4(col, 0.94);
      }`,
  });
}

/* ---------------------------------------------------------------- particles */
// GPU particles: every particle's life is derived from a per-particle seed and
// the time uniform in the vertex shader, so nothing is simulated on the CPU.
function particles({ count, origin, spread, velocity, life, size, color, opacity = 1, additive = false, gravity = 0, turbulence = 0, shape = 0 }) {
  const geometry = new THREE.BufferGeometry();
  const seeds = new Float32Array(count * 4);
  for (let i = 0; i < seeds.length; i++) seeds[i] = rand();
  geometry.setAttribute("position", new THREE.BufferAttribute(new Float32Array(count * 3), 3));
  geometry.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 4));
  const material = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: additive ? THREE.AdditiveBlending : THREE.NormalBlending,
    uniforms: {
      uTime: { value: 0 }, uLife: { value: life }, uGravity: { value: gravity }, uTurb: { value: turbulence },
      uOrigin: { value: new THREE.Vector3(...origin) }, uSpread: { value: new THREE.Vector3(...spread) }, uVel: { value: new THREE.Vector3(...velocity) },
      uSize: { value: new THREE.Vector2(...size) }, uColor: { value: new THREE.Color(color) }, uOpacity: { value: opacity },
      uPxPerM: { value: 10 }, uCenterW: { value: 1 }, uShape: { value: shape },
    },
    vertexShader: `
      attribute vec4 aSeed;
      uniform float uTime, uLife, uGravity, uTurb, uPxPerM, uCenterW;
      uniform vec3 uOrigin, uSpread, uVel; uniform vec2 uSize;
      varying float vAlpha; varying float vRot; varying float vSeed;
      void main(){
        float t = fract(uTime / uLife + aSeed.x);
        float age = t * uLife;
        vec3 p = uOrigin + (aSeed.yzw - 0.5) * uSpread + uVel * age;
        p.y -= 0.5 * uGravity * age * age;
        p.x += sin(uTime * 0.7 + aSeed.y * 23.0) * uTurb * t;
        p.z += cos(uTime * 0.6 + aSeed.z * 19.0) * uTurb * t;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
        float size = mix(uSize.x, uSize.y, t);
        gl_PointSize = clamp(size * uPxPerM * uCenterW / gl_Position.w, 1.0, 220.0);
        vAlpha = smoothstep(0.0, 0.12, t) * (1.0 - smoothstep(0.65, 1.0, t));
        vRot = aSeed.w * 6.2832 + uTime * (aSeed.y - 0.5) * 3.0;
        vSeed = aSeed.w;
      }`,
    fragmentShader: `
      uniform vec3 uColor; uniform float uOpacity; uniform float uShape;
      varying float vAlpha; varying float vRot; varying float vSeed;
      void main(){
        vec2 uv = gl_PointCoord - 0.5;
        float a;
        vec3 c = uColor;
        if (uShape > 1.5) {
          float cs = cos(vRot), sn = sin(vRot);
          vec2 q = vec2(cs * uv.x - sn * uv.y, sn * uv.x + cs * uv.y);
          a = 1.0 - smoothstep(0.18, 0.22, length(vec2(q.x * 2.3, q.y)));
          c = mix(vec3(0.85, 0.62, 0.18), vec3(0.72, 0.28, 0.12), vSeed) * (0.8 + 0.4 * (q.y + 0.5));
        } else if (uShape > 0.5) {
          float d = length(uv);
          a = pow(1.0 - smoothstep(0.0, 0.5, d), 3.0) + (1.0 - smoothstep(0.0, 0.06, abs(uv.x) * abs(uv.y) * 12.0)) * (1.0 - smoothstep(0.1, 0.5, d)) * 0.6;
        } else {
          a = 1.0 - smoothstep(0.1, 0.5, length(uv));
          a *= 0.7 + 0.3 * sin(vSeed * 40.0 + uv.x * 9.0);
        }
        gl_FragColor = vec4(c, a * vAlpha * uOpacity);
      }`,
  });
  const points = new THREE.Points(geometry, material);
  points.frustumCulled = false;
  points.renderOrder = 5;
  points.userData.particles = true;
  return points;
}

// Per-landmark atmosphere. Coordinates are model-local metres.
const EFFECTS = {
  "bat-trang-kiln": () => [
    particles({ count: 180, origin: [7.1, 8.4, 0], spread: [0.8, 0.2, 0.8], velocity: [0.55, 1.3, 0.15], life: 8, size: [0.9, 5.5], color: 0xb4aea3, opacity: 0.32, turbulence: 1.6 }),
    particles({ count: 80, origin: [-8.3, 0.5, 0], spread: [0.3, 0.3, 0.7], velocity: [-0.25, 1.9, 0], life: 2.4, size: [0.14, 0.05], color: 0xff9a3c, opacity: 1, additive: true, gravity: 0.25, turbulence: 0.7, shape: 1 }),
  ],
  "ma-may": () => [
    particles({ count: 60, origin: [0.6, 0.8, 6.5], spread: [0.1, 0.05, 0.1], velocity: [0.05, 0.45, 0], life: 7, size: [0.12, 1.3], color: 0xd8d2c6, opacity: 0.28, turbulence: 0.45 }),
  ],
  "hoang-thanh": () => [
    particles({ count: 170, origin: [0, 4, 3], spread: [36, 9, 18], velocity: [0.12, 0.04, 0.02], life: 11, size: [0.09, 0.09], color: 0xffe2a8, opacity: 0.55, additive: true, turbulence: 0.9, shape: 1 }),
  ],
  "van-mieu": () => [
    particles({ count: 110, origin: [0, 8, -4.6], spread: [15, 3, 7], velocity: [0.45, -0.85, 0.25], life: 10, size: [0.28, 0.28], color: 0xd29a3a, opacity: 1, turbulence: 1.3, shape: 2 }),
  ],
  "ho-guom": () => [
    particles({ count: 320, origin: [0, 0.18, 0], spread: [90, 0, 70], velocity: [0, 0, 0], life: 1.7, size: [0.4, 0.4], color: 0xfff5d8, opacity: 0.9, additive: true, shape: 1 }),
    particles({ count: 90, origin: [0, 0.8, 0], spread: [90, 1.2, 70], velocity: [0.35, 0.04, 0.1], life: 14, size: [7, 13], color: 0xf4f1ea, opacity: 0.1, turbulence: 2 }),
  ],
};

/* ---------------------------------------------------------------- helpers */
function scaleBoxUV(geometry, w, h, d) {
  const uv = geometry.attributes.uv;
  const dims = [[d, h], [d, h], [w, d], [w, d], [w, h], [w, h]];
  for (let f = 0; f < 6; f++) {
    for (let k = 0; k < 4; k++) {
      const i = f * 4 + k;
      uv.setXY(i, uv.getX(i) * dims[f][0], uv.getY(i) * dims[f][1]);
    }
  }
}

function add(parent, geometry, material, x = 0, y = 0, z = 0) {
  const m = new THREE.Mesh(geometry, material);
  m.position.set(x, y, z);
  m.castShadow = true;
  m.receiveShadow = true;
  parent.add(m);
  return m;
}

function box(parent, w, h, d, material, x = 0, y = 0, z = 0) {
  const g = new THREE.BoxGeometry(w, h, d);
  scaleBoxUV(g, w, h, d);
  return add(parent, g, material, x, y + h / 2, z);
}

function cyl(parent, rt, rb, h, material, x = 0, y = 0, z = 0, seg = 16) {
  return add(parent, new THREE.CylinderGeometry(rt, rb, h, seg), material, x, y + h / 2, z);
}

// Moulded cornice: stacked bands that step outwards (sharp, not rounded).
function cornice(parent, w, d, material, y, depth = 0.18, x = 0, z = 0) {
  box(parent, w, 0.08, d, material, x, y, z);
  box(parent, w + depth, 0.1, d + depth, material, x, y + 0.08, z);
  box(parent, w + depth * 2, 0.07, d + depth * 2, material, x, y + 0.18, z);
}

function tree(parent, x, z, height = 7, spread = 2.4, y = 0) {
  const mats = materials();
  const g = new THREE.Group();
  g.position.set(x, y, z);
  parent.add(g);
  cyl(g, 0.12, 0.22, height * 0.6, mats.woodDark, 0, 0, 0, 7);
  for (let i = 0; i < 3; i++) {
    const b = cyl(g, 0.04, 0.09, height * 0.35, mats.woodDark, 0, height * 0.45, 0, 5);
    b.rotation.set((rand() - 0.5) * 1.2, rand() * 6, (rand() - 0.5) * 1.2);
  }
  const count = 46;
  const leaves = new THREE.InstancedMesh(new THREE.PlaneGeometry(1.5, 1.5), mats.leaf, count);
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), p = new THREE.Vector3(), s3 = new THREE.Vector3();
  for (let i = 0; i < count; i++) {
    const a = rand() * Math.PI * 2, r = Math.sqrt(rand()) * spread, hh = height * (0.55 + rand() * 0.45);
    p.set(Math.cos(a) * r, hh, Math.sin(a) * r * 0.9);
    q.setFromEuler(e.set(rand() * Math.PI, rand() * Math.PI, rand() * Math.PI));
    const k = 0.8 + rand() * 0.7;
    m4.compose(p, q, s3.set(k, k, k));
    leaves.setMatrixAt(i, m4);
  }
  leaves.castShadow = true;
  leaves.receiveShadow = true;
  g.add(leaves);
  return g;
}

function roofSurface(px, pz, W, D, h, sag, gable) {
  const ridgeHalf = gable ? W : Math.max(0, W - D);
  const tz = 1 - Math.abs(pz) / D;
  const tx = Math.abs(px) <= ridgeHalf ? 1 : 1 - (Math.abs(px) - ridgeHalf) / D;
  const t = THREE.MathUtils.clamp(Math.min(tz, tx), 0, 1);
  return { t, y: h * Math.pow(t, 1 + sag) };
}

const cornerLift = (px, pz, W, D, curl) =>
  curl ? curl * Math.pow(Math.abs(px) / W, 6) * Math.pow(Math.abs(pz) / D, 6) : 0;

/** Tiled roof, ridge along local x, with tile courses modelled as ridges in the mesh. */
function roof(parent, { w, d, h, x = 0, y = 0, z = 0, curl = 0, sag = 0.3, truncate = 1, gable = false, rotY = 0, ridge = true, finial = false }) {
  const mats = materials();
  const W = w / 2, D = d / 2;
  const group = new THREE.Group();
  group.position.set(x, y, z);
  group.rotation.y = rotY;
  parent.add(group);
  const segX = Math.min(160, Math.max(24, Math.round(w / 0.1)));
  const segZ = Math.min(96, Math.max(18, Math.round(d / 0.2)));
  const geometry = new THREE.PlaneGeometry(w, d, segX, segZ);
  geometry.rotateX(-Math.PI / 2);
  const pos = geometry.attributes.position;
  const uv = geometry.attributes.uv;
  const capY = h * Math.pow(truncate, 1 + sag);
  for (let i = 0; i < pos.count; i++) {
    const px = pos.getX(i), pz = pos.getZ(i);
    const s = roofSurface(px, pz, W, D, h, sag, gable);
    const course = s.t < 0.995 ? 0.03 * Math.abs(Math.sin((px * Math.PI) / 0.2)) : 0;
    pos.setY(i, (s.t > truncate ? capY : s.y) + cornerLift(px, pz, W, D, curl) + course);
    uv.setXY(i, px, pz);
  }
  geometry.computeVertexNormals();
  add(group, geometry, mats.tile);
  const under = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({ color: 0x2c1f17, roughness: 0.9, side: THREE.BackSide }));
  under.position.y = -0.07;
  under.userData.owned = true;
  group.add(under);

  const rt = Math.max(0.1, Math.min(0.3, h * 0.08));
  const surfaceAt = (px, pz) => {
    const s = roofSurface(px, pz, W, D, h, sag, gable);
    return (s.t > truncate ? capY : s.y) + cornerLift(px, pz, W, D, curl);
  };
  if (ridge && truncate >= 1) {
    const ridgeHalf = gable ? W : Math.max(0, W - D);
    if (ridgeHalf > 0.05) {
      box(group, ridgeHalf * 2 + rt, rt * 1.3, rt * 1.5, mats.tileUnder, 0, h - rt * 0.25, 0);
      box(group, ridgeHalf * 2 + rt * 0.6, rt * 0.35, rt * 0.9, mats.plasterOld, 0, h + rt * 1.05, 0);
      for (const side of [-1, 1]) {
        // Upswept ridge-end (đầu kìm) built from stepped blocks.
        for (let k = 0; k < 4; k++) {
          box(group, rt * 0.9, rt * 0.6, rt * 1.1, mats.tileUnder, side * (ridgeHalf + rt * 0.35 * k), h + rt * 0.3 * k, 0);
        }
      }
    }
  }
  if (!gable) {
    const ridgeHalf = Math.max(0, W - D);
    const start = truncate >= 1 ? 0 : 1 - truncate;
    for (const sx of [-1, 1]) {
      for (const sz of [-1, 1]) {
        const steps = 12;
        for (let k = 0; k < steps; k++) {
          const s0 = start + (0.995 - start) * (k / steps), s1 = start + (0.995 - start) * ((k + 1) / steps);
          const p0 = [sx * (ridgeHalf + s0 * (W - ridgeHalf)), sz * s0 * D];
          const p1 = [sx * (ridgeHalf + s1 * (W - ridgeHalf)), sz * s1 * D];
          const y0 = surfaceAt(...p0) + rt * 0.3, y1 = surfaceAt(...p1) + rt * 0.3;
          const len = Math.hypot(p1[0] - p0[0], y1 - y0, p1[1] - p0[1]);
          const seg = add(group, new THREE.BoxGeometry(rt * 0.85, rt * 0.8, len + 0.02), mats.tileUnder, (p0[0] + p1[0]) / 2, (y0 + y1) / 2, (p0[1] + p1[1]) / 2);
          seg.quaternion.setFromRotationMatrix(new THREE.Matrix4().lookAt(new THREE.Vector3(p0[0], y0, p0[1]), new THREE.Vector3(p1[0], y1, p1[1]), new THREE.Vector3(0, 1, 0)));
        }
        if (curl) {
          // Dragon-tail corner (đao) as a short upturned blade.
          const tip = [sx * W * 0.99, sz * D * 0.99];
          const ty = surfaceAt(...tip);
          const blade = box(group, rt * 0.5, rt * 3.2, rt * 0.5, mats.tileUnder, tip[0], ty, tip[1]);
          blade.rotation.set(sz * 0.6, 0, -sx * 0.6);
        }
      }
    }
  }
  if (gable) {
    const shape = new THREE.Shape();
    shape.moveTo(-D, 0);
    for (let k = 0; k <= 20; k++) {
      const pz = -D + (2 * D * k) / 20;
      shape.lineTo(pz, roofSurface(0, pz, W, D, h, sag, true).y - 0.05);
    }
    shape.lineTo(D, 0);
    const end = new THREE.ShapeGeometry(shape);
    for (const side of [-1, 1]) {
      const m = add(group, end, mats.plasterOld, side * (W - 0.03), 0, 0);
      m.rotation.y = side * Math.PI / 2;
    }
  }
  if (finial) {
    cyl(group, 0.04 * h + 0.03, 0.1 * h + 0.05, 0.3 * h + 0.2, mats.gold, 0, h, 0, 8);
    add(group, new THREE.OctahedronGeometry(0.08 * h + 0.06), mats.gold, 0, h * 1.35 + 0.25, 0);
  }
  return group;
}

/** Wall slab with arched openings cut through its thickness, plus voussoir trims. */
function archedWall(parent, { w, h, depth, arches = [], material, x = 0, y = 0, z = 0, rotY = 0, trim }) {
  const shape = new THREE.Shape();
  shape.moveTo(-w / 2, 0);
  shape.lineTo(w / 2, 0);
  shape.lineTo(w / 2, h);
  shape.lineTo(-w / 2, h);
  shape.closePath();
  const g = new THREE.Group();
  g.position.set(x, y, z);
  g.rotation.y = rotY;
  parent.add(g);
  for (const a of arches) {
    const r = a.w / 2, spring = a.h - (a.round ? r : r * 1.25), sill = a.sill ?? 0.03;
    const hole = new THREE.Path();
    hole.moveTo(a.x - r, sill);
    hole.lineTo(a.x - r, spring);
    if (a.round) hole.absarc(a.x, spring, r, Math.PI, 0, true);
    else {
      hole.quadraticCurveTo(a.x - r, spring + r * 0.95, a.x, a.h);
      hole.quadraticCurveTo(a.x + r, spring + r * 0.95, a.x + r, spring);
    }
    hole.lineTo(a.x + r, sill);
    hole.closePath();
    shape.holes.push(hole);
    if (trim && a.round) {
      // Stone voussoir ring proud of the wall face.
      const ring = new THREE.Shape();
      ring.absarc(a.x, spring, r + 0.35, Math.PI, 0, true);
      ring.lineTo(a.x + r, spring);
      ring.absarc(a.x, spring, r, 0, Math.PI, false);
      ring.closePath();
      const rg = new THREE.ExtrudeGeometry(ring, { depth: 0.12, bevelEnabled: false, curveSegments: 18 });
      add(g, rg, trim, 0, 0, depth / 2);
    }
  }
  const geometry = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: false, curveSegments: 18 });
  geometry.translate(0, 0, -depth / 2);
  add(g, geometry, material);
  return g;
}

function evenArches(span, count, w, h, extra = {}) {
  const gap = span / count;
  return Array.from({ length: count }, (_, i) => ({ x: -span / 2 + gap * (i + 0.5), w, h, ...extra }));
}

function archedStorey(parent, { w, d, h, t = 0.35, long, short, archW, archH, y = 0, material }) {
  const g = new THREE.Group();
  g.position.y = y;
  parent.add(g);
  const la = evenArches(w - 2 * t, long, archW, archH, { sill: 0.3 });
  const sa = evenArches(d - 2 * t, short, archW, archH, { sill: 0.3 });
  for (const side of [-1, 1]) {
    archedWall(g, { w, h, depth: t, arches: la, material, z: side * (d / 2 - t / 2) });
    archedWall(g, { w: d - 2 * t, h, depth: t, arches: sa, material, x: side * (w / 2 - t / 2), rotY: Math.PI / 2 });
    // Pilasters at the corners.
    for (const s2 of [-1, 1]) box(g, 0.32, h, 0.32, materials().plasterWhite, s2 * (w / 2 + 0.02), 0, side * (d / 2 + 0.02));
  }
  box(g, w - 2 * t, 0.12, d - 2 * t, materials().ink, 0, 0.02, 0);
  return g;
}

function textPlane(text, w, h, { color = "#5e2328", bg = "#8a877f", font = "600 78px Georgia" } = {}) {
  const c = document.createElement("canvas");
  c.width = 1024;
  c.height = Math.round(1024 * h / w);
  const ctx = c.getContext("2d");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, c.width, c.height);
  ctx.fillStyle = color;
  ctx.font = font;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, c.width / 2, c.height / 2 + 4);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  const m = new THREE.MeshStandardMaterial({ map: t, roughness: 0.5 });
  m.userData.owned = true;
  return new THREE.Mesh(new THREE.PlaneGeometry(w, h), m);
}

function jar(parent, x, z, size, material) {
  const profile = [[0.03, 0], [0.22, 0.04], [0.36, 0.2], [0.39, 0.48], [0.32, 0.77], [0.2, 0.93], [0.15, 0.97], [0.15, 1.03], [0.21, 1.05]]
    .map(([r, hh]) => new THREE.Vector2(r * size, hh * size));
  add(parent, new THREE.LatheGeometry(profile, 28), material, x, 0, z);
}

/* ---------------------------------------------------------------- models */
// Front of every model faces local +Z.

function batTrang() {
  const M = materials();
  const g = new THREE.Group();
  const n = 5, step = 2.6, rise = 0.55, x0 = -((n - 1) * step) / 2;
  for (let i = 0; i < n; i++) {
    const x = x0 + i * step, base = i * rise;
    if (base > 0) box(g, step + 0.2, base, 4.6, M.earth, x, 0, 0);
    const dome = add(g, new THREE.SphereGeometry(1, 40, 18, 0, Math.PI * 2, 0, Math.PI / 2), M.clay, x, base, 0);
    dome.scale.set(step * 0.6, 2.6, 1.9);
    box(g, 0.9, 1.25, 0.25, M.woodDark, x, base, 1.75);
    box(g, 1.15, 0.18, 0.4, M.brick, x, base + 1.25, 1.75);
    for (const dz of [-0.6, 0, 0.6]) cyl(g, 0.09, 0.09, 0.14, M.ink, x, base + 2.5, dz, 8);
    box(g, 0.36, 0.3, 4.2, M.brick, x + step / 2, base, 0);
  }
  const fire = add(g, new THREE.SphereGeometry(1, 30, 14, 0, Math.PI * 2, 0, Math.PI / 2), M.clay, x0 - 1.9, 0, 0);
  fire.scale.set(1.25, 1.5, 1.5);
  box(g, 0.3, 0.8, 0.8, M.ink, x0 - 3.05, 0, 0);
  const top = (n - 1) * rise, cx = x0 + (n - 1) * step + 1.9;
  box(g, 1.6, top + 1.2, 3.4, M.brick, cx, 0, 0);
  box(g, 1.3, 4.6, 1.3, M.brick, cx, top + 1.2, 0);
  box(g, 1.55, 0.25, 1.55, M.brickOld, cx, top + 5.8, 0);
  // Timber shelter over the kiln, open sided.
  for (const px of [-6.5, -2, 2.5, 6.5]) for (const pz of [-2.8, 2.8]) cyl(g, 0.12, 0.14, 4.4, M.woodDark, px, 0, pz, 8);
  roof(g, { w: 15, d: 7.2, h: 1.7, y: 4.4, sag: 0.25, gable: true });
  for (let i = 0; i < 4; i++) for (let k = 0; k < 4; k++) cyl(g, 0.3, 0.3, 0.32, M.clay, -4 + i * 0.7, k * 0.33, -4.2, 18);
  jar(g, -4.8, 4.2, 1.1, M.clay);
  jar(g, -3.6, 4.5, 0.8, M.granite);
  jar(g, 3.6, 4.3, 0.95, M.clay);
  return g;
}

function maMay() {
  const M = materials();
  const g = new THREE.Group();
  const sections = [
    { z0: 14, z1: 8, w: 5.0, kind: "shop", h: 6.4 },
    { z0: 8, z1: 5, w: 5.25, kind: "court" },
    { z0: 5, z1: -2, w: 5.5, kind: "house", h: 6.2 },
    { z0: -2, z1: -5.5, w: 5.7, kind: "court" },
    { z0: -5.5, z1: -14, w: 6.0, kind: "back", h: 5.4 },
  ];
  for (const s of sections) {
    const depth = s.z0 - s.z1, zc = (s.z0 + s.z1) / 2;
    box(g, s.w, 0.2, depth, s.kind === "court" ? M.paving : M.paving, 0, 0, zc);
    for (const side of [-1, 1]) box(g, 0.22, 7.0, depth, M.plasterOld, side * (s.w / 2 + 0.11), 0, zc);
    if (s.kind === "court") {
      box(g, 1.4, 0.45, 1.2, M.plaster, 0.6, 0.2, zc);
      box(g, 1.2, 0.04, 1.0, M.glass, 0.6, 0.62, zc);
      tree(g, -1.4, zc, 2.2, 0.6, 0.2);
      continue;
    }
    for (const pz of [s.z0 - 0.3, s.z1 + 0.3]) for (const px of [-s.w / 2 + 0.35, s.w / 2 - 0.35]) cyl(g, 0.13, 0.13, s.h - 0.2, M.wood, px, 0.2, pz, 10);
    box(g, s.w, 0.18, depth, M.wood, 0, 3.1, zc);
    roof(g, { w: s.w + 0.4, d: depth + 0.6, h: 1.7, y: s.h, z: zc, gable: true, sag: 0.25 });
  }
  // Street facade: shutters, upper loggia and windows.
  for (let i = 0; i < 8; i++) box(g, 0.5, 2.7, 0.08, i % 3 === 1 ? M.woodDark : M.wood, -1.82 + i * 0.52, 0.2, 13.92);
  box(g, 5.0, 0.35, 0.3, M.woodDark, 0, 2.9, 13.95);
  box(g, 5.0, 3.1, 0.22, M.plaster, 0, 3.25, 13.9);
  for (const x of [-1.2, 1.2]) {
    box(g, 1.0, 1.55, 0.12, M.shutter, x, 3.95, 14.04);
    box(g, 1.3, 0.12, 0.4, M.wood, x, 3.85, 14.12);
    box(g, 1.18, 0.1, 0.16, M.plasterWhite, x, 5.55, 14.02);
  }
  for (const zc of [8, -2]) {
    for (let i = 0; i < 9; i++) box(g, 0.06, 0.8, 0.06, M.wood, -2.3 + i * 0.55, 3.28, zc - 0.1);
    box(g, 4.8, 0.08, 0.08, M.wood, 0, 4.08, zc - 0.1);
  }
  return g;
}

function mausoleum() {
  const M = materials();
  const g = new THREE.Group();
  box(g, 41.2, 1.2, 33, M.graniteDark, 0, 0, 0);
  box(g, 38.6, 1.2, 30.4, M.granite, 0, 1.2, 0);
  box(g, 36, 1.2, 27.8, M.graniteLight, 0, 2.4, 0);
  for (let i = 0; i < 7; i++) box(g, 12, (i + 1) * 0.5, 0.8, M.graniteLight, 0, 0, 13.9 + (6 - i) * 0.8 + 0.4);
  const colY = 3.6, colH = 9.4, cx = 14, cz = 11.4;
  box(g, 23, colH, 18.5, M.graniteDark, 0, colY, 0);
  // Recessed door with bronze frame on the main facade.
  box(g, 3.2, 4.6, 0.3, M.ink, 0, colY, 9.3);
  box(g, 3.6, 0.25, 0.4, M.gold, 0, colY + 4.6, 9.32);
  const col = (px, pz) => {
    box(g, 1.0, colH - 0.5, 1.0, M.graniteLight, px, colY + 0.25, pz);
    box(g, 1.25, 0.25, 1.25, M.granite, px, colY, pz);
    box(g, 1.25, 0.25, 1.25, M.granite, px, colY + colH - 0.25, pz);
  };
  for (let i = 0; i <= 12; i++) {
    const px = -cx + (2 * cx * i) / 12;
    col(px, -cz);
    col(px, cz);
  }
  for (let i = 1; i < 10; i++) {
    const pz = -cz + (2 * cz * i) / 10;
    col(-cx, pz);
    col(cx, pz);
  }
  box(g, 2 * cx + 1.6, 1.6, 2 * cz + 1.6, M.granite, 0, colY + colH, 0);
  const plaque = textPlane("CHỦ TỊCH HỒ-CHÍ-MINH", 15, 1.1);
  plaque.position.set(0, colY + colH + 0.8, cz + 0.81);
  g.add(plaque);
  const roofY = colY + colH + 1.6;
  box(g, 2 * cx + 2.4, 1.0, 2 * cz + 2.4, M.graniteLight, 0, roofY, 0);
  const fr = new THREE.CylinderGeometry(15.5 / Math.SQRT2 * 1.05, 30.4 / Math.SQRT2, 4.8, 4, 1);
  fr.rotateY(Math.PI / 4);
  fr.scale(1, 1, (2 * cz + 2) / (2 * cx + 2));
  fr.computeVertexNormals();
  add(g, fr, M.granite, 0, roofY + 1.0 + 2.4, 0);
  box(g, 15.8, 0.6, 12.6, M.graniteDark, 0, roofY + 5.8, 0);
  box(g, 14.4, 0.6, 11.4, M.graniteLight, 0, roofY + 6.4, 0);
  return g;
}

function roundWindow(parent, x, y, z, rotY) {
  const M = materials();
  const g = new THREE.Group();
  g.position.set(x, y, z);
  g.rotation.y = rotY;
  parent.add(g);
  add(g, new THREE.CircleGeometry(0.7, 40), M.ink, 0, 0, 0.005);
  add(g, new THREE.TorusGeometry(0.72, 0.07, 6, 48), M.gold, 0, 0, 0.03);
  for (let i = 0; i < 8; i++) {
    const bar = add(g, new THREE.BoxGeometry(0.05, 1.36, 0.04), M.gold, 0, 0, 0.03);
    bar.rotation.z = (i * Math.PI) / 8;
  }
}

function khueVanCac() {
  const M = materials();
  const g = new THREE.Group();
  box(g, 6.8, 0.55, 6.8, M.brick, 0, 0, 0);
  box(g, 7.0, 0.1, 7.0, M.granite, 0, 0.55, 0);
  for (let i = 0; i < 3; i++) box(g, 2.6, 0.18 * (i + 1), 0.4, M.granite, 0, 0, 4.0 - i * 0.4);
  const pillarH = 3.3, base = 0.65, off = 2.25;
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
    box(g, 1.0, pillarH, 1.0, M.plasterWhite, sx * off, base, sz * off);
    // Carved panels and capitals on each brick pillar.
    box(g, 0.6, 1.2, 1.02, M.plasterOld, sx * off, base + 0.9, sz * off);
    box(g, 1.02, 1.2, 0.6, M.plasterOld, sx * off, base + 0.9, sz * off);
    cornice(g, 1.0, 1.0, M.plasterWhite, base + pillarH - 0.25, 0.08, sx * off, sz * off);
  }
  const floorY = base + pillarH;
  box(g, 5.6, 0.3, 5.6, M.woodDark, 0, floorY, 0);
  roof(g, { w: 7.6, d: 7.6, h: 1.35, y: floorY - 0.15, curl: 0.5, truncate: 0.55, sag: 0.2 });
  const bodyY = floorY + 0.3;
  box(g, 3.7, 2.2, 3.7, M.lacquer, 0, bodyY, 0);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) box(g, 0.18, 2.2, 0.18, M.gold, sx * 1.86, bodyY, sz * 1.86);
  for (let i = 0; i < 4; i++) {
    const a = (i * Math.PI) / 2;
    roundWindow(g, Math.sin(a) * 1.86, bodyY + 1.15, Math.cos(a) * 1.86, a);
  }
  for (let i = 0; i <= 8; i++) {
    const t = -2.4 + i * 0.6;
    for (const s of [-1, 1]) {
      box(g, 0.08, 0.55, 0.08, M.lacquer, t, bodyY + 0.25, s * 2.4);
      box(g, 0.08, 0.55, 0.08, M.lacquer, s * 2.4, bodyY + 0.25, t);
    }
  }
  for (const s of [-1, 1]) {
    box(g, 4.9, 0.08, 0.1, M.lacquer, 0, bodyY + 0.8, s * 2.4);
    box(g, 0.1, 0.08, 4.9, M.lacquer, s * 2.4, bodyY + 0.8, 0);
  }
  roof(g, { w: 5.6, d: 5.6, h: 2.0, y: bodyY + 2.2, curl: 0.6, sag: 0.25, finial: true });
  tree(g, -5.4, -4.6, 9, 3.0);
  tree(g, 5.6, -5.0, 8, 2.6);
  return g;
}

function doanMon() {
  const M = materials();
  const g = new THREE.Group();
  const L = 46.5, depth = 8, h = 6;
  const gates = [
    { x: -7.2, w: 2.5, h: 3.8, round: true }, { x: -3.6, w: 2.5, h: 3.8, round: true },
    { x: 0, w: 2.7, h: 4.0, round: true },
    { x: 3.6, w: 2.5, h: 3.8, round: true }, { x: 7.2, w: 2.5, h: 3.8, round: true },
  ];
  archedWall(g, { w: L, h, depth, arches: gates, material: M.brickOld, z: -depth / 2, trim: M.granite });
  for (const s of [-1, 1]) {
    box(g, 8, h, 11, M.brickOld, s * (L / 2 - 4), 0, 5.5);
    box(g, 8.3, 0.6, 11.3, M.granite, s * (L / 2 - 4), 0, 5.5);
  }
  box(g, L + 0.3, 0.6, depth + 0.3, M.granite, 0, 0, -depth / 2);
  cornice(g, L, depth, M.brickOld, h - 0.3, 0.12, 0, -depth / 2);
  for (let i = 0; i < 46; i++) box(g, 0.6, 0.75, 0.42, M.brickOld, -L / 2 + 0.5 + i * 1.0, h, -0.2);
  for (const s of [-1, 1]) for (let i = 0; i < 11; i++) box(g, 0.42, 0.75, 0.6, M.brickOld, s * (L / 2 - 0.2), h, 0.5 + i * 1.0);
  // Watch pavilion (vọng lâu): lacquered columns, double roof.
  const py = h;
  box(g, 15, 0.45, 7, M.granite, 0, py, -depth / 2);
  for (let i = 0; i <= 6; i++) for (const pz of [-1.6, -6.4]) {
    cyl(g, 0.22, 0.24, 2.6, M.lacquer, -6 + i * 2, py + 0.45, pz, 12);
    cyl(g, 0.3, 0.3, 0.2, M.granite, -6 + i * 2, py + 0.45, pz, 12);
  }
  box(g, 10.8, 2.4, 3.4, M.lacquer, 0, py + 0.45, -depth / 2);
  for (let i = 0; i < 5; i++) box(g, 1.4, 1.8, 0.08, M.woodDark, -4 + i * 2, py + 0.75, -depth / 2 + 1.72);
  roof(g, { w: 15.5, d: 8.4, h: 1.5, y: py + 2.6, z: -depth / 2, curl: 0.55, truncate: 0.55, sag: 0.25 });
  box(g, 10, 1.3, 3.6, M.lacquer, 0, py + 3.2, -depth / 2);
  roof(g, { w: 13, d: 6.6, h: 2.4, y: py + 4.4, z: -depth / 2, curl: 0.65, sag: 0.3 });
  return g;
}

function thapRua() {
  const M = materials();
  const g = new THREE.Group();
  const mound = new THREE.CylinderGeometry(5.0, 6.4, 1.2, 56, 2);
  const mp = mound.attributes.position;
  for (let i = 0; i < mp.count; i++) {
    const a = Math.atan2(mp.getZ(i), mp.getX(i));
    const k = 1 + Math.sin(a * 3) * 0.06 + Math.cos(a * 5) * 0.05;
    mp.setX(i, mp.getX(i) * k * 1.12);
    mp.setZ(i, mp.getZ(i) * k * 0.85);
  }
  mound.computeVertexNormals();
  add(g, mound, M.grass, 0, 0.6, 0);
  const y0 = 1.2;
  box(g, 7.4, 0.35, 5.6, M.plasterOld, 0, y0, 0);
  archedStorey(g, { w: 6.28, d: 4.54, h: 2.9, t: 0.4, long: 3, short: 2, archW: 0.95, archH: 2.2, y: y0 + 0.35, material: M.plasterOld });
  cornice(g, 6.4, 4.66, M.plasterWhite, y0 + 3.25, 0.12);
  archedStorey(g, { w: 4.8, d: 3.64, h: 2.3, t: 0.32, long: 3, short: 2, archW: 0.75, archH: 1.7, y: y0 + 3.6, material: M.plasterOld });
  cornice(g, 4.9, 3.74, M.plasterWhite, y0 + 5.9, 0.1);
  const s3 = y0 + 6.15;
  box(g, 2.97, 1.25, 1.9, M.plasterOld, 0, s3, 0);
  const ring = add(g, new THREE.TorusGeometry(0.34, 0.06, 6, 32), M.plasterWhite, 1.5, s3 + 0.65, 0);
  ring.rotation.y = Math.PI / 2;
  add(g, new THREE.CircleGeometry(0.32, 28), M.ink, 1.49, s3 + 0.65, 0).rotation.y = Math.PI / 2;
  cornice(g, 3.0, 1.94, M.plasterWhite, s3 + 1.25, 0.08);
  const lv = s3 + 1.5;
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) box(g, 0.2, 0.5, 0.2, M.plasterWhite, sx * 0.8, lv, sz * 0.8);
  roof(g, { w: 2.5, d: 2.5, h: 0.7, y: lv + 0.5, curl: 0.25, sag: 0.2, finial: true });
  tree(g, -5.6, -1.2, 7, 2.2, 1.2);
  tree(g, 5.4, 1.4, 6, 1.9, 1.2);
  return g;
}

/* Bát Tràng Pottery Museum (1+1>2 Architects, 2021–2022): seven interlocking
   "potter's wheel" volumes, inverted and stepped like a canyon, 4 storeys over an
   open-air ground floor, fibre-reinforced concrete bands, earthen brick, mosaic
   ceramic, a roof garden and skylights. Site 3,380 m², GFA 6,300 m². Circle
   centres follow the lobes of OSM way 1206576120 (local x = east, z = south). */
let mosaicMaterial = null;
function mosaic() {
  if (mosaicMaterial) return mosaicMaterial;
  mosaicMaterial = weather(pbr((a, h, s) => {
    const n = 16, w = s / n;
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        const k = rand();
        a.fillStyle = k < 0.45 ? `rgb(${236 + k * 15 | 0},${234 + k * 12 | 0},${226 | 0})` : k < 0.8 ? `rgb(${34 + k * 30 | 0},${70 + k * 40 | 0},${130 + k * 60 | 0})` : `rgb(${170 + k * 40 | 0},${110 + k * 20 | 0},${60})`;
        a.fillRect(i * w + 1, j * w + 1, w - 2, w - 2);
        h.fillStyle = `rgb(${200 + rand() * 50 | 0},0,0)`;
        h.fillRect(i * w + 1, j * w + 1, w - 2, w - 2);
      }
    }
  }, { roughness: 0.25, normal: 2.5 }), { grime: 0.2 });
  return mosaicMaterial;
}

// Cylinder whose UVs are in metres (circumference × height) so tiled textures keep scale.
function ring(parent, rTop, rBottom, h, material, x, y, z, { open = true, seg = 56 } = {}) {
  const g = new THREE.CylinderGeometry(rTop, rBottom, h, seg, 1, open);
  const uv = g.attributes.uv;
  const circ = Math.PI * (rTop + rBottom);
  for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * circ, uv.getY(i) * h);
  return add(parent, g, material, x, y + h / 2, z);
}

function disc(parent, r, h, material, x, y, z, seg = 56) {
  return add(parent, new THREE.CylinderGeometry(r, r, h, seg), material, x, y + h / 2, z);
}

function potteryMuseum() {
  const M = materials();
  const g = new THREE.Group();
  const storey = 4.1;
  const wheels = [
    { x: -18, z: -1, r: 8.5, n: 4 }, { x: -12, z: 6, r: 6.5, n: 3 }, { x: -8, z: -5, r: 5.5, n: 4 },
    { x: 2, z: 2, r: 6.5, n: 4 }, { x: 8, z: -4, r: 5, n: 3 }, { x: 14, z: 4, r: 6, n: 4 }, { x: 17, z: -4, r: 5.5, n: 3 },
  ];
  // Forecourt and festival plaza (gạch bát paving) toward Đường Bát Tràng.
  box(g, 58, 0.12, 30, M.paving, 0, 0, 0);
  for (const w of wheels) {
    const { x, z, r, n } = w;
    // Ground floor: slim core (stairs, lift) leaves an open-air canyon around it.
    ring(g, r * 0.42, r * 0.42, storey, M.brick, x, 0.12, z, { open: false });
    ring(g, r * 0.43, r * 0.43, 1.6, M.glass, x, 1.3, z);
    for (let k = 0; k < 6; k++) {
      const a = (k / 6) * Math.PI * 2 + 0.3;
      cyl(g, 0.22, 0.22, storey, M.plasterWhite, x + Math.cos(a) * r * 0.7, 0.12, z + Math.sin(a) * r * 0.7, 10);
    }
    // Upper floors: inverted, stepped "turntable" rings that widen as they rise.
    for (let k = 1; k < n; k++) {
      const y = 0.12 + k * storey;
      const rb = r * (0.72 + 0.12 * (k - 1));
      const rt = rb + 0.55;
      disc(g, rt + 0.6, 0.35, M.plasterWhite, x, y - 0.35, z);              // FRC slab edge / terrace
      ring(g, rt, rb, storey - 0.35, M.brick, x, y, z);                       // earthen-brick drum
      ring(g, rt - 0.12, rb + 0.06, 1.25, M.glass, x, y + 1.0, z);           // ribbon window
      ring(g, rt + 0.03, rt + 0.03, 0.42, mosaic(), x, y + storey - 0.8, z); // ceramic mosaic band
      if (k % 2 === 1) ring(g, rt + 0.55, rt + 0.55, 0.5, M.grass, x, y, z); // terrace planters
    }
    // Roof garden with a skylight oculus over the void.
    const top = 0.12 + n * storey;
    const rr = r * (0.72 + 0.12 * (n - 2)) + 0.55;
    disc(g, rr + 0.6, 0.4, M.plasterWhite, x, top - 0.4, z);
    disc(g, rr + 0.2, 0.25, M.grass, x, top, z);
    ring(g, rr * 0.32, rr * 0.32, 0.7, M.glass, x, top, z, { open: false });
    ring(g, rr + 0.5, rr + 0.5, 0.9, M.plasterWhite, x, top, z);           // parapet
    tree(g, x + rr * 0.55, z - rr * 0.3, 4, 1.3, top + 0.25);
  }
  // Giant ceramic vases and planters on the plaza.
  jar(g, -25, 11, 3.2, mosaic());
  jar(g, 23, 10, 2.6, M.clay);
  jar(g, -4, 12.5, 2.2, mosaic());
  jar(g, 8, 12.5, 1.8, M.clay);
  for (const x of [-27, -13, 15, 27]) tree(g, x, 13.5, 7, 2.4);
  return g;
}

export const BUILDERS = {
  "bat-trang": potteryMuseum,
  "bat-trang-kiln": batTrang,
  "ma-may": maMay,
  "hoang-thanh": doanMon,
  "lang-bac": mausoleum,
  "van-mieu": khueVanCac,
  "ho-guom": thapRua,
};

/* ---------------------------------------------------------------- post */
// Contact shadow baked into vertex colours: darker near the ground.
function bakeContactShadow(root) {
  root.updateMatrixWorld(true);
  const v = new THREE.Vector3();
  root.traverse((node) => {
    if (!node.isMesh || node.isInstancedMesh) return;
    const pos = node.geometry.attributes.position;
    const colors = new Float32Array(pos.count * 3);
    for (let i = 0; i < pos.count; i++) {
      v.fromBufferAttribute(pos, i).applyMatrix4(node.matrixWorld);
      const t = THREE.MathUtils.clamp(v.y / 1.6, 0, 1);
      const k = 0.52 + 0.48 * t * t * (3 - 2 * t);
      colors[i * 3] = colors[i * 3 + 1] = colors[i * 3 + 2] = k;
    }
    node.geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  });
}

function buildScene(model, env) {
  const scene = new THREE.Scene();
  scene.environment = env;
  scene.environmentIntensity = 0.55;
  bakeContactShadow(model);
  model.traverse((node) => { if (node.isMesh) node.frustumCulled = true; });
  scene.add(model);
  const box3 = new THREE.Box3().setFromObject(model);
  const size = box3.getSize(new THREE.Vector3());
  const radius = Math.max(size.x, size.z) * 0.75 + 4;
  scene.add(new THREE.HemisphereLight(0xeef3f6, 0x6b6150, 1.1));
  const sun = new THREE.DirectionalLight(0xfff0d6, 3.2);
  sun.position.copy(SUN_DIR).multiplyScalar(radius * 1.8);
  sun.castShadow = false;
  const shadowSize = window.innerWidth < 760 ? 512 : 1024;
  sun.shadow.mapSize.set(shadowSize, shadowSize);
  sun.shadow.bias = -0.0005;
  sun.shadow.normalBias = 0.03;
  Object.assign(sun.shadow.camera, { left: -radius, right: radius, top: radius, bottom: -radius, near: 0.5, far: radius * 5 });
  scene.add(sun);
  scene.add(sun.target);
  scene.userData.shadowLight = sun;
  scene.userData.shadowReady = false;
  const fill = new THREE.DirectionalLight(0x9fb4c8, 0.6);
  fill.position.set(radius, radius * 0.5, -radius);
  scene.add(fill);
  // Shadow catcher on the map surface.
  const catcher = new THREE.Mesh(new THREE.PlaneGeometry(radius * 2.4, radius * 2.4), new THREE.ShadowMaterial({ opacity: 0.3 }));
  catcher.rotation.x = -Math.PI / 2;
  catcher.position.y = 0.06;
  catcher.renderOrder = 3;
  catcher.receiveShadow = true;
  catcher.frustumCulled = false;
  scene.add(catcher);
  return scene;
}

/**
 * MapLibre custom layer that renders every landmark at its real position.
 * sites: [{ id, lonlat: [lon, lat], bearing }] — bearing is the compass
 * direction the model front faces.
 */
function lakeMesh(lake, toLocal) {
  const rings = lake.geometry.coordinates.map((ring) => ring.map(toLocal));
  const shape = new THREE.Shape(rings[0].map(([x, z]) => new THREE.Vector2(x, -z)));
  for (const hole of rings.slice(1)) shape.holes.push(new THREE.Path(hole.map(([x, z]) => new THREE.Vector2(x, -z))));
  const geometry = new THREE.ShapeGeometry(shape, 4);
  geometry.rotateX(-Math.PI / 2);
  const mesh = new THREE.Mesh(geometry, waterMaterial());
  mesh.position.y = 0.03;
  mesh.renderOrder = 1;
  mesh.frustumCulled = false;
  mesh.userData.water = true;
  // Islands (holes in the lake polygon): grassy top with an earth bank.
  const islands = rings.slice(1).map((ring) => {
    const s = new THREE.Shape(ring.map(([x, z]) => new THREE.Vector2(x, -z)));
    const g = new THREE.ExtrudeGeometry(s, { depth: 0.55, bevelEnabled: true, bevelThickness: 0.25, bevelSize: 0.6, bevelSegments: 3 });
    g.rotateX(-Math.PI / 2);
    g.setAttribute("color", new THREE.BufferAttribute(new Float32Array(g.attributes.position.count * 3).fill(1), 3));
    const island = new THREE.Mesh(g, [materials().grass, materials().earth]);
    island.position.y = -0.3;
    island.receiveShadow = true;
    island.frustumCulled = false;
    return island;
  });
  return { water: mesh, islands };
}

/* ---------------------------------------------------------------- car */
// Ferrari 458 Italia by vicent091036 (CC BY 4.0), the Draco-compressed GLB from
// the three.js examples. Real length 4.53 m; front faces local +Z.
const CAR_LENGTH = 4.53;
const WHEEL_RADIUS = 0.34;
function createCar(env, url, map) {
  const scene = new THREE.Scene();
  scene.environment = env;
  scene.environmentIntensity = 0.9;
  scene.add(new THREE.HemisphereLight(0xeef3f6, 0x6b6150, 1.0));
  const sun = new THREE.DirectionalLight(0xfff0d6, 3.0);
  sun.castShadow = true;
  const shadowSize = window.innerWidth < 760 ? 256 : 512;
  sun.shadow.mapSize.set(shadowSize, shadowSize);
  sun.shadow.bias = -0.0005;
  sun.shadow.normalBias = 0.02;
  Object.assign(sun.shadow.camera, { left: -6, right: 6, top: 6, bottom: -6, near: 0.5, far: 40 });
  scene.add(sun, sun.target);
  const catcher = new THREE.Mesh(new THREE.PlaneGeometry(14, 14), new THREE.ShadowMaterial({ opacity: 0.38 }));
  catcher.rotation.x = -Math.PI / 2;
  catcher.position.y = 0.02;
  catcher.receiveShadow = true;
  scene.add(catcher);
  const holder = new THREE.Group();
  scene.add(holder);
  // The car's front faces local +Z, so exhaust must drift from the rear on -Z.
  const smoke = particles({ count: window.innerWidth < 760 ? 16 : 32, origin: [0, 0.38, -2.7], spread: [0.45, 0.16, 0.18], velocity: [0, 0.5, -1], life: 2.2, size: [0.55, 2], color: 0xaaa69f, opacity: 0.38, turbulence: 0.55 });
  scene.add(smoke);
  const car = { scene, holder, sun, smoke, wheels: [], ready: false };

  const draco = new DRACOLoader().setDecoderPath("https://cdn.jsdelivr.net/npm/three@0.177.0/examples/jsm/libs/draco/gltf/");
  new GLTFLoader().setDRACOLoader(draco).load(url, (gltf) => {
    const model = gltf.scene;
    const paint = new THREE.MeshPhysicalMaterial({ color: 0x8f1d14, metalness: 1, roughness: 0.45, clearcoat: 1, clearcoatRoughness: 0.03 });
    const chrome = new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 1, roughness: 0.25 });
    const glass = new THREE.MeshPhysicalMaterial({ color: 0x1a2226, metalness: 0.2, roughness: 0.04, transparent: true, opacity: 0.55, clearcoat: 1 });
    const set = (name, material) => { const o = model.getObjectByName(name); if (o) o.material = material; };
    set("body", paint);
    for (const n of ["rim_fl", "rim_fr", "rim_rl", "rim_rr", "trim"]) set(n, chrome);
    set("glass", glass);
    for (const n of ["wheel_fl", "wheel_fr", "wheel_rl", "wheel_rr"]) { const w = model.getObjectByName(n); if (w) car.wheels.push(w); }
    model.traverse((node) => { if (node.isMesh) { node.castShadow = true; node.receiveShadow = true; node.frustumCulled = true; } });
    const size = new THREE.Box3().setFromObject(model).getSize(new THREE.Vector3());
    model.scale.setScalar(CAR_LENGTH / Math.max(size.x, size.z));
    model.rotation.y = Math.PI; // the GLB's front wheels sit at -Z
    holder.add(model);
    car.ready = true;
    map?.triggerRepaint();
  }, undefined, (error) => console.warn("Car model failed to load:", error?.message || error));
  return car;
}

export function createLandmarkLayer(maplibregl, sites, { lake, carUrl } = {}) {
  let renderer;
  let map;
  let env;
  let activeSite = null;
  const camera = new THREE.Camera();
  const entries = [];
  const base = new THREE.Matrix4();
  const clock = new THREE.Clock();
  const v0 = new THREE.Vector4(), v1 = new THREE.Vector4(), inv = new THREE.Matrix4();
  let car = null;
  let carLoadStarted = false;
  let sceneBuildQueued = false;
  const vehicle = { visible: false, animate: false, lonlat: [0, 0], bearing: 0, distance: 0, scale: 1, shadowDirty: false };
  const carMatrix = new THREE.Matrix4();
  const preloadVehicle = () => {
    if (carLoadStarted || !carUrl || !env) return;
    carLoadStarted = true;
    car = createCar(env, carUrl, map);
  };
  return {
    /** Place the illustrative car: position, heading (compass °), distance travelled (m), size multiplier. */
    setVehicle(state) {
      const nextDistance = state.distance ?? vehicle.distance;
      const nextBearing = state.bearing ?? vehicle.bearing;
      const bearingDelta = Math.abs((((nextBearing - vehicle.bearing + 540) % 360) - 180));
      const mobile = window.innerWidth < 760;
      const shadowDistance = mobile ? 84 : 24;
      const shadowTurn = mobile ? 35 : 12;
      const animationChanged = state.animate != null && Boolean(state.animate) !== vehicle.animate;
      if (state.visible && (!vehicle.visible || Math.abs(nextDistance - vehicle.distance) > shadowDistance || bearingDelta > shadowTurn)) vehicle.shadowDirty = true;
      Object.assign(vehicle, state);
      if (state.visible) preloadVehicle();
      if (animationChanged) map?.triggerRepaint();
    },
    preloadVehicle,
    setActiveSite(id) { activeSite = id || null; map?.triggerRepaint(); },
    get debug() { return { vehicle, carReady: Boolean(car?.ready), wheels: car?.wheels.length ?? 0 }; },
    id: "landmarks-3d",
    type: "custom",
    renderingMode: "3d",
    onAdd(m, gl) {
      map = m;
      renderer = new THREE.WebGLRenderer({ canvas: m.getCanvas(), context: gl, antialias: window.innerWidth >= 760 });
      renderer.autoClear = false;
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      renderer.shadowMap.autoUpdate = false;
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.0;
      env = makeEnvironment(renderer);
      for (const site of sites) {
        const build = BUILDERS[site.id];
        if (!build) continue;
        const entrySeed = 101 + entries.length * 17;
        const mc = maplibregl.MercatorCoordinate.fromLngLat(site.lonlat, 0);
        const s = mc.meterInMercatorCoordinateUnits();
        const yaw = Math.PI - THREE.MathUtils.degToRad(site.bearing || 0);
        const transform = new THREE.Matrix4()
          .makeTranslation(mc.x, mc.y, mc.z)
          .scale(new THREE.Vector3(s, -s, s))
          .multiply(new THREE.Matrix4().makeRotationX(Math.PI / 2))
          .multiply(new THREE.Matrix4().makeRotationY(yaw));
        // Local metres (x, z) for a lon/lat, undoing the model yaw.
        const toLocal = ([lon, lat]) => {
          const e = (lon - site.lonlat[0]) * 111320 * Math.cos((site.lonlat[1] * Math.PI) / 180);
          const sth = -(lat - site.lonlat[1]) * 110540;
          return [e * Math.cos(yaw) - sth * Math.sin(yaw), e * Math.sin(yaw) + sth * Math.cos(yaw)];
        };
        entries.push({ id: site.id, lonlat: site.lonlat, transform, toLocal, build, seed: entrySeed, scene: null, animated: [] });
      }
      renderer.resetState();
    },
    render(gl, args) {
      const matrix = args?.defaultProjectionData?.mainMatrix ?? args;
      base.fromArray(matrix);
      const w = gl.drawingBufferWidth, h = gl.drawingBufferHeight;
      const vp = renderer.getViewport(new THREE.Vector4());
      if (vp.z !== w || vp.w !== h) renderer.setViewport(0, 0, w, h);
      const center = map.getCenter();
      const zoom = map.getZoom();
      if (zoom < 13.2) return;
      const reach = (window.innerWidth < 760 ? 26000 : 40000) / Math.pow(2, zoom - 12);
      const time = clock.getElapsedTime();
      const visible = [];
      for (const e of entries) {
        const dx = (e.lonlat[0] - center.lng) * 111320 * Math.cos((center.lat * Math.PI) / 180);
        const dy = (e.lonlat[1] - center.lat) * 110540;
        const distance = Math.hypot(dx, dy);
        if (distance > reach) continue;
        visible.push({ entry: e, distance });
      }
      visible.sort((a, b) => a.distance - b.distance);

      const next = visible.find(({ entry }) => !entry.scene)?.entry;
      if (next && !sceneBuildQueued) {
        sceneBuildQueued = true;
        const buildWhenIdle = () => {
          sceneBuildQueued = false;
          if (!map || next.scene) return;
          seed = next.seed;
          next.scene = buildScene(next.build(), env);
          for (const fx of EFFECTS[next.id]?.() || []) { next.scene.add(fx); next.animated.push(fx); }
          if (next.id === "ho-guom" && lake) {
            const { water, islands } = lakeMesh(lake, next.toLocal);
            next.scene.add(water, ...islands);
            next.animated.push(water);
          }
          map.triggerRepaint();
        };
        if (window.requestIdleCallback) window.requestIdleCallback(buildWhenIdle, { timeout: 1200 });
        else window.setTimeout(buildWhenIdle, 40);
      }

      let animating = false;
      const shadowLimit = window.innerWidth < 760 ? 1 : 2;
      const shadowEntries = new Set(visible.filter(({ entry }) => entry.scene).slice(0, shadowLimit).map(({ entry }) => entry));
      for (const { entry: e } of visible) {
        if (!e.scene) continue;
        const light = e.scene.userData.shadowLight;
        const useShadow = zoom >= 14.8 && shadowEntries.has(e);
        if (light.castShadow !== useShadow) {
          light.castShadow = useShadow;
          if (useShadow) e.scene.userData.shadowReady = false;
        }
        if (useShadow && !e.scene.userData.shadowReady) {
          renderer.shadowMap.needsUpdate = true;
          e.scene.userData.shadowReady = true;
        }
        camera.projectionMatrix.copy(base).multiply(e.transform);
        if (e.id === activeSite && e.animated.length) {
          animating = true;
          // Screen scale at the model origin, for metre-sized point sprites.
          const P = camera.projectionMatrix;
          v0.set(0, 0, 0, 1).applyMatrix4(P);
          v1.set(1, 0, 0, 1).applyMatrix4(P);
          const pxPerM = Math.hypot(v1.x / v1.w - v0.x / v0.w, v1.y / v1.w - v0.y / v0.w) * 0.5 * Math.max(w, h);
          inv.copy(P).invert();
          const eye = new THREE.Vector4(0, 0, 1, 0).applyMatrix4(inv);
          for (const obj of e.animated) {
            const u = obj.material.uniforms;
            u.uTime.value = time;
            if (u.uPxPerM) { u.uPxPerM.value = pxPerM; u.uCenterW.value = v0.w; }
            if (u.uEye && Math.abs(eye.w) > 1e-12) u.uEye.value.set(eye.x / eye.w, eye.y / eye.w, eye.z / eye.w);
          }
        }
        renderer.resetState();
        renderer.render(e.scene, camera);
      }
      if (car?.ready && vehicle.visible) {
        const mc = maplibregl.MercatorCoordinate.fromLngLat(vehicle.lonlat, 0);
        const s = mc.meterInMercatorCoordinateUnits() * vehicle.scale;
        const yaw = Math.PI - THREE.MathUtils.degToRad(vehicle.bearing);
        carMatrix.makeTranslation(mc.x, mc.y, mc.z)
          .scale(new THREE.Vector3(s, -s, s))
          .multiply(new THREE.Matrix4().makeRotationX(Math.PI / 2))
          .multiply(new THREE.Matrix4().makeRotationY(yaw));
        // Keep the sun fixed in the world while the car turns.
        car.sun.position.copy(SUN_DIR).applyAxisAngle(new THREE.Vector3(0, 1, 0), -yaw).multiplyScalar(14);
        for (const w of car.wheels) w.rotation.x = vehicle.distance / WHEEL_RADIUS;
        if (vehicle.shadowDirty) {
          renderer.shadowMap.needsUpdate = true;
          vehicle.shadowDirty = false;
        }
        camera.projectionMatrix.copy(base).multiply(carMatrix);
        const P = camera.projectionMatrix;
        v0.set(0, 0, 0, 1).applyMatrix4(P);
        v1.set(1, 0, 0, 1).applyMatrix4(P);
        const pxPerM = Math.hypot(v1.x / v1.w - v0.x / v0.w, v1.y / v1.w - v0.y / v0.w) * 0.5 * Math.max(w, h);
        if (vehicle.animate) {
          car.smoke.material.uniforms.uTime.value = time;
          animating = true;
        }
        car.smoke.material.uniforms.uPxPerM.value = pxPerM;
        car.smoke.material.uniforms.uCenterW.value = v0.w;
        renderer.resetState();
        renderer.render(car.scene, camera);
      }
      if (animating) map.triggerRepaint();
    },
  };
}
