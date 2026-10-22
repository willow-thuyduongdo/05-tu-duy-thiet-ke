import * as maplibregl from "https://unpkg.com/maplibre-gl@6.14.0/dist/maplibre-gl.mjs";

/* ============================================================== content */
// Stops in walking-tour order. `face` = compass bearing the model front faces
// (taken from the OSM footprint orientation); cameras look at the front with
// bearing face + 180.
const STOPS = [
  {
    id: "bat-trang", short: "Gốm", title: "Làng gốm Bát Tràng", kicker: "Gia Lâm · bên sông Bắc Hưng Hải",
    text: "Làng nghề hơn 500 năm nay có Bảo tàng gốm Bát Tràng (1+1>2 Architects): bảy khối hình bàn xoay gốm lồng nhau, bậc thang như hẻm núi, ốp gạch đất, bê tông sợi và gốm mosaic, sân lễ hội lộ thiên dưới chân và vườn trên mái. Cách đó vài trăm mét, lò bầu cổ năm bầu nung vẫn đứng trong chợ gốm.",
    photo: "./assets/bat-trang.webp", alt: "Người thợ Bát Tràng bên những sản phẩm gốm mộc",
    gallery: [
      { src: "./assets/gallery/bat-trang-village.webp", alt: "Các quầy bày đồ gốm trong chợ Bát Tràng dưới bóng cây" },
      { src: "./assets/gallery/bat-trang-drive.webp", alt: "Khách trải nghiệm nặn gốm tại làng gốm Bát Tràng" },
    ],
    quote: { who: "Ca dao", text: "Ước gì anh lấy được nàng / Để anh mua gạch Bát Tràng về xây." },
    facts: ["7 khối bàn xoay", "4 tầng + vườn mái", "6.300 m² sàn", "lò bầu 5 bầu nung"], face: 180,
  },
  {
    id: "pho-co", short: "Phố", title: "36 phố phường", kicker: "Phố Cổ · Hoàn Kiếm",
    text: "Phố Cổ hình thành từ những phường nghề sát kinh thành. Tên phố giữ lại nghề xưa: Hàng Bạc, Hàng Đào, Hàng Mã, Hàng Thiếc. Trên bản đồ, các phố mang chữ “Hàng” được tô sáng.",
    photo: "./assets/pho-co.webp", alt: "Mái nhà, biển hiệu và dòng xe trên một con phố Hà Nội",
    gallery: [{ src: "./assets/gallery/pho-co-gia-ngu.webp", alt: "Phố Gia Ngư trong một buổi tối ở Hà Nội" }],
    quote: { who: "Ca dao", text: "Rủ nhau chơi khắp Long Thành / Ba mươi sáu phố rành rành chẳng sai." },
    facts: ["45 phố “Hàng” trên OSM", "phường nghề"], face: 0,
  },
  {
    id: "ma-may", short: "Nhà", title: "Nhà cổ 87 Mã Mây", kicker: "Nhà phố · cuối thế kỷ XIX",
    text: "Ngôi nhà mở ra theo chiều sâu: gian hàng phía trước, sân trong lấy sáng, nhà chính, rồi lớp sinh hoạt phía sau. Mặt tiền hẹp, nở hậu, kể cách sống và buôn bán của một gia đình phố thị.",
    photo: "./assets/ma-may.webp", alt: "Không gian gỗ trong ngôi nhà cổ số 87 Mã Mây",
    gallery: [
      { src: "./assets/gallery/ma-may-courtyard.webp", alt: "Sân trong nhà cổ 87 Mã Mây với mái ngói và hàng hiên gỗ" },
    ],
    quote: { who: "Người kể chuyện", text: "Mặt tiền chỉ năm mét, nhưng phải đi hết hai mươi tám mét mới tới gian sau." },
    facts: ["sâu 28 m", "mặt tiền 5 → 6 m", "157,6 m²"], face: 275,
  },
  {
    id: "ho-guom", short: "Hồ Gươm", title: "Tháp Rùa · Hồ Gươm", kicker: "Hồ Hoàn Kiếm · 1884–1886",
    text: "Hồ gắn với truyền thuyết vua Lê trả gươm báu cho Rùa Vàng. Tháp Rùa ba tầng cửa cuốn trên gò giữa hồ là khoảng lặng ở tâm thành phố.",
    photo: "./assets/ho-guom.webp", alt: "Tháp Rùa trên đảo nhỏ giữa Hồ Gươm",
    gallery: [
      { src: "./assets/gallery/ho-guom-turtle-tower.webp", alt: "Tháp Rùa trong nắng chiều bên Hồ Gươm" },
    ],
    quote: { who: "Truyền thuyết Hồ Gươm", text: "Rùa Vàng nổi lên giữa hồ: “Xin bệ hạ hoàn gươm lại cho Long Quân.”" },
    facts: ["cao 8,8 m", "tầng 1: 6,28 × 4,54 m", "3 tầng + vọng lâu"], face: 270,
  },
  {
    id: "van-mieu", short: "Văn Miếu", title: "Khuê Văn Các", kicker: "Văn Miếu · xây năm 1805",
    text: "Văn Miếu lập năm 1070, Quốc Tử Giám năm 1076. Khuê Văn Các đứng trên bốn trụ gạch, gác gỗ sơn son, bốn cửa tròn tỏa tia và tám mái — biểu tượng Thăng Long hiếu học.",
    photo: "./assets/van-mieu.webp", alt: "Khoảng sân và kiến trúc cổ tại Văn Miếu – Quốc Tử Giám",
    gallery: [
      { src: "./assets/gallery/van-mieu-khue-van-cac.webp", alt: "Khuê Văn Các tại Văn Miếu – Quốc Tử Giám" },
      { src: "./assets/gallery/van-mieu-drive.webp", alt: "Điện Đại Thành và đỉnh hương tại Văn Miếu – Quốc Tử Giám" },
    ],
    quote: { who: "Văn bia khoa 1442 · Thân Nhân Trung", text: "Hiền tài là nguyên khí của quốc gia." },
    facts: ["đế 6,8 m", "4 trụ 1 × 1 m", "8 mái"], face: 200,
  },
  {
    id: "hoang-thanh", short: "Thành", title: "Đoan Môn · Hoàng thành", kicker: "Kinh đô · UNESCO 2010",
    text: "Cổng chính phía nam của Cấm thành, mặt bằng chữ U, năm cửa vòm; cửa giữa dành cho vua. Công trình hiện còn do nhà Lê sơ dựng, tu bổ thời Nguyễn, trên nền Ngũ Môn Lâu thời Lý.",
    photo: "./assets/hoang-thanh.webp", alt: "Đoan Môn, cổng chính phía nam của Hoàng Thành Thăng Long",
    gallery: [{ src: "./assets/gallery/hoang-thanh-doan-mon.webp", alt: "Cổng Đoan Môn ở Hoàng thành Thăng Long" }],
    quote: { who: "Chiếu dời đô · 1010", text: "Xem khắp đất Việt ta, chỉ nơi này là thắng địa." },
    facts: ["dài 46,5 m", "cao ≈ 6 m", "5 cửa vòm"], face: 186,
  },
  {
    id: "lang-bac", short: "Ba Đình", title: "Lăng Chủ tịch Hồ Chí Minh", kicker: "Ba Đình · 1945 / 1975",
    text: "Quảng trường Ba Đình là nơi đọc Tuyên ngôn Độc lập ngày 2/9/1945. Lăng khánh thành năm 1975, ba lớp: bệ đá, thân hàng cột vuông, mái bậc; ốp đá granite xám.",
    photo: "./assets/lang-bac.webp", alt: "Lăng Chủ tịch Hồ Chí Minh tại quảng trường Ba Đình",
    gallery: [{ src: "./assets/gallery/lang-bac-mausoleum.webp", alt: "Lăng Chủ tịch Hồ Chí Minh nhìn từ góc thấp, bên lá cờ đỏ sao vàng" }],
    quote: { who: "Tuyên ngôn Độc lập · 2/9/1945", text: "Tất cả mọi người đều sinh ra có quyền bình đẳng." },
    facts: ["rộng 41,2 m", "cao 21,6 m", "3 lớp"], face: 101,
  },
];

/* ============================================================== helpers */
const $ = (sel) => document.querySelector(sel);
const clamp01 = (v) => Math.min(1, Math.max(0, v));
const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const travelProgress = (t) => ease(clamp01(t));
const smooth = (a, b, t) => { const x = clamp01((t - a) / (b - a)); return x * x * (3 - 2 * x); };
const lerp = (a, b, t) => a + (b - a) * t;
const wrap = (deg) => ((deg % 360) + 540) % 360 - 180;
const fmtKm = (m) => (m >= 1000 ? `${(m / 1000).toLocaleString("vi-VN", { maximumFractionDigits: 1 })} km` : `${Math.round(m / 10) * 10} m`);
const fmtMin = (s) => `${Math.max(1, Math.round(s / 60))} phút`;
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const PLAYBACK_DURATION_SECONDS = 600;
const escapeHtml = (v) => String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
const responsivePhotoSrc = (src) => window.innerWidth < 760 && src.endsWith(".webp") && !src.includes("/assets/clouds/") ? src.replace(/\.webp$/, ".mobile.webp") : src;
let startupProgress = 0;
let startupFailed = false;
let startupTimeoutId = 0;

function updateStartupLoader(value, message) {
  startupProgress = Math.max(startupProgress, Math.min(100, Math.max(0, value)));
  const progress = $(".startup-loader__progress");
  progress.setAttribute("aria-valuenow", String(Math.round(startupProgress)));
  $("#startup-progress").style.transform = `scaleX(${startupProgress / 100})`;
  $("#startup-percent").textContent = `${Math.round(startupProgress)}%`;
  if (message) $("#startup-status").textContent = message;
}

function setApplicationInert(inert) {
  for (const element of document.body.children) {
    if (element.id === "startup-loader" || element.tagName === "NOSCRIPT") continue;
    if (inert) element.setAttribute("inert", "");
    else element.removeAttribute("inert");
  }
}

function showStartupError(error) {
  if (startupFailed) return;
  startupFailed = true;
  window.clearTimeout(startupTimeoutId);
  console.error(error);
  document.body.classList.add("is-loading");
  document.body.setAttribute("aria-busy", "true");
  $("#startup-status").textContent = "Chưa thể mở hành trình.";
  $("#startup-error-message").textContent = "Kiểm tra kết nối mạng rồi tải lại trang.";
  $("#startup-error").hidden = false;
  $("#startup-retry").onclick = () => location.reload();
}

function waitForMapIdle(map, timeoutMs = 45000) {
  return new Promise((resolve, reject) => {
    const timer = window.setTimeout(() => {
      map.off("idle", onIdle);
      reject(new Error("Map did not become idle before startup timeout."));
    }, timeoutMs);
    const onIdle = () => {
      window.clearTimeout(timer);
      resolve();
    };
    map.once("idle", onIdle);
  });
}

function lerpCam(a, b, t) {
  return {
    center: [lerp(a.center[0], b.center[0], t), lerp(a.center[1], b.center[1], t)],
    zoom: lerp(a.zoom, b.zoom, t),
    pitch: lerp(a.pitch, b.pitch, t),
    bearing: a.bearing + wrap(b.bearing - a.bearing) * t,
  };
}
const C = (center, zoom, pitch, bearing) => ({ center, zoom, pitch, bearing });

function metres(a, b) {
  const dx = (b[0] - a[0]) * 111320 * Math.cos((a[1] * Math.PI) / 180);
  const dy = (b[1] - a[1]) * 110540;
  return Math.hypot(dx, dy);
}
function heading(a, b) {
  const dx = (b[0] - a[0]) * Math.cos((a[1] * Math.PI) / 180);
  return (Math.atan2(dx, b[1] - a[1]) * 180) / Math.PI;
}

function prepareLeg(feature) {
  const coords = feature.geometry.coordinates;
  const cum = [0];
  for (let i = 1; i < coords.length; i++) cum.push(cum[i - 1] + metres(coords[i - 1], coords[i]));
  const p = feature.properties;
  // Step boundaries in metres along the route, for the live navigation HUD.
  let acc = 0;
  const steps = p.steps.map((s) => { const start = acc; acc += s.distance; return { ...s, start }; });
  return { ...p, coords, cum, length: cum[cum.length - 1], steps };
}
function pointAt(leg, d) {
  const { coords, cum } = leg;
  const dist = Math.min(Math.max(d, 0), leg.length);
  let i = 1;
  while (i < cum.length - 1 && cum[i] < dist) i++;
  const t = (dist - cum[i - 1]) / Math.max(1e-6, cum[i] - cum[i - 1]);
  return [lerp(coords[i - 1][0], coords[i][0], t), lerp(coords[i - 1][1], coords[i][1], t)];
}
function sliceTo(leg, d) {
  const out = [];
  for (let i = 0; i < leg.coords.length && leg.cum[i] <= d; i++) out.push(leg.coords[i]);
  out.push(pointAt(leg, d));
  return out;
}

const TURN = { left: "trái", right: "phải", "slight left": "chếch trái", "slight right": "chếch phải", "sharp left": "gắt trái", "sharp right": "gắt phải", straight: "thẳng", uturn: "quay đầu" };
function stepText(s) {
  const mod = TURN[s.modifier] || "";
  const road = s.name ? ` vào ${s.name}` : "";
  switch (s.type) {
    case "depart": return `Xuất phát${s.name ? ` trên ${s.name}` : ""}`;
    case "arrive": return "Đến nơi";
    case "turn": case "end of road": case "fork": return mod === "thẳng" ? `Đi thẳng${road}` : `Rẽ ${mod}${road}`;
    case "continue": case "new name": return `Đi tiếp${s.name ? ` trên ${s.name}` : ""}`;
    case "roundabout": case "rotary": case "roundabout turn": return `Đi vòng xuyến${road}`;
    case "merge": case "on ramp": case "off ramp": return `Nhập làn${road}`;
    default: return mod ? `Đi ${mod}${road}` : `Đi tiếp${road}`;
  }
}
function routeStepIndex(steps, distance) {
  let low = 0, high = steps.length - 1;
  while (low < high) {
    const middle = Math.ceil((low + high) / 2);
    if (steps[middle].start <= distance) low = middle;
    else high = middle - 1;
  }
  return low;
}
const gmapsLink = (from, to, mode) =>
  `https://www.google.com/maps/dir/?api=1&origin=${from[1]},${from[0]}&destination=${to[1]},${to[0]}&travelmode=${mode === "driving" ? "driving" : "walking"}`;

/* ============================================================== shots */
// Classic camera moves expressed as map cameras. Each shot maps local t (0–1,
// driven by scroll) to { center, zoom, pitch, bearing }.
function heroShots(stop) {
  const c = stop.lonlat;
  const f = (stop.face + 180) % 360; // camera bearing looking at the facade
  switch (stop.id) {
    case "bat-trang": {
      const kiln = stop.kiln || c;
      return [
        { tech: "CRANE DOWN", lens: "35mm", note: "Hạ cần cẩu xuống bảy khối bàn xoay của bảo tàng gốm.", len: 1.1, fx: { letterbox: 1 }, cam: (t) => lerpCam(C(c, 16.6, 56, f - 30), C(c, 18.4, 62, f - 15), ease(t)) },
        { tech: "ORBIT 180° · ROOF GARDEN", lens: "24mm", note: "Vòng quanh các tầng bậc, vườn mái và giếng trời.", len: 1.5, fx: { letterbox: 1 }, cam: (t) => C(c, 18.5 + 0.3 * Math.sin(Math.PI * t), 64 + 8 * t, f - 15 + 180 * ease(t)) },
        { tech: "TRUCKING · VILLAGE STREET", lens: "35mm", note: "Máy chạy ngang dọc đường làng tới chợ gốm.", len: 1.2, fx: {}, cam: (t) => lerpCam(C(c, 18.2, 66, f + 165), C(kiln, 18.6, 70, 230), ease(t)) },
        { tech: "PUSH-IN · LÒ BẦU CỔ", lens: "50mm", note: "Đẩy máy sát năm bầu nung còn khói.", len: 1, fx: { letterbox: 1 }, cam: (t) => lerpCam(C(kiln, 18.6, 70, 230), C(kiln, 20.1, 72, 150), ease(t)) },
      ];
    }
    case "ma-may": return [
      { tech: "TILT-SHIFT · MINIATURE", lens: "90mm TS", note: "Làm mờ hai dải trên dưới, biến dãy phố thành sa bàn.", len: 1.1, fx: { tilt: 1 }, cam: (t) => lerpCam(C(c, 19.6, 50, f + 25), C(c, 20.2, 56, f - 10), ease(t)) },
      { tech: "STEADICAM · ORBIT", lens: "24mm", note: "Đi vòng qua mặt phố để thấy chiều sâu 28 m.", len: 1.2, fx: {}, cam: (t) => C(c, 20.4, 66 + 6 * t, f - 10 + 110 * ease(t)) },
    ];
    case "pho-co": {
      const a = [c[0], c[1] - 0.0007], b = [c[0], c[1] + 0.0006];
      return [
        { tech: "STEADICAM · STREET LEVEL", lens: "24mm", note: "Máy đi bộ ngang tầm mắt dọc phố Tạ Hiện.", len: 1.2, fx: { letterbox: 1 }, cam: (t) => lerpCam(C(a, 18.7, 80, 0), C(b, 18.9, 80, 12), ease(t)) },
        { tech: "WHIP PAN", lens: "24mm", note: "Quét máy thật nhanh sang ngang, nhòe chuyển động.", len: 0.45, fx: { whip: 1, letterbox: 1 }, cam: (t) => C(b, 18.9, 80, 12 + 95 * ease(t)) },
        { tech: "TOP SHOT · 36 PHỐ PHƯỜNG", lens: "35mm", note: "Cẩu lên góc cao để thấy mạng phố nghề và chiều cao mái nhà.", len: 1.2, fx: { streets: 1 }, cam: (t) => lerpCam(C(b, 18.9, 80, 107), C(c, 16.4, 48, 0), ease(t)) },
      ];
    }
    case "hoang-thanh": return [
      { tech: "LOW ANGLE · DUTCH TILT", lens: "28mm", note: "Góc thấp, nghiêng khung hình để cổng thành thêm uy nghi.", len: 1.1, fx: { dutch: -6, letterbox: 1 }, cam: (t) => lerpCam(C(c, 18.2, 78, f - 15), C(c, 19.0, 76, f), ease(t)) },
      { tech: "WHIP PAN", lens: "28mm", note: "Quét máy sang cánh tả của chữ U.", len: 0.45, fx: { whip: 1, letterbox: 1 }, cam: (t) => C(c, 19.0, 74, f + 90 * ease(t)) },
      { tech: "ARC SHOT", lens: "35mm", note: "Vòng cung chậm lên vọng lâu.", len: 1.1, fx: { letterbox: 1 }, cam: (t) => C(c, 19.1, 68, f + 90 + 100 * ease(t)) },
    ];
    case "lang-bac": return [
      { tech: "ONE-POINT SYMMETRY · DOLLY IN", lens: "50mm", note: "Khung đối xứng một điểm tụ, máy đẩy thẳng theo trục.", len: 1.3, fx: { letterbox: 1 }, cam: (t) => lerpCam(C(c, 16.6, 66, f), C(c, 18.2, 70, f), ease(t)) },
      { tech: "CRANE UP · REVEAL", lens: "24mm", note: "Cẩu lên cao để lộ quảng trường Ba Đình.", len: 1.1, fx: {}, cam: (t) => lerpCam(C(c, 18.2, 70, f), C([c[0] + 0.0012, c[1]], 16.7, 22, f + 15), ease(t)) },
    ];
    case "van-mieu": return [
      { tech: "GOD'S EYE · TOP-DOWN", lens: "35mm", note: "Nhìn thẳng từ trên xuống, xoay chậm trục Văn Miếu.", len: 1.1, fx: {}, cam: (t) => lerpCam(C(c, 19.2, 0, f - 80), C(c, 20.2, 0, f), ease(t)) },
      { tech: "TILT DOWN · HERO", lens: "50mm", note: "Nghiêng máy từ đỉnh xuống ngang Khuê Văn Các.", len: 1.1, fx: { letterbox: 1 }, cam: (t) => lerpCam(C(c, 20.2, 0, f), C(c, 20.7, 72, f), ease(t)) },
      { tech: "ORBIT 120°", lens: "35mm", note: "Chạy vòng quanh bốn cửa tròn.", len: 1.1, fx: { letterbox: 1 }, cam: (t) => C(c, 20.7, 72, f + 120 * ease(t)) },
    ];
    case "ho-guom": return [
      { tech: "ARC SHOT · TELEPHOTO", lens: "85mm", note: "Ống dài, nén hậu cảnh, vòng quanh Tháp Rùa.", len: 1.3, fx: { letterbox: 1 }, cam: (t) => C(c, 19.5, 64, f - 30 + 140 * ease(t)) },
      { tech: "PULL-BACK REVEAL", lens: "24mm", note: "Kéo lùi và cẩu lên: cả mặt hồ và thành phố.", len: 1.3, fx: { letterbox: 1 }, cam: (t) => lerpCam(C(c, 19.5, 64, f + 110), C(c, 15.4, 52, f + 140), ease(t)) },
    ];
    default: return [];
  }
}

function buildShots(legs) {
  const city = C([105.858, 21.024], 11.3, 0, 0);
  const cityTilt = C([105.878, 21.012], 12.2, 42, -18);
  const shots = [];
  shots.push({ chapter: -1, tech: "AERIAL ESTABLISHING", lens: "24mm", note: "Máy bay cao, vén mây để lộ toàn thành phố.", len: 1.6, fx: {}, cam: (t) => lerpCam(city, cityTilt, ease(smooth(0.35, 1, t))), cover: (t) => (t < 0.32 ? lerp(0.55, 1, smooth(0, 0.3, t)) : 1 - smooth(0.36, 0.82, t)) });
  STOPS.forEach((stop, i) => {
    if (i === 0) {
      const approach = C(stop.lonlat, 16.6, 56, (stop.face + 150) % 360);
      shots.push({ chapter: 0, tech: "DRONE PUSH-IN", lens: "35mm", note: "Đẩy máy từ trời cao xuống làng gốm ven sông.", len: 1.4, fx: {}, cam: (t) => lerpCam(cityTilt, approach, ease(t)) });
    } else {
      const leg = legs[i - 1];
      const long = leg.length > 5000;
      // Chase cam: low and close behind the car; the 13 km leg flies higher.
      const zoom = long ? 18.4 : 20.9;
      const look = long ? 120 : 30;
      shots.push({
        chapter: i, leg, tech: long ? "AERIAL CHASE" : "CHASE CAM · TRACKING", lens: long ? "35mm" : "24mm",
        note: `Máy bám theo xe trên lộ trình thật, ${fmtKm(leg.distance_m)}.`,
        len: long ? 5.5 : leg.length > 900 ? 3 : 2, fx: { route: 1 },
        cam: (t) => {
          const d = travelProgress(t) * leg.length;
          const here = pointAt(leg, d);
          return C(here, zoom, long ? 66 : 74, heading(here, pointAt(leg, d + look)));
        },
        cover: (t) => smooth(0.84, 1, t),
      });
    }
    heroShots(stop).forEach((s, k) => {
      shots.push({ chapter: i, ...s, cover: k === 0 && i > 0 ? (t) => 1 - smooth(0, 0.28, t) : null });
    });
  });
  const last = STOPS[STOPS.length - 1];
  const lastEnd = C(last.lonlat, 15.4, 52, (last.face + 320) % 360);
  const totalKm = fmtKm(legs.reduce((sum, leg) => sum + leg.distance_m, 0));
  shots.push({ chapter: 7, tech: "FINAL WIDE · TOÀN TUYẾN", lens: "24mm", note: `Toàn bộ lộ trình ${totalKm} hiện trên bản đồ.`, len: 1.6, fx: { route: 1, letterbox: 1 }, cam: (t) => lerpCam(lastEnd, C([105.875, 21.012], 12.3, 36, -12), ease(t)) });
  let at = 0;
  shots.forEach((s, i) => { s.index = i; s.start = at; at += s.len; });
  return { shots, total: at };
}

/* ============================================================== map style */
const OLD_QUARTER_BOUNDS = {
  type: "Polygon",
  coordinates: [[[105.8455, 21.03], [105.856, 21.03], [105.856, 21.0395], [105.8455, 21.0395], [105.8455, 21.03]]],
};

function addCityLayers(map, data) {
  const style = map.getStyle();
  const firstSymbol = style.layers.find((l) => l.type === "symbol")?.id;
  const renderHeight = ["to-number", ["get", "render_height"], 0];
  const taggedHeight = ["to-number", ["get", "height"], 0];
  const levels = ["to-number", ["get", "building:levels"], 0];
  const osmId = ["abs", ["to-number", ["id"], 0]];
  const ordinaryHeight = ["+", 8, ["floor", ["*", 15, ["/", ["%", ["*", osmId, 37], 101], 101]]]];
  const tallBuildingHeight = ["+", 20, ["*", ["%", osmId, 15], 1.5]];
  const estimatedHeight = ["case",
    [">", renderHeight, 0], renderHeight,
    [">", taggedHeight, 0], taggedHeight,
    [">", levels, 0], ["*", levels, 3.2],
    ["in", ["get", "building"], ["literal", ["apartments", "office", "hotel", "university", "hospital"]]], tallBuildingHeight,
    ordinaryHeight,
  ];
  const quarterHeight = ["case",
    [">", ["to-number", ["get", "height"], 0], 0], ["to-number", ["get", "height"], 0],
    [">", ["to-number", ["get", "building:levels"], 0], 0], ["*", ["to-number", ["get", "building:levels"], 0], 3.2],
    ["+", 8, ["floor", ["*", 15, ["/", ["%", ["*", ["abs", ["to-number", ["id"], 0]], 37], 101], 101]]]],
  ];
  // Warm the light basemap: paper land, jade water, soft parks.
  for (const l of style.layers) {
    if (l.id === "background") map.setPaintProperty(l.id, "background-color", "#f3efe6");
    if (l.type === "fill" && /water/.test(l.id)) map.setPaintProperty(l.id, "fill-color", "#a9c9c4");
    if (l.type === "fill" && /park|wood|grass|landcover/.test(l.id)) map.setPaintProperty(l.id, "fill-color", "#dfe6cf");
  }
  map.addLayer({
    id: "city-3d",
    type: "fill-extrusion",
    source: "openmaptiles",
    "source-layer": "building",
    minzoom: 12,
    filter: ["all", ["!", ["within", OLD_QUARTER_BOUNDS]], ["!", ["in", ["id"], ["literal", []]]]],
    paint: {
      "fill-extrusion-color": ["interpolate", ["linear"], estimatedHeight, 0, "#e7e1d5", 20, "#ddd5c6", 60, "#cfc6b4"],
      "fill-extrusion-height": estimatedHeight,
      "fill-extrusion-base": ["coalesce", ["get", "render_min_height"], 0],
      "fill-extrusion-opacity": 0.95,
      "fill-extrusion-vertical-gradient": true,
    },
  }, firstSymbol);
  map.addSource("old-quarter-buildings", { type: "geojson", data: { type: "FeatureCollection", features: [] } });
  map.addLayer({
    id: "old-quarter-buildings-3d",
    type: "fill-extrusion",
    source: "old-quarter-buildings",
    minzoom: 14,
    paint: {
      "fill-extrusion-color": ["interpolate", ["linear"], quarterHeight, 0, "#e7e1d5", 20, "#ddd5c6", 60, "#cfc6b4"],
      "fill-extrusion-height": quarterHeight,
      "fill-extrusion-base": ["to-number", ["get", "min_height"], 0],
      "fill-extrusion-opacity": 0.98,
      "fill-extrusion-vertical-gradient": true,
    },
  }, firstSymbol);
  map.addSource("old-quarter", { type: "geojson", data: data.streets });
  map.addLayer({ id: "old-quarter-glow", type: "line", source: "old-quarter", layout: { "line-cap": "round", "line-join": "round" }, paint: { "line-color": "#e0a23a", "line-width": 10, "line-blur": 8, "line-opacity": 0 } });
  map.addLayer({ id: "old-quarter-line", type: "line", source: "old-quarter", layout: { "line-cap": "round", "line-join": "round" }, paint: { "line-color": "#b36b12", "line-width": 2.4, "line-opacity": 0 } });
  map.addLayer({
    id: "old-quarter-label", type: "symbol", source: "old-quarter",
    layout: { "symbol-placement": "line", "text-field": ["get", "name"], "text-font": ["Noto Sans Regular"], "text-size": 12, "text-letter-spacing": 0.04 },
    paint: { "text-color": "#6b3c06", "text-halo-color": "#fbf8f1", "text-halo-width": 1.8, "text-opacity": 0 },
  });
  map.addSource("routes", { type: "geojson", data: data.routes, lineMetrics: true });
  map.addLayer({ id: "route-glow", type: "line", source: "routes", layout: { "line-cap": "round", "line-join": "round" }, paint: { "line-color": "#e0a23a", "line-width": ["interpolate", ["linear"], ["zoom"], 11, 4, 18, 18], "line-blur": 10, "line-opacity": 0.3 } });
  map.addLayer({ id: "route-line", type: "line", source: "routes", layout: { "line-cap": "round", "line-join": "round" }, paint: { "line-color": "#c27a14", "line-width": ["interpolate", ["linear"], ["zoom"], 11, 1.4, 18, 4], "line-dasharray": [1.2, 1.6], "line-opacity": 0.85 } });
  map.addSource("route-progress", { type: "geojson", data: { type: "Feature", geometry: { type: "LineString", coordinates: [] } } });
  map.addLayer({ id: "route-progress", type: "line", source: "route-progress", layout: { "line-cap": "round", "line-join": "round" }, paint: { "line-color": "#b0420f", "line-width": ["interpolate", ["linear"], ["zoom"], 11, 3, 18, 7] } });
}

/* ============================================================== UI */
function renderStory(legs) {
  const story = $("#story");
  story.innerHTML = STOPS.map((s, i) => {
    const photos = [{ src: s.photo, alt: s.alt }, ...(s.gallery || [])];
    const leg = legs[i - 1];
    const from = STOPS[i - 1];
    const nextStop = STOPS[i + 1];
    const driveButton = nextStop ? `<button class="card__next" type="button" data-drive-next="${i}" aria-label="Tự lái đến ${escapeHtml(nextStop.title)}"><span class="card__next-icon" aria-hidden="true">↗</span><span>Lái đến ${escapeHtml(nextStop.short)}</span><span class="card__next-arrow" aria-hidden="true">→</span></button>` : "";
    const directions = leg ? `
      <details class="directions">
        <summary><span>Đường từ ${escapeHtml(from.title)}</span><small>${fmtKm(leg.distance_m)} · ${leg.mode === "driving" ? "xe" : "đi bộ"} ${fmtMin(leg.duration_s)}</small></summary>
        <ol class="steps">${leg.steps.filter((st) => st.type !== "depart" || st.name).map((st) => `<li>${escapeHtml(stepText(st))} <span>${st.distance ? fmtKm(st.distance) : ""}</span></li>`).join("")}</ol>
        <a class="gmaps" href="${gmapsLink(from.lonlat, s.lonlat, leg.mode)}" target="_blank" rel="noreferrer">Mở chỉ đường trên Google Maps ↗</a>
      </details>` : `<p class="directions"><a class="gmaps" href="https://www.google.com/maps/search/?api=1&query=${s.lonlat[1]},${s.lonlat[0]}" target="_blank" rel="noreferrer">Mở vị trí trên Google Maps ↗</a></p>`;
    return `<article class="card" id="${s.id}" data-chapter="${i}" aria-labelledby="${s.id}-title">
      <div class="card__photo" data-photo-stage>
        <button class="card__photo-main" type="button" data-photo-view data-photo-chapter="${i}" aria-label="Phóng to ảnh: ${escapeHtml(s.title)}">
          <img class="card__image" id="${s.id}-photo" data-gallery-index="0" data-src="${photos[0].src}" alt="${escapeHtml(photos[0].alt)}" decoding="async">
          <span class="card__photo-hint">Nhấn để phóng to</span>
        </button>
        ${photos.length > 1 ? `<div class="photo-gallery-controls" role="group" aria-label="Ảnh ${escapeHtml(s.title)}">
          <span class="photo-gallery-count" data-gallery-count aria-live="polite">01 / ${String(photos.length).padStart(2, "0")}</span>
          <button class="photo-gallery-arrow" type="button" data-gallery-step="-1" aria-label="Ảnh trước tại ${escapeHtml(s.title)}" aria-controls="${s.id}-photo">‹</button>
          <button class="photo-gallery-arrow" type="button" data-gallery-step="1" aria-label="Ảnh tiếp theo tại ${escapeHtml(s.title)}" aria-controls="${s.id}-photo">›</button>
        </div>` : ""}
      </div>
      <div class="card__body">
        <p class="card__kicker">${escapeHtml(s.kicker)}</p>
        <h2 id="${s.id}-title">${escapeHtml(s.title)}</h2>
        <p>${escapeHtml(s.text)}</p>
        ${driveButton}
        <figure class="quote"><blockquote>${escapeHtml(s.quote.text)}</blockquote><figcaption>${escapeHtml(s.quote.who)}</figcaption></figure>
        <ul class="facts">${s.facts.map((f) => `<li>${escapeHtml(f)}</li>`).join("")}</ul>
        ${directions}
      </div>
    </article>`;
  }).join("");
}

function renderNav(shots, total) {
  const firstShot = STOPS.map((_, i) => shots.find((s) => s.chapter === i && !s.leg) || shots.find((s) => s.chapter === i));
  $("#chapters").innerHTML = STOPS.map((s, i) => `<li><button type="button" data-jump-shot="${firstShot[i].index}"><span>${String(i + 1).padStart(2, "0")}</span><i>${escapeHtml(s.short)}</i></button></li>`).join("");
  $("#timeline-marks").innerHTML = STOPS.map((s, i) => `<li style="left:${(firstShot[i].start / total) * 100}%"><button type="button" data-jump-shot="${firstShot[i].index}" aria-label="Đến ${escapeHtml(s.title)}">${String(i + 1).padStart(2, "0")}<i>${escapeHtml(s.short)}</i></button></li>`).join("");
}

function renderItinerary(legs) {
  $("#itinerary-legs").innerHTML = legs.map((leg, i) => {
    const a = STOPS[i], b = STOPS[i + 1];
    return `<li><h3>${String(i + 1).padStart(2, "0")} · ${escapeHtml(a.title)} → ${escapeHtml(b.title)}</h3>
      <span class="meta">${leg.mode === "driving" ? "XE" : "ĐI BỘ"} · ${fmtKm(leg.distance_m)} · ${fmtMin(leg.duration_s)}</span>
      <ol class="steps">${leg.steps.map((st) => `<li>${escapeHtml(stepText(st))} <span>${st.distance ? fmtKm(st.distance) : ""}</span></li>`).join("")}</ol>
      <a class="gmaps" href="${gmapsLink(a.lonlat, b.lonlat, leg.mode)}" target="_blank" rel="noreferrer">Mở trên Google Maps ↗</a></li>`;
  }).join("");
}

/* ============================================================== main */
async function main() {
  setApplicationInert(true);
  startupTimeoutId = window.setTimeout(() => showStartupError(new Error("Startup did not complete before timeout.")), 90000);
  updateStartupLoader(3, "Đang đọc dữ liệu hành trình…");
  const fetchJson = async (url) => {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`${url} returned ${response.status}`);
    return response.json();
  };
  const [sites, routes, streets, lake, driveGallery] = await Promise.all([
    ...["./data/sites.geojson?v=20261020h", "./data/routes.geojson?v=20261020h", "./data/old-quarter.geojson?v=20261020h", "./data/lake.geojson?v=20261020h"].map(fetchJson),
    fetchJson("./data/drive-gallery.json?v=20261022b"),
  ]);
  for (const stop of STOPS) stop.gallery = [...(stop.gallery || []), ...(driveGallery[stop.id] || [])];
  for (const f of sites.features) {
    if (f.properties.kind !== "anchor") continue;
    const stop = STOPS.find((s) => s.id === f.properties.id);
    if (stop) stop.lonlat = f.geometry.coordinates;
    if (f.properties.id === "bat-trang-kiln") STOPS[0].kiln = f.geometry.coordinates;
  }
  updateStartupLoader(12, "Dữ liệu hành trình đã sẵn sàng.");
  const legs = routes.features.map(prepareLeg);
  const { shots, total } = buildShots(legs);
  const doanMonRing = sites.features.find((f) => f.properties.id === "hoang-thanh" && f.properties.kind === "footprint")?.geometry.coordinates[0];
  const doanMonBounds = doanMonRing ? doanMonRing.reduce((bounds, point) => [
    Math.min(bounds[0], point[0]), Math.min(bounds[1], point[1]),
    Math.max(bounds[2], point[0]), Math.max(bounds[3], point[1]),
  ], [Infinity, Infinity, -Infinity, -Infinity]) : null;
  renderStory(legs);
  renderNav(shots, total);
  renderItinerary(legs);

  const track = $("#scroll-track");
  const unitPx = () => window.innerHeight * (window.innerWidth < 760 ? 0.9 : 1);
  const sizeTrack = () => { track.style.height = `${total * unitPx() + window.innerHeight}px`; };
  sizeTrack();
  const autoplayBtn = $("#autoplay-toggle");
  let autoplay = false;
  let autoplayProgress = 0;
  function setAutoplay(active) {
    autoplay = Boolean(active);
    if (shots[activeShot]?.leg) landmarks?.setVehicle({ animate: autoplay || Boolean(autoDriveFrame) });
    if (autoplay) {
      const progress = progressUnits();
      if (progress >= total - 0.01) {
        window.scrollTo(0, 0);
        autoplayProgress = 0;
      } else autoplayProgress = progress;
    }
    autoplayBtn.setAttribute("aria-pressed", String(autoplay));
    autoplayBtn.textContent = autoplay ? "Tạm dừng" : "Tự chạy";
    autoplayBtn.setAttribute("aria-label", autoplay ? "Tạm dừng hành trình tự chạy" : "Tự chạy hành trình");
    if (autoplay) scheduleCameraFrame();
  }

  const first = shots[0].cam(0);
  const map = new maplibregl.Map({
    container: "map",
    style: "https://tiles.openfreemap.org/styles/positron",
    center: first.center,
    zoom: first.zoom,
    pitch: first.pitch,
    bearing: first.bearing,
    maxPitch: 85,
    maxZoom: 22.5,
    attributionControl: false,
    canvasContextAttributes: { antialias: window.innerWidth >= 760 },
    pixelRatio: window.innerWidth < 760 ? Math.min(window.devicePixelRatio || 1, 2) : window.devicePixelRatio,
    fadeDuration: 0,
  });
  map.addControl(new maplibregl.AttributionControl({ compact: true }), "bottom-right");
  for (const h of ["scrollZoom", "dragPan", "dragRotate", "keyboard", "doubleClickZoom", "touchZoomRotate", "touchPitch", "boxZoom"]) map[h].disable();

  let landmarks = null;
  let landmarkLayerPromise = null;
  let oldQuarterBuildingsPromise = null;
  let activeBuildingChapter = -1;
  const baseBuildingFilters = [];
  const buildingClearanceMeters = new Map([[0, 42], [2, 50], [5, 42], [6, 46]]);
  const buildingClearanceAreas = new Map([...buildingClearanceMeters].map(([chapter, radius]) => {
    const [lng, lat] = STOPS[chapter].lonlat;
    const deltaLat = radius / 110540;
    const deltaLng = radius / (111320 * Math.cos((lat * Math.PI) / 180));
    const ring = Array.from({ length: 64 }, (_, index) => {
      const angle = (index / 64) * Math.PI * 2;
      return [lng + Math.cos(angle) * deltaLng, lat + Math.sin(angle) * deltaLat];
    });
    ring.push(ring[0]);
    return [chapter, {
      origin: [lng, lat],
      radius,
      bounds: [lng - deltaLng, lat - deltaLat, lng + deltaLng, lat + deltaLat],
      polygon: { type: "Polygon", coordinates: [ring] },
    }];
  }));
  const markers = STOPS.map((s, i) => {
    const el = document.createElement("button");
    el.type = "button";
    el.className = "stop-marker";
    el.innerHTML = `<b>${i + 1}</b><span>${escapeHtml(s.title)}</span>`;
    el.addEventListener("click", () => jumpToShot(shots.find((sh) => sh.chapter === i && !sh.leg).index));
    return new maplibregl.Marker({ element: el, anchor: "bottom", offset: [0, -6] }).setLngLat(s.lonlat).addTo(map);
  });

  // Sample points inside each landmark footprint; OSM building blocks that
  // contain one are hidden so the detailed model replaces them.
  const probeGroups = sites.features
    .filter((f) => f.properties.kind === "footprint")
    .map((f) => {
      const ring = f.geometry.coordinates[0].slice(0, -1);
      const cx = ring.reduce((a, p) => a + p[0], 0) / ring.length;
      const cy = ring.reduce((a, p) => a + p[1], 0) / ring.length;
      const bounds = ring.reduce((b, p) => [Math.min(b[0], p[0]), Math.min(b[1], p[1]), Math.max(b[2], p[0]), Math.max(b[3], p[1])], [Infinity, Infinity, -Infinity, -Infinity]);
      return { bounds, points: [[cx, cy], ...ring.map((p) => [lerp(p[0], cx, 0.3), lerp(p[1], cy, 0.3)])] };
    });
  const hiddenIds = new Set();
  const activeClearanceIds = new Set();
  const activeOldQuarterClearanceIds = new Set();
  const checkedLandmarkBuildings = new Set();
  const checkedClearanceBuildings = new Map([...buildingClearanceMeters.keys()].map((chapter) => [chapter, new Set()]));
  const matchedClearanceBuildings = new Map([...buildingClearanceMeters.keys()].map((chapter) => [chapter, new Set()]));
  const checkedOldQuarterClearanceBuildings = new Map([...buildingClearanceMeters.keys()].map((chapter) => [chapter, new Set()]));
  const matchedOldQuarterClearanceBuildings = new Map([...buildingClearanceMeters.keys()].map((chapter) => [chapter, new Set()]));
  const inside = (pt, ring) => {
    let c = false;
    for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
      const [xi, yi] = ring[i], [xj, yj] = ring[j];
      if ((yi > pt[1]) !== (yj > pt[1]) && pt[0] < ((xj - xi) * (pt[1] - yi)) / (yj - yi) + xi) c = !c;
    }
    return c;
  };
  const overlaps = (a, b) => a[0] <= b[2] && a[2] >= b[0] && a[1] <= b[3] && a[3] >= b[1];
  const pointInBounds = (pt, b) => pt[0] >= b[0] && pt[0] <= b[2] && pt[1] >= b[1] && pt[1] <= b[3];
  function featureRings(feature) {
    const g = feature.geometry;
    const sourceRings = g.type === "Polygon" ? [g.coordinates[0]] : g.type === "MultiPolygon" ? g.coordinates.map((p) => p[0]) : [];
    return sourceRings.map((ring) => ({
      ring,
      bounds: ring.reduce((b, p) => [Math.min(b[0], p[0]), Math.min(b[1], p[1]), Math.max(b[2], p[0]), Math.max(b[3], p[1])], [Infinity, Infinity, -Infinity, -Infinity]),
    }));
  }
  function featureKey(id, rings) {
    return `${id}:${rings.map(({ bounds }) => bounds.map((v) => v.toFixed(6)).join(",")).join(";")}`;
  }
  function matchesProbeGroup(rings, groups) {
    return groups.some((group) => rings.some(({ ring, bounds }) => overlaps(bounds, group.bounds)
      && group.points.some((pt) => pointInBounds(pt, bounds) && inside(pt, ring))));
  }
  function matchesClearance(rings, area) {
    const [lng, lat] = area.origin;
    const metersPerLng = 111320 * Math.cos((lat * Math.PI) / 180);
    const radiusSquared = area.radius * area.radius;
    return rings.some(({ ring, bounds }) => {
      if (!overlaps(bounds, area.bounds)) return false;
      if (inside(area.origin, ring)) return true;
      for (let i = 1; i < ring.length; i++) {
        const [x1Lng, y1Lat] = ring[i - 1];
        const [x2Lng, y2Lat] = ring[i];
        const x1 = (x1Lng - lng) * metersPerLng;
        const y1 = (y1Lat - lat) * 110540;
        const dx = (x2Lng - x1Lng) * metersPerLng;
        const dy = (y2Lat - y1Lat) * 110540;
        const lengthSquared = dx * dx + dy * dy;
        const t = lengthSquared ? Math.max(0, Math.min(1, -(x1 * dx + y1 * dy) / lengthSquared)) : 0;
        const x = x1 + t * dx;
        const y = y1 + t * dy;
        if (x * x + y * y <= radiusSquared) return true;
      }
      return false;
    });
  }
  function refreshHidden() {
    if (!map.getLayer("city-3d") || map.getZoom() < 14) return;
    let changed = false;
    const clearanceArea = buildingClearanceAreas.get(activeBuildingChapter);
    const checkedClearance = checkedClearanceBuildings.get(activeBuildingChapter);
    const matchedClearance = matchedClearanceBuildings.get(activeBuildingChapter);
    for (const f of map.querySourceFeatures("openmaptiles", { sourceLayer: "building" })) {
      if (f.id == null) continue;
      const rings = featureRings(f);
      const key = featureKey(f.id, rings);
      if (!checkedLandmarkBuildings.has(key)) {
        checkedLandmarkBuildings.add(key);
        if (matchesProbeGroup(rings, probeGroups)) {
          hiddenIds.add(f.id);
          changed = true;
        }
      }
      if (clearanceArea && checkedClearance && !checkedClearance.has(key)) {
        checkedClearance.add(key);
        if (matchesClearance(rings, clearanceArea)) {
          matchedClearance.add(f.id);
          if (!activeClearanceIds.has(f.id)) {
            activeClearanceIds.add(f.id);
            changed = true;
          }
        }
      }
    }
    const checkedOldQuarter = checkedOldQuarterClearanceBuildings.get(activeBuildingChapter);
    const matchedOldQuarter = matchedOldQuarterClearanceBuildings.get(activeBuildingChapter);
    if (clearanceArea && checkedOldQuarter && map.getSource("old-quarter-buildings")) {
      for (const f of map.querySourceFeatures("old-quarter-buildings")) {
        if (f.id == null) continue;
        const rings = featureRings(f);
        const key = featureKey(f.id, rings);
        if (checkedOldQuarter.has(key)) continue;
        checkedOldQuarter.add(key);
        if (matchesClearance(rings, clearanceArea)) {
          matchedOldQuarter.add(f.id);
          if (!activeOldQuarterClearanceIds.has(f.id)) {
            activeOldQuarterClearanceIds.add(f.id);
            changed = true;
          }
        }
      }
    }
    if (changed) updateCityBuildingVisibility();
  }

  function updateCityBuildingVisibility() {
    const area = buildingClearanceAreas.get(activeBuildingChapter);
    const localExclusion = area ? [["!", ["within", area.polygon]]] : [];
    const hiddenBuildingIds = ["!", ["in", ["id"], ["literal", [...hiddenIds, ...activeClearanceIds]]]];
    const hideDoanMonNeighbors = activeBuildingChapter === 5;
    if (map.getLayer("city-3d")) {
      map.setFilter("city-3d", ["all",
        ["!", ["within", OLD_QUARTER_BOUNDS]],
        hiddenBuildingIds,
        ...localExclusion,
      ]);
      map.setLayoutProperty("city-3d", "visibility", hideDoanMonNeighbors ? "none" : "visible");
    }
    for (const entry of baseBuildingFilters) {
      map.setFilter(entry.id, ["all", ...(entry.filter ? [entry.filter] : []), hiddenBuildingIds, ...localExclusion]);
      map.setLayoutProperty(entry.id, "visibility", hideDoanMonNeighbors && entry.type === "fill-extrusion" ? "none" : entry.visibility);
    }
    if (map.getLayer("old-quarter-buildings-3d")) {
      const hiddenOldQuarterIds = ["!", ["in", ["id"], ["literal", [...activeOldQuarterClearanceIds]]]];
      map.setFilter("old-quarter-buildings-3d", area ? ["all", hiddenOldQuarterIds, ...localExclusion] : null);
      map.setLayoutProperty("old-quarter-buildings-3d", "visibility", hideDoanMonNeighbors ? "none" : "visible");
    }
  }

  let oldQuarterBuildingsApplied = false;
  function loadOldQuarterBuildings({ apply = true } = {}) {
    if (!oldQuarterBuildingsPromise) {
      oldQuarterBuildingsPromise = fetchJson("./data/old-quarter-buildings.geojson?v=20261021p")
        .catch((error) => {
          oldQuarterBuildingsPromise = null;
          throw error;
        });
    }
    return oldQuarterBuildingsPromise.then((buildings) => {
      if (apply && !oldQuarterBuildingsApplied && map.getSource("old-quarter-buildings")) {
        map.getSource("old-quarter-buildings").setData(buildings);
        oldQuarterBuildingsApplied = true;
      }
      return buildings;
    });
  }

  function loadLandmarkLayer() {
    if (landmarks) return Promise.resolve(landmarks);
    if (!landmarkLayerPromise) {
      landmarkLayerPromise = import("./landmarks.js?v=20261022b").then(({ createLandmarkLayer }) => {
        const landmarkSites = STOPS.filter((s) => s.id !== "pho-co").map((s) => ({ id: s.id, lonlat: s.lonlat, bearing: s.face }));
        if (STOPS[0].kiln) landmarkSites.push({ id: "bat-trang-kiln", lonlat: STOPS[0].kiln, bearing: 180 });
        const layer = createLandmarkLayer(maplibregl, landmarkSites, { lake: lake.features[0], carUrl: "./assets/models/ferrari.glb" });
        map.addLayer(layer);
        landmarks = layer;
        applyShot(progressUnits());
        scheduleCameraFrame();
        return landmarks;
      }).catch((error) => {
        landmarkLayerPromise = null;
        console.warn("3D landmark layer failed to load:", error.message);
        return null;
      });
    }
    return landmarkLayerPromise;
  }

  const loadDeferredImages = (selector) => {
    document.querySelectorAll(`${selector}[data-src]`).forEach((image) => {
      image.src = responsivePhotoSrc(image.dataset.src);
      image.removeAttribute("data-src");
    });
  };
  let introPhotosStarted = false;
  let cloudsStarted = false;
  function loadIntroPhotos() {
    if (introPhotosStarted) return;
    introPhotosStarted = true;
    loadDeferredImages(reduceMotion ? ".backdrop img:first-child" : ".backdrop img");
  }
  function loadCloudPhotos() {
    if (cloudsStarted || reduceMotion) return;
    cloudsStarted = true;
    loadDeferredImages(".clouds img");
  }

  function preloadImage(src) {
    return new Promise((resolve) => {
      const image = new Image();
      let settled = false;
      const finish = (loaded) => {
        if (settled) return;
        settled = true;
        image.onload = null;
        image.onerror = null;
        resolve(loaded);
      };
      const decode = () => {
        if (!image.naturalWidth) return finish(false);
        if (typeof image.decode !== "function") return finish(true);
        image.decode().then(() => finish(true), () => finish(false));
      };
      image.decoding = "async";
      image.fetchPriority = "low";
      image.onload = decode;
      image.onerror = () => finish(false);
      image.src = responsivePhotoSrc(src);
      if (image.complete) decode();
    });
  }

  async function preloadStartupPhotos() {
    const sources = new Set();
    const addSource = (src) => {
      if (!src) return;
      const url = new URL(src, location.href);
      url.pathname = url.pathname.replace(/\.mobile\.webp$/, ".webp");
      sources.add(url.href);
    };
    for (const stop of STOPS) {
      addSource(stop.photo);
      for (const photo of stop.gallery || []) addSource(photo.src);
    }
    for (const image of document.querySelectorAll(".backdrop img, .clouds img")) {
      if (reduceMotion && image.closest(".clouds")) continue;
      addSource(image.dataset.src || image.currentSrc || image.src);
    }
    const list = [...sources].filter(Boolean);
    let completed = 0;
    let next = 0;
    let failures = 0;
    const workers = Array.from({ length: Math.min(4, list.length) }, async () => {
      while (next < list.length) {
        const src = list[next++];
        if (!await preloadImage(src)) failures++;
        completed++;
        if (startupProgress < 65) {
          updateStartupLoader(12 + (48 * completed) / list.length, `Đang chuẩn bị ảnh ${completed}/${list.length}…`);
        }
      }
    });
    await Promise.all(workers);
    if (failures) throw new Error(`${failures} startup image(s) failed to load.`);
  }

  loadIntroPhotos();
  loadCloudPhotos();
  const startupPhotosPromise = preloadStartupPhotos();
  startupPhotosPromise.catch(() => {});
  const startupBuildingsPromise = loadOldQuarterBuildings({ apply: false });
  startupBuildingsPromise.catch(() => {});

  let mapLoaded = false;
  const mapLoadTimeout = window.setTimeout(() => {
    if (!mapLoaded && !startupFailed) showStartupError(new Error("Map style did not load before startup timeout."));
  }, 45000);
  map.on("load", async () => {
    if (startupFailed) return;
    mapLoaded = true;
    window.clearTimeout(mapLoadTimeout);
    try {
      for (const layer of map.getStyle().layers) {
        if (layer.source === "openmaptiles" && layer["source-layer"] === "building") {
          baseBuildingFilters.push({ id: layer.id, type: layer.type, visibility: layer.layout?.visibility ?? "visible", filter: layer.filter ?? null });
        }
      }
      addCityLayers(map, { streets, routes, lake: lake.features[0] });
      applyShot(progressUnits());
      try {
        map.setSky({ "sky-color": "#9fc3dd", "horizon-color": "#f4ead6", "fog-color": "#efe9de", "sky-horizon-blend": 0.55, "horizon-fog-blend": 0.7, "fog-ground-blend": 0.6, "atmosphere-blend": 0 });
      } catch (error) { console.warn("Sky unsupported:", error.message); }
      map.setLight({ anchor: "map", color: "#fff1d8", intensity: 0.35, position: [1.4, 210, 35] });
      updateStartupLoader(66, "Đang tải bản đồ và mô hình 3D…");
      const landmarkPromise = loadLandmarkLayer();
      const modelPromise = landmarkPromise.then((landmark) => {
        if (!landmark) throw new Error("The landmark layer failed to load.");
        return landmark.prepareAll?.((done, total) => {
          updateStartupLoader(68 + (18 * done) / Math.max(1, total), `Đang dựng mô hình ${done}/${total}…`);
        });
      });
      const vehiclePromise = landmarkPromise.then((landmark) => landmark?.preloadVehicle?.());
      const [landmark] = await Promise.all([
        landmarkPromise,
        modelPromise,
        vehiclePromise,
        startupPhotosPromise,
        startupBuildingsPromise,
        waitForMapIdle(map),
        document.fonts?.ready || Promise.resolve(),
      ]);
      if (startupFailed) return;
      if (!landmark) throw new Error("The landmark layer failed to load.");
      await preloadTourMapTiles();
      if (startupFailed) return;
      updateStartupLoader(94, "Đang hoàn tất bản đồ trình bày…");
      if (landmark.debug?.carReady === false) throw new Error("The presentation vehicle model failed to load.");
      if (startupFailed) return;
      updateStartupLoader(100, "Hành trình đã sẵn sàng.");
      await new Promise((resolve) => window.setTimeout(resolve, 240));
      if (startupFailed) return;
      window.clearTimeout(startupTimeoutId);
      setApplicationInert(false);
      document.body.classList.remove("is-loading");
      document.body.setAttribute("aria-busy", "false");
      setAutoplay(!reduceMotion);
    } catch (error) {
      showStartupError(error);
    }
  });
  // Animated layers keep repainting, so "idle" rarely fires: scan when tiles arrive.
  let hideTimer = 0;
  map.on("sourcedata", (e) => {
    if ((e.sourceId !== "openmaptiles" && e.sourceId !== "old-quarter-buildings") || hideTimer) return;
    hideTimer = setTimeout(() => { hideTimer = 0; refreshHidden(); }, 250);
  });
  map.on("idle", refreshHidden);
  map.on("zoom", () => map.getContainer().classList.toggle("is-close", map.getZoom() > 16.6));

  /* ---------- scroll → camera director ---------- */
  let explore = false;
  let current = { ...first };
  let target = { ...first };
  let activeShot = -1;
  let activeChapter = -2;
  let lastProgressKey = "";
  let lastOldQuarterOpacity = -1;
  const root = document.documentElement;
  const slate = $("#slate");
  const navHud = $("#nav-hud");
  const navMode = $("#nav-mode");
  const navTo = $("#nav-to");
  const navLeft = $("#nav-left");
  const navStep = $("#nav-step");
  const timecode = $("#timecode");
  const cards = [...document.querySelectorAll(".card")];
  const fill = $("#timeline-fill");
  const photoViewer = $("#photo-viewer");
  const photoViewerImage = $("#photo-viewer-image");
  const photoViewerCaption = $("#photo-viewer-caption");
  const photoViewerCredit = $("#photo-viewer-credit");
  const photoViewerCount = $("#photo-viewer-count");
  let lastPhotoTrigger = null;
  let currentViewerPhoto = null;
  const preloadedGalleryPhotos = new Map();

  function preloadGalleryPhoto(chapter, index = 0) {
    const stop = STOPS[chapter];
    if (!stop) return;
    const photos = [{ src: stop.photo, alt: stop.alt }, ...(stop.gallery || [])];
    const photo = photos[((index % photos.length) + photos.length) % photos.length];
    const src = responsivePhotoSrc(photo.src);
    if (preloadedGalleryPhotos.has(src)) return;
    const image = new Image();
    image.decoding = "async";
    image.fetchPriority = "low";
    image.src = src;
    preloadedGalleryPhotos.set(src, image);
  }

  function setGalleryPhoto(chapter, index) {
    const stop = STOPS[chapter];
    const photos = [{ src: stop.photo, alt: stop.alt }, ...(stop.gallery || [])];
    const normalized = ((index % photos.length) + photos.length) % photos.length;
    const photo = photos[normalized];
    const card = cards[chapter];
    const image = card.querySelector(".card__image");
    image.src = responsivePhotoSrc(photo.src);
    image.loading = "eager";
    image.fetchPriority = "high";
    image.removeAttribute("data-src");
    image.alt = photo.alt;
    image.dataset.galleryIndex = String(normalized);
    const count = card.querySelector("[data-gallery-count]");
    if (count) count.textContent = `${String(normalized + 1).padStart(2, "0")} / ${String(photos.length).padStart(2, "0")}`;
    return { photo, index: normalized, total: photos.length };
  }

  function updatePhotoViewer(chapter, index) {
    const current = setGalleryPhoto(chapter, index);
    currentViewerPhoto = { chapter, index: current.index };
    photoViewerImage.src = responsivePhotoSrc(current.photo.src);
    photoViewerImage.alt = current.photo.alt;
    photoViewerCaption.textContent = `${STOPS[chapter].title} · ${current.photo.alt}`;
    photoViewerCredit.replaceChildren();
    const source = current.photo.source;
    if (source && current.photo.author && current.photo.license && current.photo.licenseUrl) {
      const sourceLink = document.createElement("a");
      sourceLink.href = source;
      sourceLink.target = "_blank";
      sourceLink.rel = "noreferrer";
      sourceLink.textContent = `Ảnh: ${current.photo.author}`;
      const licenseLink = document.createElement("a");
      licenseLink.href = current.photo.licenseUrl;
      licenseLink.target = "_blank";
      licenseLink.rel = "noreferrer";
      licenseLink.textContent = current.photo.license;
      photoViewerCredit.append(sourceLink, document.createTextNode(" · "), licenseLink, document.createTextNode(" · Đã chuyển WebP và thu nhỏ"));
      photoViewerCredit.hidden = false;
    } else {
      photoViewerCredit.hidden = true;
    }
    photoViewerCount.textContent = `${String(current.index + 1).padStart(2, "0")} / ${String(current.total).padStart(2, "0")}`;
  }

  function openPhotoViewer(chapter, index, trigger) {
    lastPhotoTrigger = trigger;
    updatePhotoViewer(chapter, index);
    if (!photoViewer.open) photoViewer.showModal();
  }

  photoViewer.addEventListener("click", (event) => {
    if (event.target === photoViewer) photoViewer.close();
  });
  photoViewer.addEventListener("close", () => lastPhotoTrigger?.focus({ preventScroll: true }));

  function progressUnits() { return window.scrollY / unitPx(); }

  function shotAt(u) {
    let s = shots[shots.length - 1];
    for (const sh of shots) if (u < sh.start + sh.len) { s = sh; break; }
    return s;
  }

  function jumpToShot(index) {
    const s = shots[index];
    window.scrollTo({ top: (s.start + 0.02) * unitPx(), behavior: reduceMotion ? "auto" : "smooth" });
  }
  document.addEventListener("click", (e) => {
    const closePhoto = e.target.closest("[data-photo-close]");
    if (closePhoto) { photoViewer.close(); return; }
    const viewerStep = e.target.closest("[data-photo-step]");
    if (viewerStep && currentViewerPhoto) {
      setAutoplay(false);
      cancelAutoDrive();
      updatePhotoViewer(currentViewerPhoto.chapter, currentViewerPhoto.index + Number(viewerStep.dataset.photoStep));
      return;
    }
    const galleryButton = e.target.closest("[data-gallery-step]");
    if (galleryButton) {
      setAutoplay(false);
      cancelAutoDrive();
      const card = galleryButton.closest(".card");
      const chapter = Number(card.dataset.chapter);
      const image = card.querySelector(".card__image");
      const current = setGalleryPhoto(chapter, Number(image.dataset.galleryIndex) + Number(galleryButton.dataset.galleryStep));
      if (photoViewer.open && currentViewerPhoto?.chapter === chapter) updatePhotoViewer(chapter, current.index);
      return;
    }
    const driveButton = e.target.closest("[data-drive-next]");
    if (driveButton) {
      e.preventDefault();
      setAutoplay(false);
      startAutoDrive(Number(driveButton.dataset.driveNext), driveButton);
      return;
    }
    const photoTrigger = e.target.closest("[data-photo-view]");
    if (photoTrigger) {
      e.preventDefault();
      setAutoplay(false);
      cancelAutoDrive();
      const chapter = Number(photoTrigger.dataset.photoChapter);
      const index = Number(cards[chapter].querySelector(".card__image").dataset.galleryIndex);
      openPhotoViewer(chapter, index, photoTrigger);
      return;
    }
    const btn = e.target.closest("[data-jump-shot], [data-jump]");
    if (!btn) return;
    e.preventDefault();
    setAutoplay(false);
    cancelAutoDrive();
    jumpToShot(Number(btn.dataset.jumpShot ?? btn.dataset.jump ?? 0));
  });

  let autoDriveFrame = 0;
  function cancelAutoDrive() {
    if (autoDriveFrame) cancelAnimationFrame(autoDriveFrame);
    autoDriveFrame = 0;
    document.querySelectorAll("[data-drive-next]").forEach((button) => {
      button.disabled = false;
      button.classList.remove("is-driving");
      button.querySelector("span:nth-child(2)").textContent = `Lái đến ${STOPS[Number(button.dataset.driveNext) + 1]?.short || "điểm tiếp"}`;
    });
  }

  function startAutoDrive(chapter, button) {
    cancelAutoDrive();
    const destination = chapter + 1;
    const routeShot = shots.find((shot) => shot.leg && shot.chapter === destination);
    if (!routeShot) return;
    const arrivalShot = shots.find((shot) => shot.chapter === destination && !shot.leg);
    if (reduceMotion) { jumpToShot(arrivalShot.index); return; }
    const from = (routeShot.start + 0.005) * unitPx();
    const to = (arrivalShot.start + arrivalShot.len * 0.34) * unitPx();
    const duration = Math.min(90000, Math.max(16000, routeShot.leg.length / 180));
    let startedAt = 0;
    button.disabled = true;
    button.classList.add("is-driving");
    button.querySelector("span:nth-child(2)").textContent = `Đang đến ${STOPS[destination].short}…`;
    const driveFrame = (now) => {
      if (!startedAt) startedAt = now;
      const t = clamp01((now - startedAt) / duration);
      window.scrollTo({ top: lerp(from, to, t), left: 0, behavior: "instant" });
      applyShot(progressUnits());
      scheduleCameraFrame();
      if (t < 1) autoDriveFrame = requestAnimationFrame(driveFrame);
      else {
        autoDriveFrame = 0;
        window.scrollTo({ top: to, left: 0, behavior: "instant" });
        applyShot(progressUnits());
        button.disabled = false;
        button.classList.remove("is-driving");
        button.querySelector("span:nth-child(2)").textContent = `Lái đến ${STOPS[destination].short}`;
      }
    };
    autoDriveFrame = requestAnimationFrame(driveFrame);
  }

  window.addEventListener("wheel", cancelAutoDrive, { passive: true });
  window.addEventListener("touchstart", cancelAutoDrive, { passive: true });
  window.addEventListener("keydown", (event) => {
    if (["ArrowDown", "ArrowUp", "PageDown", "PageUp", "Home", "End", " "].includes(event.key)) cancelAutoDrive();
    if (photoViewer.open && ["ArrowLeft", "ArrowRight"].includes(event.key) && currentViewerPhoto) {
      event.preventDefault();
      const step = event.key === "ArrowRight" ? 1 : -1;
      updatePhotoViewer(currentViewerPhoto.chapter, currentViewerPhoto.index + step);
    }
  });

  function updateTimecode(u) {
    const seconds = (u / total) * PLAYBACK_DURATION_SECONDS;
    const f = Math.floor((seconds % 1) * 24);
    const s = Math.floor(seconds) % 60, m = Math.floor(seconds / 60) % 60;
    const value = `00:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}:${String(f).padStart(2, "0")}`;
    if (timecode.textContent !== value) timecode.textContent = value;
  }

  function applyShot(u) {
    const shot = shotAt(u);
    const t = clamp01((u - shot.start) / shot.len);
    target = shot.chapter === 5 && !shot.leg ? fitDoanMonCamera(shot.cam(t), shot) : shot.cam(t);
    if (shot.chapter >= 0 && !landmarks && map.getLayer("city-3d")) void loadLandmarkLayer();
    if (shot.chapter === 1 && map.getSource("old-quarter-buildings") && (!shot.leg || t >= 0.72)) void loadOldQuarterBuildings();
    const fx = shot.fx || {};
    const cover = reduceMotion ? 0 : shot.cover ? shot.cover(t) : 0;
    root.style.setProperty("--cover", cover.toFixed(3));
    document.body.classList.toggle("fx-clouds", cover > 0.001);
    if (cover > 0.001) loadCloudPhotos();
    document.body.classList.toggle("fx-intro", shot.index === 0 && t < 0.36);
    document.body.classList.toggle("fx-tilt-on", Boolean(fx.tilt));
    document.body.classList.toggle("fx-whip-on", Boolean(fx.whip) && !reduceMotion);
    root.style.setProperty("--letterbox", fx.letterbox ? "1" : "0");
    root.style.setProperty("--tilt", fx.tilt ? "1" : "0");
    root.style.setProperty("--whip", fx.whip && !reduceMotion ? String(Math.sin(Math.PI * t)) : "0");
    root.style.setProperty("--dutch", fx.dutch && !reduceMotion ? `${fx.dutch}deg` : "0deg");
    root.style.setProperty("--intro", String(shot.index === 0 ? 1 - smooth(0.18, 0.34, t) : 0));
    const outro = shot.chapter === 7 ? smooth(0.35, 0.9, t) : 0;
    root.style.setProperty("--outro", outro.toFixed(3));
    $("#credits").classList.toggle("is-active", outro > 0.5);
    slate.style.opacity = String(1 - outro);
    map.getContainer().classList.toggle("is-outro", outro > 0.2);
    $("#title-card").style.visibility = shot.index === 0 && t < 0.36 ? "visible" : "hidden";
    fill.style.transform = `scaleX(${clamp01(u / total)})`;
    updateTimecode(u);

    if (shot.index !== activeShot) {
      activeShot = shot.index;
      $("#slate-shot").textContent = `SHOT ${String(shot.index + 1).padStart(2, "0")}`;
      $("#slate-tech").textContent = shot.tech;
      $("#slate-lens").textContent = shot.lens;
      $("#slate-note").textContent = shot.note;
      slate.classList.remove("is-changing");
      void slate.offsetWidth;
      slate.classList.add("is-changing");
    }
    const buildingChapter = !shot.leg && buildingClearanceMeters.has(shot.chapter) ? shot.chapter : -1;
    if (buildingChapter !== activeBuildingChapter) {
      activeBuildingChapter = buildingChapter;
      activeClearanceIds.clear();
      activeOldQuarterClearanceIds.clear();
      for (const id of matchedClearanceBuildings.get(buildingChapter) || []) activeClearanceIds.add(id);
      for (const id of matchedOldQuarterClearanceBuildings.get(buildingChapter) || []) activeOldQuarterClearanceIds.add(id);
      updateCityBuildingVisibility();
      refreshHidden();
    }
    if (!shot.leg && shots[shot.index + 1]?.leg) landmarks?.preloadVehicle?.();

    // Story card: visible on hero shots of its chapter; photo clouds part on arrival.
    const heroChapter = shot.leg || shot.chapter < 0 || shot.chapter > 6 ? -1 : shot.chapter;
    if (heroChapter !== activeChapter) {
      activeChapter = heroChapter;
      cards.forEach((c) => c.classList.toggle("is-active", Number(c.dataset.chapter) === heroChapter));
      if (heroChapter >= 0) {
        setGalleryPhoto(heroChapter, 0);
        preloadGalleryPhoto(heroChapter + 1);
      }
      markers.forEach((m, i) => m.getElement().classList.toggle("is-active", i === heroChapter));
      document.querySelectorAll("[data-jump-shot]").forEach((b) => {
        const s = shots[Number(b.dataset.jumpShot)];
        if (s.chapter === shot.chapter) b.setAttribute("aria-current", "step");
        else b.removeAttribute("aria-current");
      });
    }
    if (heroChapter >= 0) {
      const firstHero = shots.find((s) => s.chapter === heroChapter && !s.leg);
      const open = reduceMotion ? 1 : smooth(0.05, 0.75, (u - firstHero.start) / firstHero.len);
      cards[heroChapter].style.setProperty("--open", open.toFixed(3));
    }

    // Live navigation HUD and drawn progress line during tracking shots.
    if (shot.leg) {
      const leg = shot.leg;
      const d = travelProgress(t) * leg.length;
      const stepIndex = routeStepIndex(leg.steps, d);
      const step = leg.steps[stepIndex] || leg.steps[0];
      const next = leg.steps[stepIndex + 1];
      if (navHud.hidden) navHud.hidden = false;
      const carAt = pointAt(leg, d);
      const zoomNow = map.getZoom();
      landmarks?.setVehicle({
        visible: true,
        lonlat: carAt,
        bearing: heading(carAt, pointAt(leg, d + 12)),
        distance: d,
        animate: autoplay || Boolean(autoDriveFrame),
        // Illustrative size boost on wide shots so the car stays readable.
        scale: Math.min(3, Math.max(1, Math.pow(2, 20 - zoomNow))),
      });
      const mode = leg.mode === "driving" ? "ĐANG DI CHUYỂN · XE" : "ĐANG ĐI BỘ";
      if (navMode.textContent !== mode) navMode.textContent = mode;
      const destination = `Đến ${STOPS[shot.chapter].title}`;
      if (navTo.textContent !== destination) navTo.textContent = destination;
      const left = leg.length - d;
      const remaining = `Còn ${fmtKm(left)} · ${fmtMin((left / leg.length) * leg.duration_s)}`;
      if (navLeft.textContent !== remaining) navLeft.textContent = remaining;
      const instruction = stepText(next && next.start - d < 120 ? next : step);
      if (navStep.textContent !== instruction) navStep.textContent = instruction;
      const progressStep = leg.length > 5000 ? (window.innerWidth < 760 ? 40 : 24) : 8;
      const key = `${shot.index}:${Math.floor(d / progressStep)}`;
      if (key !== lastProgressKey && map.getSource("route-progress")) {
        lastProgressKey = key;
        map.getSource("route-progress").setData({ type: "Feature", geometry: { type: "LineString", coordinates: sliceTo(leg, d) } });
      }
    } else {
      navHud.hidden = true;
      landmarks?.setVehicle({ visible: false });
      if (lastProgressKey && map.getSource("route-progress")) {
        lastProgressKey = "";
        map.getSource("route-progress").setData({ type: "Feature", geometry: { type: "LineString", coordinates: [] } });
      }
    }

    if (map.getLayer("old-quarter-line")) {
      const on = fx.streets ? smooth(0.2, 0.7, t) : 0;
      if (Math.abs(on - lastOldQuarterOpacity) > 0.001) {
        lastOldQuarterOpacity = on;
        map.setPaintProperty("old-quarter-line", "line-opacity", on);
        map.setPaintProperty("old-quarter-glow", "line-opacity", on * 0.5);
        map.setPaintProperty("old-quarter-label", "text-opacity", on);
      }
    }
  }

  // Keep the subject clear of the story card (rule of thirds on desktop,
  // upper half on phones).
  function framePadding(shot = shots[activeShot]) {
    const w = window.innerWidth, h = window.innerHeight;
    if (shot?.chapter === 7) return w < 760 ? { top: 0, bottom: 0, left: 0, right: 0 } : { top: 60, bottom: 60, left: Math.round(w * 0.45), right: 0 };
    if (shot?.leg) return w < 760 ? { top: 0, bottom: 0, left: 0, right: 0 } : { top: 60, bottom: 60, left: 0, right: Math.round(Math.min(598, w * 0.52)) };
    if (shot?.chapter === 5 && w < 760) return { top: 70, bottom: Math.round(h * 0.56), left: 0, right: 0 };
    return w < 760 ? { top: 70, bottom: Math.round(h * 0.42), left: 0, right: 0 } : { top: 60, bottom: 60, left: 0, right: Math.round(Math.min(598, w * 0.52)) };
  }

  const doanMonFitCache = new Map();
  function fitDoanMonCamera(camera, shot) {
    if (!doanMonBounds || !map.cameraForBounds) return camera;
    const padding = framePadding(shot);
    const margin = Math.round(Math.min(window.innerWidth, window.innerHeight) * 0.08);
    const fittedPadding = {
      top: padding.top + margin,
      bottom: padding.bottom + margin,
      left: padding.left + margin,
      right: padding.right + margin,
    };
    const bearing = Math.round(camera.bearing);
    const pitch = Math.round(camera.pitch);
    const visibleWidth = window.innerWidth < 760
      ? window.innerWidth
      : Math.max(1, Math.min(window.innerWidth - 24, $("#story").getBoundingClientRect().left - 16) - 24);
    const widthCorrection = Math.max(0, Math.log2(map.getContainer().clientWidth / visibleWidth));
    const key = `${window.innerWidth}x${window.innerHeight}:${bearing}:${pitch}:${JSON.stringify(fittedPadding)}:${visibleWidth}`;
    if (!doanMonFitCache.has(key)) {
      try {
        const fitted = map.cameraForBounds([[doanMonBounds[0], doanMonBounds[1]], [doanMonBounds[2], doanMonBounds[3]]], {
          bearing,
          pitch,
          padding: 0,
          maxZoom: 21.5,
        });
        if (!fitted?.center) {
          doanMonFitCache.set(key, { center: camera.center, zoom: camera.zoom });
        } else {
          // Fit to the exposed map width; the model is shorter than the OSM footprint around it.
          doanMonFitCache.set(key, { center: fitted.center.toArray(), zoom: Math.min(21.7, fitted.zoom - widthCorrection + 1.1) });
        }
      } catch (error) {
        doanMonFitCache.set(key, { center: camera.center, zoom: camera.zoom });
        return camera;
      }
    }
    const fitted = doanMonFitCache.get(key);
    return { ...camera, ...fitted };
  }

  async function preloadTourMapTiles() {
    const opening = {
      center: map.getCenter().toArray(),
      zoom: map.getZoom(),
      pitch: map.getPitch(),
      bearing: map.getBearing(),
      padding: map.getPadding(),
    };
    const warmOrder = Array.from({ length: STOPS.length }, (_, index) => index).filter((index) => index !== 0).concat(0);
    for (let step = 0; step < warmOrder.length; step++) {
      const index = warmOrder[step];
      const chapterShots = shots.filter((item) => item.chapter === index && !item.leg);
      const warmShots = index === 0
        ? [
          { shot: chapterShots[0], t: 0.55 },
          { shot: chapterShots[0], t: 1 },
          { shot: chapterShots[1], t: 1 },
          { shot: chapterShots[3], t: 0.5 },
          { shot: chapterShots.at(-1), t: 1 },
        ]
        : [{ shot: chapterShots[0], t: 0 }];
      for (let warmIndex = 0; warmIndex < warmShots.length; warmIndex++) {
        const { shot, t } = warmShots[warmIndex];
        const camera = index === 5 ? fitDoanMonCamera(shot.cam(t), shot) : shot.cam(t);
        map.jumpTo({ ...camera, padding: framePadding(shot) });
        await waitForMapIdle(map, 15000);
        await landmarks?.precompileVisible?.();
        const progress = 86 + (7 * (step + (warmIndex + 1) / warmShots.length)) / warmOrder.length;
        updateStartupLoader(progress, `Đang tải bản đồ điểm ${index + 1}/${STOPS.length}…`);
      }
    }
    map.jumpTo(opening);
    await waitForMapIdle(map, 15000);
  }

  // Animate only while the camera moves or the tour plays.
  let cameraFrame = 0;
  let last = performance.now();
  function frame(now) {
    cameraFrame = 0;
    if (explore) return;
    const dt = Math.min(0.25, (now - last) / 1000);
    last = now;
    if (autoplay) {
      autoplayProgress = Math.min(total, autoplayProgress + (dt * total) / PLAYBACK_DURATION_SECONDS);
      window.scrollTo(0, autoplayProgress * unitPx());
      applyShot(autoplayProgress);
      if (autoplayProgress >= total) setAutoplay(false);
    }
    const k = reduceMotion ? 1 : 1 - Math.exp(-dt * 7);
    const centerError = metres(current.center, target.center);
    const zoomError = Math.abs(current.zoom - target.zoom);
    const pitchError = Math.abs(current.pitch - target.pitch);
    const bearingError = Math.abs((((target.bearing - current.bearing + 540) % 360) - 180));
    const moving = centerError >= 0.2 || zoomError >= 0.001 || pitchError >= 0.02 || bearingError >= 0.02;
    if (moving) {
      const followed = lerpCam(current, target, k);
      // Keep the moving vehicle at the camera center while the lens and heading ease.
      if (shots[activeShot]?.leg) followed.center = [...target.center];
      current = followed;
      map.jumpTo({ ...current, padding: framePadding() });
    }
    if (moving || autoplay) cameraFrame = requestAnimationFrame(frame);
  }

  function scheduleCameraFrame() {
    if (explore || cameraFrame) return;
    last = performance.now();
    cameraFrame = requestAnimationFrame(frame);
  }

  let scheduled = false;
  const onScroll = () => {
    if (autoplay || autoDriveFrame) return;
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => {
      scheduled = false;
      if (!explore) {
        applyShot(progressUnits());
        scheduleCameraFrame();
      }
    });
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  const pauseAutoplay = () => { if (autoplay) setAutoplay(false); };
  window.addEventListener("wheel", pauseAutoplay, { passive: true });
  window.addEventListener("touchstart", pauseAutoplay, { passive: true });
  window.addEventListener("pointerdown", (e) => {
    if (e.target instanceof Element && e.target.closest("#autoplay-toggle")) return;
    pauseAutoplay();
    cancelAutoDrive();
  }, { passive: true });
  window.addEventListener("keydown", (e) => {
    if (!["ArrowDown", "ArrowUp", "PageDown", "PageUp", "Home", "End", " "].includes(e.key)) return;
    if (e.target instanceof Element && e.target.closest("button, a, input, textarea, select, summary")) return;
    pauseAutoplay();
  });
  window.addEventListener("resize", () => {
    map.setPixelRatio(window.innerWidth < 760 ? Math.min(window.devicePixelRatio || 1, 2) : window.devicePixelRatio);
    const u = progressUnits();
    sizeTrack();
    window.scrollTo(0, u * unitPx());
    applyShot(u);
    scheduleCameraFrame();
  });
  applyShot(progressUnits());
  current = { ...target };
  scheduleCameraFrame();

  /* ---------- controls ---------- */
  autoplayBtn.addEventListener("click", () => setAutoplay(!autoplay));
  const exploreBtn = $("#explore-toggle");
  exploreBtn.addEventListener("click", () => {
    setAutoplay(false);
    explore = !explore;
    exploreBtn.setAttribute("aria-pressed", String(explore));
    exploreBtn.textContent = explore ? "Về chế độ phim" : "Tự khám phá";
    document.body.classList.toggle("is-exploring", explore);
    document.body.style.overflow = explore ? "hidden" : "";
    for (const h of ["scrollZoom", "dragPan", "dragRotate", "keyboard", "doubleClickZoom", "touchZoomRotate", "touchPitch"]) map[h][explore ? "enable" : "disable"]();
    root.style.setProperty("--cover", "0");
    root.style.setProperty("--dutch", "0deg");
    if (!explore) { current = { center: map.getCenter().toArray(), zoom: map.getZoom(), pitch: map.getPitch(), bearing: map.getBearing() }; applyShot(progressUnits()); }
  });

  const dialog = $("#itinerary");
  $("#route-open").addEventListener("click", () => { setAutoplay(false); dialog.showModal(); });
  dialog.querySelector("[data-close]").addEventListener("click", () => dialog.close());

  const toast = $("#toast");
  $("#share-tour").addEventListener("click", async () => {
    const data = { title: "Hà Nội — bảy cảnh quay", text: "Lộ trình 7 điểm từ Bát Tràng đến Hồ Gươm.", url: location.href };
    try {
      if (navigator.share) await navigator.share(data);
      else { await navigator.clipboard.writeText(location.href); toast.textContent = "Đã sao chép đường dẫn."; }
    } catch { toast.textContent = "Chưa chia sẻ được."; }
    toast.classList.add("is-visible");
    setTimeout(() => toast.classList.remove("is-visible"), 2600);
  });

  window.__film = { map, shots, jumpToShot, get landmarks() { return landmarks; } };
}

main().catch((error) => {
  showStartupError(error);
});
