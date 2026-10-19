import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.177.0/build/three.module.js";

const canvas = document.getElementById("architecture-canvas");
const stage = document.querySelector(".model-console__scene");
if (!canvas || !stage) throw new Error("3D stage is missing");

const spots = [
  { id: "bat-trang", title: "Làng gốm Bát Tràng", era: "DI SẢN SỐNG · VEN SÔNG HỒNG", sub: "Đất đỏ · lò nung · bàn tay người thợ" },
  { id: "ma-may", title: "Nhà cổ Mã Mây", era: "NHÀ PHỐ · THẾ KỶ XIX", sub: "Gian hàng · sân trong · nếp nhà sâu" },
  { id: "pho-co", title: "Phố Cổ Hà Nội", era: "PHƯỜNG NGHỀ · KINH KỲ", sub: "Mái hiên · cửa hiệu · nhịp phố" },
  { id: "lang-bac", title: "Quảng trường Ba Đình", era: "DI TÍCH · THẾ KỶ XX", sub: "Đá sáng · hàng cột · khoảng lặng" },
  { id: "van-mieu", title: "Văn Miếu – Quốc Tử Giám", era: "DI TÍCH · TỪ NĂM 1070", sub: "Mái chồng · cột son · sân gạch" },
  { id: "hoang-thanh", title: "Hoàng thành Thăng Long", era: "KINH ĐÔ · DI SẢN UNESCO", sub: "Cổng thành · tường gạch · dấu tích" },
  { id: "ho-guom", title: "Hồ Gươm · Tháp Rùa", era: "HỒ HOÀN KIẾM · TRUYỀN THUYẾT", sub: "Mặt nước · đảo nhỏ · tháp cổ" }
];

const colors = {
  stone: 0xb7a77e,
  pale: 0xe4d5ad,
  plaster: 0xcbbd9b,
  shadow: 0x493f32,
  tile: 0x823c30,
  tileLight: 0xa9543b,
  wood: 0x70472f,
  green: 0x52654d,
  water: 0x395c59,
  gold: 0xd0ac68,
  ink: 0x272b26,
  red: 0x92372f
};

const material = (color, roughness = 0.78, metalness = 0) => new THREE.MeshStandardMaterial({ color, roughness, metalness });
const mats = Object.fromEntries(Object.entries(colors).map(([key, value]) => [key, material(value)]));
const sharedMaterials = new Set(Object.values(mats));
const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0x171a16, 16, 38);
const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
camera.position.set(8.4, 7.2, 10.4);
camera.lookAt(0, 1.25, 0);

const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: "high-performance" });
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.8));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.22;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

scene.add(new THREE.HemisphereLight(0xf3e5c4, 0x282c25, 2.35));
const keyLight = new THREE.DirectionalLight(0xffdf9c, 3.2);
keyLight.position.set(-5, 9, 7);
keyLight.castShadow = true;
keyLight.shadow.mapSize.set(1024, 1024);
keyLight.shadow.camera.left = -8;
keyLight.shadow.camera.right = 8;
keyLight.shadow.camera.top = 8;
keyLight.shadow.camera.bottom = -8;
scene.add(keyLight);
const fillLight = new THREE.PointLight(0x8fa895, 75, 24, 2);
fillLight.position.set(5, 3, -4);
scene.add(fillLight);

const world = new THREE.Group();
scene.add(world);
const platform = new THREE.Group();
world.add(platform);
const disk = new THREE.Mesh(new THREE.CylinderGeometry(3.7, 3.86, 0.27, 72), mats.ink);
disk.position.y = -0.13;
disk.receiveShadow = true;
platform.add(disk);
const diskTop = new THREE.Mesh(new THREE.CylinderGeometry(3.55, 3.68, 0.12, 72), material(0x585343));
diskTop.position.y = 0.06;
diskTop.receiveShadow = true;
platform.add(diskTop);
const insetRing = new THREE.Mesh(new THREE.TorusGeometry(3.4, 0.018, 6, 100), material(0xb99a62, 0.45, 0.25));
insetRing.rotation.x = Math.PI / 2;
insetRing.position.y = 0.125;
platform.add(insetRing);
const innerRing = new THREE.Mesh(new THREE.TorusGeometry(2.88, 0.009, 5, 100), material(0xb99a62, 0.5, 0.2));
innerRing.rotation.x = Math.PI / 2;
innerRing.position.y = 0.126;
platform.add(innerRing);
const ground = new THREE.Mesh(new THREE.CircleGeometry(3.25, 64), material(0x77715d));
ground.rotation.x = -Math.PI / 2;
ground.position.y = 0.125;
ground.receiveShadow = true;
platform.add(ground);

const building = new THREE.Group();
building.position.y = 0.18;
world.add(building);

function box(parent, w, h, d, mat, x = 0, y = 0, z = 0, opts = {}) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
  mesh.position.set(x, y + h / 2, z);
  mesh.castShadow = opts.castShadow !== false;
  mesh.receiveShadow = true;
  parent.add(mesh);
  return mesh;
}

function cylinder(parent, top, bottom, height, mat, x = 0, y = 0, z = 0, segments = 12) {
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(top, bottom, height, segments), mat);
  mesh.position.set(x, y + height / 2, z);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  parent.add(mesh);
  return mesh;
}

function roof(parent, width, depth, height, mat, x = 0, y = 0, z = 0, ridgeWidth = 0.32) {
  const geometry = new THREE.BufferGeometry();
  const w = width / 2, d = depth / 2, r = ridgeWidth / 2;
  const points = [
    -w, 0, -d, w, 0, -d, r, height, 0,
    w, 0, -d, w, 0, d, r, height, 0,
    w, 0, d, -w, 0, d, -r, height, 0,
    -w, 0, d, -w, 0, -d, -r, height, 0,
    -w, 0, -d, -r, height, 0, r, height, 0,
    -w, 0, d, r, height, 0, -r, height, 0
  ];
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(points, 3));
  geometry.computeVertexNormals();
  const roofMesh = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({ color: mat.color, roughness: 0.68, side: THREE.DoubleSide }));
  roofMesh.position.set(x, y, z);
  roofMesh.castShadow = true;
  roofMesh.receiveShadow = true;
  parent.add(roofMesh);
  const ridge = box(parent, ridgeWidth * 1.08, 0.055, 0.09, mats.tileLight, x - ridgeWidth / 2, y + height - 0.025, z - 0.015);
  ridge.rotation.z = 0;
  return roofMesh;
}

function pavilion(parent, options = {}) {
  const { x = 0, z = 0, scale = 1, base = 0.3, tiers = 2, red = false } = options;
  const frame = new THREE.Group();
  frame.position.set(x, 0.2, z);
  frame.scale.setScalar(scale);
  parent.add(frame);
  const postMat = red ? mats.red : mats.wood;
  box(frame, 1.55, 0.12, 1.42, mats.stone, 0, 0, 0);
  box(frame, 1.26, 0.15, 1.16, mats.pale, 0, 0.12, 0);
  const levels = tiers === 3 ? [0.28, 1.3, 2.18] : [0.28, 1.4];
  for (let i = 0; i < 4; i++) {
    const a = Math.PI / 4 + i * Math.PI / 2;
    cylinder(frame, 0.075, 0.075, 1.02, postMat, Math.cos(a) * 0.48, 0.28, Math.sin(a) * 0.48, 10);
  }
  box(frame, 0.94, 0.12, 0.86, mats.wood, 0, 1.28, 0);
  levels.forEach((level, index) => {
    const f = index === 0 ? 1 : index === 1 ? 0.78 : 0.57;
    roof(frame, 1.74 * f, 1.58 * f, 0.44 * f, mats.tile, 0, level, 0, 0.42 * f);
    if (index === 0) box(frame, 1.28, 0.08, 1.12, mats.wood, 0, 1.21, 0);
  });
  cylinder(frame, 0.035, 0.05, 0.23, mats.gold, 0, tiers === 3 ? 2.69 : 1.91, 0, 8);
  return frame;
}

function potteryJar(parent, x, z, size, color) {
  const profile = [
    new THREE.Vector2(0.03, 0), new THREE.Vector2(0.22, 0.04), new THREE.Vector2(0.36, 0.2),
    new THREE.Vector2(0.39, 0.48), new THREE.Vector2(0.32, 0.77), new THREE.Vector2(0.2, 0.93),
    new THREE.Vector2(0.15, 0.97), new THREE.Vector2(0.15, 1.03), new THREE.Vector2(0.21, 1.05)
  ];
  const mesh = new THREE.Mesh(new THREE.LatheGeometry(profile, 24), material(color, 0.3, 0.04));
  mesh.scale.setScalar(size);
  mesh.position.set(x, 0.23, z);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  parent.add(mesh);
  const lip = new THREE.Mesh(new THREE.TorusGeometry(0.18 * size, 0.025 * size, 8, 24), material(0xe1c99a, 0.32));
  lip.position.set(x, 0.23 + size * 1.04, z);
  lip.castShadow = true;
  parent.add(lip);
}

function createBatTrang() {
  const g = new THREE.Group();
  box(g, 2.05, 0.74, 1.3, mats.plaster, 0, 0.26, 0.05);
  const dome = new THREE.Mesh(new THREE.SphereGeometry(0.8, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), mats.wood);
  dome.scale.set(1.24, 0.76, 1.05);
  dome.position.set(0, 0.96, 0.04);
  dome.castShadow = true;
  dome.receiveShadow = true;
  g.add(dome);
  box(g, 0.5, 0.43, 0.06, mats.ink, 0, 0.26, 0.72);
  const arch = new THREE.Mesh(new THREE.TorusGeometry(0.25, 0.045, 8, 18, Math.PI), mats.tileLight);
  arch.position.set(0, 0.69, 0.77);
  g.add(arch);
  for (let i = -2; i <= 2; i++) {
    box(g, 0.035, 0.48, 0.035, mats.tileLight, i * 0.36, 0.28, -0.78);
  }
  const chimney = cylinder(g, 0.16, 0.2, 0.9, mats.stone, -0.57, 1.12, -0.2, 12);
  cylinder(g, 0.24, 0.24, 0.08, mats.ink, -0.57, 1.98, -0.2, 12);
  potteryJar(g, -1.48, 0.24, 0.86, 0x9b523b);
  potteryJar(g, 1.4, -0.46, 0.72, 0xc48a50);
  potteryJar(g, 0.98, 0.58, 0.48, 0x45645e);
  box(g, 1.4, 0.09, 0.88, mats.wood, 0, 0.24, -1.02);
  box(g, 0.07, 0.46, 0.07, mats.ink, -0.56, 0.33, -1.3);
  box(g, 0.07, 0.46, 0.07, mats.ink, 0.56, 0.33, -1.3);
  box(g, 1.28, 0.08, 0.5, mats.tile, 0, 0.76, -1.3);
  return g;
}

function createMaMay() {
  const g = new THREE.Group();
  box(g, 1.42, 0.12, 3.45, mats.stone, 0, 0.18, 0.02);
  box(g, 1.08, 1.18, 1.18, mats.plaster, 0, 0.3, 1.0);
  box(g, 1.08, 1.06, 0.9, mats.wood, 0, 0.3, -0.48);
  box(g, 1.08, 1.22, 0.96, mats.plaster, 0, 0.3, -1.38);
  roof(g, 1.4, 1.34, 0.42, mats.tile, 0, 1.47, 1.0, 0.33);
  roof(g, 1.4, 1.08, 0.38, mats.tile, 0, 1.35, -1.37, 0.3);
  box(g, 0.82, 0.12, 0.08, mats.wood, 0, 0.82, 1.61);
  box(g, 0.82, 0.12, 0.08, mats.wood, 0, 0.82, -1.87);
  for (const z of [1.51, -1.86]) {
    box(g, 0.08, 0.78, 0.08, mats.wood, -0.43, 0.34, z);
    box(g, 0.08, 0.78, 0.08, mats.wood, 0.43, 0.34, z);
  }
  box(g, 0.52, 0.08, 0.06, mats.gold, 0, 1.13, 1.62);
  box(g, 0.5, 0.08, 0.06, mats.gold, 0, 1.11, -1.87);
  for (let i = 0; i < 5; i++) {
    const step = box(g, 0.94 - i * 0.13, 0.08, 0.18, mats.pale, 0, 0.18 + i * 0.06, 1.88 + i * 0.16);
    step.receiveShadow = true;
  }
  const tree = cylinder(g, 0.05, 0.06, 0.65, mats.wood, 0.56, 0.3, -0.5, 8);
  const canopy = new THREE.Mesh(new THREE.IcosahedronGeometry(0.42, 1), mats.green);
  canopy.position.set(0.56, 1.08, -0.5);
  canopy.castShadow = true;
  g.add(canopy);
  return g;
}

function createOldQuarter() {
  const g = new THREE.Group();
  const facades = [0xc6aa7c, 0x9f6b4c, 0xd0c09b, 0x9c8f6d];
  const heights = [2.7, 2.15, 2.45, 1.92];
  for (let i = 0; i < 4; i++) {
    const x = (i - 1.5) * 0.94;
    const h = heights[i];
    box(g, 0.8, h, 1.06, material(facades[i]), x, 0.2, -0.12);
    roof(g, 0.94, 1.24, 0.34, i % 2 ? mats.tile : mats.wood, x, h + 0.2, -0.12, 0.28);
    box(g, 0.64, 0.12, 0.14, mats.wood, x, 1.03, 0.49);
    for (let floor = 0; floor < 2; floor++) {
      box(g, 0.24, 0.34, 0.055, floor ? mats.wood : mats.ink, x - 0.18, 0.75 + floor * 0.82, 0.43);
      box(g, 0.24, 0.34, 0.055, floor ? mats.wood : mats.ink, x + 0.18, 0.75 + floor * 0.82, 0.43);
      box(g, 0.3, 0.045, 0.16, mats.gold, x, 0.68 + floor * 0.82, 0.51);
    }
    box(g, 0.72, 0.16, 0.1, mats.tileLight, x, 0.3, 0.49);
  }
  box(g, 4.1, 0.1, 2.0, mats.stone, 0, 0.18, 0.02);
  for (let i = -2; i <= 2; i++) {
    const post = box(g, 0.04, 0.6, 0.04, mats.gold, i * 0.72, 0.28, 0.92);
    post.castShadow = false;
  }
  return g;
}

function createMausoleum() {
  const g = new THREE.Group();
  box(g, 4.8, 0.12, 3.8, mats.stone, 0, 0.18, 0);
  box(g, 4.1, 0.12, 3.35, mats.pale, 0, 0.3, 0);
  box(g, 3.42, 1.72, 2.55, material(0xb9ad91), 0, 0.42, -0.1);
  box(g, 3.68, 0.2, 2.85, material(0xd4c6a7), 0, 2.12, -0.1);
  box(g, 3.22, 0.18, 2.52, mats.stone, 0, 2.32, -0.1);
  for (let x = -1.3; x <= 1.31; x += 0.43) {
    box(g, 0.055, 1.12, 0.05, mats.gold, x, 0.68, 1.19);
    box(g, 0.055, 1.12, 0.05, mats.gold, x, 0.68, -1.39);
  }
  box(g, 1.32, 0.16, 0.06, mats.red, 0, 2.56, -0.1);
  cylinder(g, 0.025, 0.025, 1.05, mats.gold, 0, 2.72, -0.1, 8);
  const flag = new THREE.Mesh(new THREE.PlaneGeometry(0.7, 0.4), material(0xa5362c, 0.6, 0,));
  flag.position.set(0.35, 3.45, -0.1);
  flag.rotation.y = -0.3;
  g.add(flag);
  box(g, 4.6, 0.05, 0.5, mats.pale, 0, 0.18, 2.1);
  return g;
}

function createTemple() {
  const g = new THREE.Group();
  box(g, 2.4, 0.16, 2.18, mats.stone, 0, 0.18, 0);
  box(g, 1.92, 0.14, 1.72, mats.red, 0, 0.34, 0);
  for (let i = 0; i < 8; i++) {
    const angle = Math.PI / 4 + i * Math.PI / 4;
    cylinder(g, 0.075, 0.09, 1.68, mats.red, Math.cos(angle) * 0.66, 0.48, Math.sin(angle) * 0.58, 10);
  }
  box(g, 1.6, 0.1, 1.42, mats.wood, 0, 2.1, 0);
  roof(g, 2.26, 2.02, 0.68, mats.tile, 0, 2.18, 0, 0.54);
  box(g, 1.02, 0.1, 0.9, mats.red, 0, 2.9, 0);
  roof(g, 1.54, 1.38, 0.52, mats.tileLight, 0, 2.98, 0, 0.42);
  cylinder(g, 0.035, 0.06, 0.36, mats.gold, 0, 3.49, 0, 8);
  for (let i = -2; i <= 2; i++) {
    box(g, 0.05, 0.56, 0.05, mats.wood, i * 0.23, 0.41, 0.72);
  }
  const stair = box(g, 0.88, 0.3, 0.34, mats.pale, 0, 0.34, 1.12);
  stair.rotation.x = -0.16;
  return g;
}

function createCitadel() {
  const g = new THREE.Group();
  box(g, 4.5, 0.14, 3.5, mats.stone, 0, 0.18, 0);
  box(g, 3.9, 1.68, 0.56, material(0x8c7055), 0, 0.32, -1.22);
  box(g, 0.76, 1.55, 1.2, mats.stone, -1.44, 0.32, -0.7);
  box(g, 0.76, 1.55, 1.2, mats.stone, 1.44, 0.32, -0.7);
  box(g, 1.38, 0.78, 0.18, mats.ink, 0, 0.32, -0.91);
  const arch = new THREE.Mesh(new THREE.TorusGeometry(0.65, 0.1, 8, 28, Math.PI), mats.stone);
  arch.position.set(0, 1.08, -0.9);
  arch.rotation.z = Math.PI;
  g.add(arch);
  box(g, 1.05, 0.16, 1.04, mats.stone, 0, 1.92, -0.72);
  box(g, 1.35, 0.14, 1.28, mats.wood, 0, 2.08, -0.72);
  roof(g, 1.88, 1.72, 0.56, mats.tile, 0, 2.19, -0.72, 0.42);
  for (let i = -2; i <= 2; i++) {
    box(g, 0.32, 0.12, 0.5, mats.gold, i * 0.59, 0.82, 1.02);
  }
  cylinder(g, 0.025, 0.03, 1.3, mats.gold, 0, 2.9, -0.72, 8);
  const flag = new THREE.Mesh(new THREE.PlaneGeometry(0.48, 0.31), material(0xa5362c));
  flag.position.set(0.24, 3.42, -0.72);
  g.add(flag);
  return g;
}

function createLake() {
  const g = new THREE.Group();
  const water = new THREE.Mesh(new THREE.CylinderGeometry(2.35, 2.35, 0.04, 64), material(0x3d605b, 0.25, 0.24));
  water.rotation.x = 0;
  water.position.set(0, 0.33, 0);
  water.receiveShadow = true;
  g.add(water);
  const island = new THREE.Mesh(new THREE.CylinderGeometry(0.85, 1.0, 0.32, 36), mats.green);
  island.position.set(0, 0.46, 0);
  island.castShadow = true;
  island.receiveShadow = true;
  g.add(island);
  box(g, 1.05, 0.13, 0.92, mats.pale, 0, 0.62, 0);
  box(g, 0.86, 0.68, 0.72, material(0xc8b58a), 0, 0.75, 0);
  box(g, 0.93, 0.13, 0.82, mats.wood, 0, 1.41, 0);
  roof(g, 1.34, 1.2, 0.44, mats.tile, 0, 1.54, 0, 0.34);
  box(g, 0.64, 0.48, 0.54, mats.pale, 0, 1.97, 0);
  box(g, 0.72, 0.11, 0.62, mats.wood, 0, 2.43, 0);
  roof(g, 1.04, 0.92, 0.36, mats.tile, 0, 2.53, 0, 0.28);
  box(g, 0.42, 0.38, 0.36, mats.pale, 0, 2.89, 0);
  roof(g, 0.72, 0.68, 0.3, mats.tileLight, 0, 3.24, 0, 0.2);
  cylinder(g, 0.03, 0.04, 0.32, mats.gold, 0, 3.52, 0, 8);
  for (const x of [-0.9, 0.9]) {
    const trunk = cylinder(g, 0.035, 0.055, 0.72, mats.wood, x, 0.48, -0.3, 8);
    const crown = new THREE.Mesh(new THREE.IcosahedronGeometry(0.34, 1), mats.green);
    crown.position.set(x, 1.17, -0.3);
    crown.castShadow = true;
    g.add(crown);
  }
  return g;
}

const builders = [createBatTrang, createMaMay, createOldQuarter, createMausoleum, createTemple, createCitadel, createLake];
const modelScales = [1.48, 1.26, 1.3, 1.18, 1.27, 1.2, 1.34];
let activeIndex = 0;
let yaw = THREE.MathUtils.degToRad(-28);
let targetYaw = yaw;
let targetPitch = 0;
let dragging = false;
let lastX = 0;
let lastY = 0;
let introScale = 0.84;
let currentBuilding = builders[0]();
currentBuilding.scale.setScalar(modelScales[0] * introScale);
building.add(currentBuilding);

const title = document.getElementById("scene-title");
const subtitle = document.getElementById("scene-subtitle");
const era = document.getElementById("scene-era");
const number = document.getElementById("scene-number");
const rotation = document.getElementById("scene-rotation");
const fallback = stage.querySelector(".scene-fallback");

function setSpot(index) {
  if (index < 0 || index >= spots.length || index === activeIndex) return;
  activeIndex = index;
  const spot = spots[index];
  if (title) title.textContent = spot.title;
  if (subtitle) subtitle.textContent = spot.sub;
  if (era) era.textContent = spot.era;
  if (number) number.textContent = String(index + 1).padStart(2, "0");
  document.querySelectorAll("[data-journey-select]").forEach((button) => {
    const active = button.dataset.journeySelect === spot.id;
    button.classList.toggle("is-active", active);
    if (active) button.setAttribute("aria-current", "step");
    else button.removeAttribute("aria-current");
  });
  document.querySelectorAll(".journey-card").forEach((card) => card.classList.toggle("is-active", card.id === spot.id));
  currentBuilding.traverse((node) => {
    if (node.isMesh) {
      node.geometry?.dispose();
      if (Array.isArray(node.material)) node.material.forEach((entry) => { if (!sharedMaterials.has(entry)) entry.dispose(); });
      else if (node.material && !sharedMaterials.has(node.material)) node.material.dispose();
    }
  });
  building.remove(currentBuilding);
  currentBuilding = builders[index]();
  currentBuilding.scale.setScalar(modelScales[index] * 0.84);
  building.add(currentBuilding);
  introScale = 0.84;
  targetYaw = THREE.MathUtils.degToRad(Number(rotation?.value || -28));
}

document.querySelectorAll("[data-journey-select]").forEach((button) => {
  button.addEventListener("click", () => {
    const card = document.getElementById(button.dataset.journeySelect);
    if (card) {
      setSpot(Number(card.dataset.sceneIndex));
      card.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  });
});

document.querySelectorAll(".journey-card__foot a").forEach((link) => {
  link.addEventListener("click", () => {
    const target = document.querySelector(link.getAttribute("href"));
    if (target?.dataset.sceneIndex) setSpot(Number(target.dataset.sceneIndex));
  });
});

if (rotation) {
  rotation.addEventListener("input", () => {
    targetYaw = THREE.MathUtils.degToRad(Number(rotation.value));
  });
}

canvas.addEventListener("pointerdown", (event) => {
  dragging = true;
  lastX = event.clientX;
  lastY = event.clientY;
  canvas.setPointerCapture(event.pointerId);
  canvas.classList.add("is-dragging");
});
canvas.addEventListener("pointermove", (event) => {
  if (!dragging) return;
  const dx = event.clientX - lastX;
  const dy = event.clientY - lastY;
  lastX = event.clientX;
  lastY = event.clientY;
  targetYaw += dx * 0.008;
  targetPitch = THREE.MathUtils.clamp(targetPitch + dy * 0.0026, -0.14, 0.2);
  if (rotation) rotation.value = String(Math.round(THREE.MathUtils.radToDeg(targetYaw)));
});
const endDrag = () => {
  dragging = false;
  canvas.classList.remove("is-dragging");
};
canvas.addEventListener("pointerup", endDrag);
canvas.addEventListener("pointercancel", endDrag);

function resize() {
  const bounds = stage.getBoundingClientRect();
  const width = Math.max(1, Math.round(bounds.width));
  const height = Math.max(1, Math.round(bounds.height));
  renderer.setSize(width, height, false);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
}
new ResizeObserver(resize).observe(stage);
resize();

const cards = Array.from(document.querySelectorAll(".journey-card"));
if (window.IntersectionObserver) {
  const cardObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) setSpot(Number(entry.target.dataset.sceneIndex));
    });
  }, { rootMargin: "-43% 0px -43% 0px", threshold: 0 });
  cards.forEach((card) => cardObserver.observe(card));
}

let previous = performance.now();
function animate(now) {
  requestAnimationFrame(animate);
  const dt = Math.min(0.04, (now - previous) / 1000);
  previous = now;
  yaw += (targetYaw - yaw) * Math.min(1, dt * 5.2);
  introScale += (1 - introScale) * Math.min(1, dt * 2.3);
  currentBuilding.rotation.y = yaw;
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const idlePitch = prefersReducedMotion ? 0 : Math.sin(now * 0.00042) * 0.018;
  currentBuilding.rotation.x += ((targetPitch || idlePitch) - currentBuilding.rotation.x) * Math.min(1, dt * 2);
  currentBuilding.scale.setScalar(modelScales[activeIndex] * introScale);
  world.position.y = prefersReducedMotion ? 0 : Math.sin(now * 0.00065) * 0.035;
  renderer.render(scene, camera);
}

stage.classList.add("is-webgl-ready");
if (fallback) fallback.remove();
requestAnimationFrame(animate);
