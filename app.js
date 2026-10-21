import * as maplibregl from "https://unpkg.com/maplibre-gl@6.14.0/dist/maplibre-gl.mjs";
import { createLandmarkLayer } from "./landmarks.js?v=20261021c";

/* ============================================================== content */
// Stops in walking-tour order. `face` = compass bearing the model front faces
// (taken from the OSM footprint orientation); cameras look at the front with
// bearing face + 180.
const STOPS = [
  {
    id: "bat-trang", short: "Gốm", title: "Làng gốm Bát Tràng", kicker: "Gia Lâm · bên sông Bắc Hưng Hải",
    text: "Làng nghề hơn 500 năm nay có Bảo tàng gốm Bát Tràng (1+1>2 Architects): bảy khối hình bàn xoay gốm lồng nhau, bậc thang như hẻm núi, ốp gạch đất, bê tông sợi và gốm mosaic, sân lễ hội lộ thiên dưới chân và vườn trên mái. Cách đó vài trăm mét, lò bầu cổ năm bầu nung vẫn đứng trong chợ gốm.",
    photo: "./assets/bat-trang.jpg", alt: "Người thợ Bát Tràng bên những sản phẩm gốm mộc",
    quote: { who: "Ca dao", text: "Ước gì anh lấy được nàng / Để anh mua gạch Bát Tràng về xây." },
    facts: ["7 khối bàn xoay", "4 tầng + vườn mái", "6.300 m² sàn", "lò bầu 5 bầu nung"], face: 180,
  },
  {
    id: "pho-co", short: "Phố", title: "36 phố phường", kicker: "Phố Cổ · Hoàn Kiếm",
    text: "Phố Cổ hình thành từ những phường nghề sát kinh thành. Tên phố giữ lại nghề xưa: Hàng Bạc, Hàng Đào, Hàng Mã, Hàng Thiếc. Trên bản đồ, các phố mang chữ “Hàng” được tô sáng.",
    photo: "./assets/pho-co.jpg", alt: "Mái nhà, biển hiệu và dòng xe trên một con phố Hà Nội",
    quote: { who: "Ca dao", text: "Rủ nhau chơi khắp Long Thành / Ba mươi sáu phố rành rành chẳng sai." },
    facts: ["45 phố “Hàng” trên OSM", "phường nghề"], face: 0,
  },
  {
    id: "ma-may", short: "Nhà", title: "Nhà cổ 87 Mã Mây", kicker: "Nhà phố · cuối thế kỷ XIX",
    text: "Ngôi nhà mở ra theo chiều sâu: gian hàng phía trước, sân trong lấy sáng, nhà chính, rồi lớp sinh hoạt phía sau. Mặt tiền hẹp, nở hậu, kể cách sống và buôn bán của một gia đình phố thị.",
    photo: "./assets/ma-may.jpg", alt: "Không gian gỗ trong ngôi nhà cổ số 87 Mã Mây",
    quote: { who: "Người kể chuyện", text: "Mặt tiền chỉ năm mét, nhưng phải đi hết hai mươi tám mét mới tới gian sau." },
    facts: ["sâu 28 m", "mặt tiền 5 → 6 m", "157,6 m²"], face: 275,
  },
  {
    id: "ho-guom", short: "Hồ Gươm", title: "Tháp Rùa · Hồ Gươm", kicker: "Hồ Hoàn Kiếm · 1884–1886",
    text: "Hồ gắn với truyền thuyết vua Lê trả gươm báu cho Rùa Vàng. Tháp Rùa ba tầng cửa cuốn trên gò giữa hồ là khoảng lặng ở tâm thành phố.",
    photo: "./assets/ho-guom.jpg", alt: "Tháp Rùa trên đảo nhỏ giữa Hồ Gươm",
    quote: { who: "Truyền thuyết Hồ Gươm", text: "Rùa Vàng nổi lên giữa hồ: “Xin bệ hạ hoàn gươm lại cho Long Quân.”" },
    facts: ["cao 8,8 m", "tầng 1: 6,28 × 4,54 m", "3 tầng + vọng lâu"], face: 270,
  },
  {
    id: "van-mieu", short: "Văn Miếu", title: "Khuê Văn Các", kicker: "Văn Miếu · xây năm 1805",
    text: "Văn Miếu lập năm 1070, Quốc Tử Giám năm 1076. Khuê Văn Các đứng trên bốn trụ gạch, gác gỗ sơn son, bốn cửa tròn tỏa tia và tám mái — biểu tượng Thăng Long hiếu học.",
    photo: "./assets/van-mieu.jpg", alt: "Khoảng sân và kiến trúc cổ tại Văn Miếu – Quốc Tử Giám",
    quote: { who: "Văn bia khoa 1442 · Thân Nhân Trung", text: "Hiền tài là nguyên khí của quốc gia." },
    facts: ["đế 6,8 m", "4 trụ 1 × 1 m", "8 mái"], face: 200,
  },
  {
    id: "hoang-thanh", short: "Thành", title: "Đoan Môn · Hoàng thành", kicker: "Kinh đô · UNESCO 2010",
    text: "Cổng chính phía nam của Cấm thành, mặt bằng chữ U, năm cửa vòm; cửa giữa dành cho vua. Công trình hiện còn do nhà Lê sơ dựng, tu bổ thời Nguyễn, trên nền Ngũ Môn Lâu thời Lý.",
    photo: "./assets/hoang-thanh.jpg", alt: "Đoan Môn, cổng chính phía nam của Hoàng Thành Thăng Long",
    quote: { who: "Chiếu dời đô · 1010", text: "Xem khắp đất Việt ta, chỉ nơi này là thắng địa." },
    facts: ["dài 46,5 m", "cao ≈ 6 m", "5 cửa vòm"], face: 186,
  },
  {
    id: "lang-bac", short: "Ba Đình", title: "Lăng Chủ tịch Hồ Chí Minh", kicker: "Ba Đình · 1945 / 1975",
    text: "Quảng trường Ba Đình là nơi đọc Tuyên ngôn Độc lập ngày 2/9/1945. Lăng khánh thành năm 1975, ba lớp: bệ đá, thân hàng cột vuông, mái bậc; ốp đá granite xám.",
    photo: "./assets/lang-bac.jpg", alt: "Lăng Chủ tịch Hồ Chí Minh tại quảng trường Ba Đình",
    quote: { who: "Tuyên ngôn Độc lập · 2/9/1945", text: "Tất cả mọi người đều sinh ra có quyền bình đẳng." },
    facts: ["rộng 41,2 m", "cao 21,6 m", "3 lớp"], face: 101,
  },
];

/* ============================================================== helpers */
const $ = (sel) => document.querySelector(sel);
const clamp01 = (v) => Math.min(1, Math.max(0, v));
const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const smooth = (a, b, t) => { const x = clamp01((t - a) / (b - a)); return x * x * (3 - 2 * x); };
const lerp = (a, b, t) => a + (b - a) * t;
const wrap = (deg) => ((deg % 360) + 540) % 360 - 180;
const fmtKm = (m) => (m >= 1000 ? `${(m / 1000).toLocaleString("vi-VN", { maximumFractionDigits: 1 })} km` : `${Math.round(m / 10) * 10} m`);
const fmtMin = (s) => `${Math.max(1, Math.round(s / 60))} phút`;
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const escapeHtml = (v) => String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

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
        { tech: "TOP SHOT · 36 PHỐ PHƯỜNG", lens: "35mm", note: "Cẩu thẳng lên nhìn từ trên xuống mạng phố nghề.", len: 1.2, fx: { streets: 1 }, cam: (t) => lerpCam(C(b, 18.9, 80, 107), C(c, 16.4, 8, 0), ease(t)) },
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
        len: long ? 2.2 : leg.length > 900 ? 1.5 : 0.8, fx: { route: 1 },
        cam: (t) => {
          const d = ease(t) * leg.length;
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
function addCityLayers(map, data) {
  const style = map.getStyle();
  const firstSymbol = style.layers.find((l) => l.type === "symbol")?.id;
  const renderHeight = ["to-number", ["get", "render_height"], 0];
  const taggedHeight = ["to-number", ["get", "height"], 0];
  const levels = ["to-number", ["get", "building:levels"], 0];
  const osmId = ["to-number", ["get", "osm_id"], 0];
  const ordinaryHeight = ["+", 8, ["*", ["%", osmId, 13], 1.2]];
  const tallBuildingHeight = ["+", 20, ["*", ["%", osmId, 15], 1.5]];
  const estimatedHeight = ["case",
    [">", renderHeight, 0], renderHeight,
    [">", taggedHeight, 0], taggedHeight,
    [">", levels, 0], ["*", levels, 3.2],
    ["in", ["get", "building"], ["literal", ["apartments", "office", "hotel", "university", "hospital"]]], tallBuildingHeight,
    ordinaryHeight,
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
    minzoom: 13.5,
    filter: ["!", ["in", ["id"], ["literal", []]]],
    paint: {
      "fill-extrusion-color": ["interpolate", ["linear"], estimatedHeight, 0, "#e7e1d5", 20, "#ddd5c6", 60, "#cfc6b4"],
      "fill-extrusion-height": ["interpolate", ["linear"], ["zoom"], 13.5, 0, 14.5, estimatedHeight],
      "fill-extrusion-base": ["coalesce", ["get", "render_min_height"], 0],
      "fill-extrusion-opacity": 0.95,
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
  const sites = STOPS.filter((s) => s.id !== "pho-co").map((s) => ({ id: s.id, lonlat: s.lonlat, bearing: s.face }));
  if (STOPS[0].kiln) sites.push({ id: "bat-trang-kiln", lonlat: STOPS[0].kiln, bearing: 180 });
  const layer = createLandmarkLayer(maplibregl, sites, { lake: data.lake, carUrl: "./assets/models/ferrari.glb" });
  map.addLayer(layer);
  return layer;
}

/* ============================================================== UI */
function renderStory(legs, galleries) {
  const story = $("#story");
  story.innerHTML = STOPS.map((s, i) => {
    const leg = legs[i - 1];
    const from = STOPS[i - 1];
    const gallery = galleries[s.id] || [];
    const firstPhoto = gallery[0];
    const nextStop = STOPS[i + 1];
    const directions = leg ? `
      <details class="directions">
        <summary><span>Đường từ ${escapeHtml(from.title)}</span><small>${fmtKm(leg.distance_m)} · ${leg.mode === "driving" ? "xe" : "đi bộ"} ${fmtMin(leg.duration_s)}</small></summary>
        <ol class="steps">${leg.steps.filter((st) => st.type !== "depart" || st.name).map((st) => `<li>${escapeHtml(stepText(st))} <span>${st.distance ? fmtKm(st.distance) : ""}</span></li>`).join("")}</ol>
        <a class="gmaps" href="${gmapsLink(from.lonlat, s.lonlat, leg.mode)}" target="_blank" rel="noreferrer">Mở chỉ đường trên Google Maps ↗</a>
      </details>` : `<p class="directions"><a class="gmaps" href="https://www.google.com/maps/search/?api=1&query=${s.lonlat[1]},${s.lonlat[0]}" target="_blank" rel="noreferrer">Mở vị trí trên Google Maps ↗</a></p>`;
    const driveButton = nextStop ? `<button class="card__next" type="button" data-drive-next="${i}" aria-label="Tự lái đến ${escapeHtml(nextStop.title)}"><span class="card__next-icon" aria-hidden="true">↗</span><span>Lái đến ${escapeHtml(nextStop.short)}</span><span class="card__next-arrow" aria-hidden="true">→</span></button>` : "";
    return `<article class="card" id="${s.id}" data-chapter="${i}" aria-labelledby="${s.id}-title">
      <div class="card__photo" data-photo-stage>
        <button class="card__photo-main" type="button" data-photo-view data-photo-chapter="${i}" data-photo-index="0" data-photo-src="${firstPhoto?.src || s.photo}" data-photo-alt="${escapeHtml(firstPhoto?.alt || s.alt)}" aria-label="Phóng to ảnh: ${escapeHtml(firstPhoto?.title || s.title)}">
          <img data-gallery-image alt="" loading="lazy" decoding="async">
          <span class="card__photo-hint">Nhấn để phóng to</span>
        </button>
        <div class="photo-gallery-controls" role="group" aria-label="Điều khiển ảnh">
        <span class="photo-gallery-count" data-gallery-count aria-live="polite">${String(1).padStart(2, "0")} / ${String(gallery.length).padStart(2, "0")}</span>
          <button type="button" class="photo-gallery-arrow" data-gallery-step="-1" aria-label="Ảnh trước">‹</button>
          <button type="button" class="photo-gallery-arrow" data-gallery-step="1" aria-label="Ảnh tiếp theo">›</button>
        </div>
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
  const [sites, routes, streets, lake, galleries] = await Promise.all(
    ["./data/sites.geojson", "./data/routes.geojson", "./data/old-quarter.geojson", "./data/lake.geojson", "./data/photo-galleries.json"].map((u) => fetch(`${u}?v=20261021c`).then((r) => r.json())),
  );
  for (const f of sites.features) {
    if (f.properties.kind !== "anchor") continue;
    const stop = STOPS.find((s) => s.id === f.properties.id);
    if (stop) stop.lonlat = f.geometry.coordinates;
    if (f.properties.id === "bat-trang-kiln") STOPS[0].kiln = f.geometry.coordinates;
  }
  const legs = routes.features.map(prepareLeg);
  const { shots, total } = buildShots(legs);

  renderStory(legs, galleries);
  renderNav(shots, total);
  renderItinerary(legs);

  const track = $("#scroll-track");
  const unitPx = () => window.innerHeight * (window.innerWidth < 760 ? 0.9 : 1);
  const sizeTrack = () => { track.style.height = `${total * unitPx() + window.innerHeight}px`; };
  sizeTrack();

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
    canvasContextAttributes: { antialias: true },
    fadeDuration: 0,
  });
  map.addControl(new maplibregl.AttributionControl({ compact: true }), "bottom-right");
  for (const h of ["scrollZoom", "dragPan", "dragRotate", "keyboard", "doubleClickZoom", "touchZoomRotate", "touchPitch", "boxZoom"]) map[h].disable();

  let landmarks = null;
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
  const probes = sites.features
    .filter((f) => f.properties.kind === "footprint")
    .flatMap((f) => {
      const ring = f.geometry.coordinates[0].slice(0, -1);
      const cx = ring.reduce((a, p) => a + p[0], 0) / ring.length;
      const cy = ring.reduce((a, p) => a + p[1], 0) / ring.length;
      return [[cx, cy], ...ring.map((p) => [lerp(p[0], cx, 0.3), lerp(p[1], cy, 0.3)])];
    });
  const hiddenIds = new Set();
  const inside = (pt, ring) => {
    let c = false;
    for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
      const [xi, yi] = ring[i], [xj, yj] = ring[j];
      if ((yi > pt[1]) !== (yj > pt[1]) && pt[0] < ((xj - xi) * (pt[1] - yi)) / (yj - yi) + xi) c = !c;
    }
    return c;
  };
  function refreshHidden() {
    if (!map.getLayer("city-3d") || map.getZoom() < 14) return;
    let changed = false;
    for (const f of map.querySourceFeatures("openmaptiles", { sourceLayer: "building" })) {
      if (f.id == null || hiddenIds.has(f.id)) continue;
      const g = f.geometry;
      const rings = g.type === "Polygon" ? [g.coordinates[0]] : g.type === "MultiPolygon" ? g.coordinates.map((p) => p[0]) : [];
      if (rings.some((r) => probes.some((pt) => inside(pt, r)))) { hiddenIds.add(f.id); changed = true; }
    }
    if (changed) map.setFilter("city-3d", ["!", ["in", ["id"], ["literal", [...hiddenIds]]]]);
  }

  map.on("load", () => {
    landmarks = addCityLayers(map, { streets, routes, lake: lake.features[0] });
    landmarks.setActiveSite(activeChapter >= 0 ? STOPS[activeChapter].id : null);
    applyShot(progressUnits());
    scheduleCameraFrame();
    document.body.classList.remove("is-loading");
    try {
      map.setSky({ "sky-color": "#9fc3dd", "horizon-color": "#f4ead6", "fog-color": "#efe9de", "sky-horizon-blend": 0.55, "horizon-fog-blend": 0.7, "fog-ground-blend": 0.6, "atmosphere-blend": 0 });
    } catch (error) { console.warn("Sky unsupported:", error.message); }
    map.setLight({ anchor: "map", color: "#fff1d8", intensity: 0.35, position: [1.4, 210, 35] });
  });
  // Animated layers keep repainting, so "idle" rarely fires: scan when tiles arrive.
  let hideTimer = 0;
  map.on("sourcedata", (e) => {
    if (e.sourceId !== "openmaptiles" || hideTimer) return;
    hideTimer = setTimeout(() => { hideTimer = 0; refreshHidden(); }, 250);
  });
  map.on("idle", refreshHidden);
  const updateMapZoom = () => {
    const zoom = map.getZoom();
    map.getContainer().classList.toggle("is-close", zoom > 16.6);
    map.getContainer().classList.toggle("is-overview", zoom < 15.2);
  };
  map.on("zoom", updateMapZoom);
  updateMapZoom();

  /* ---------- scroll → camera director ---------- */
  let explore = false;
  let current = { ...first };
  let target = { ...first };
  let activeShot = -1;
  let activeChapter = -2;
  let lastProgressKey = "";
  const root = document.documentElement;
  const slate = $("#slate");
  const navHud = $("#nav-hud");
  const cards = [...document.querySelectorAll(".card")];
  const fill = $("#timeline-fill");
  const photoViewer = $("#photo-viewer");
  const photoViewerImage = $("#photo-viewer-image");
  const photoViewerCaption = $("#photo-viewer-caption");
  let lastPhotoTrigger = null;
  let currentViewerPhoto = null;
  const licenseUrls = {
    "CC BY-SA 4.0": "https://creativecommons.org/licenses/by-sa/4.0/",
    "CC BY-SA 3.0": "https://creativecommons.org/licenses/by-sa/3.0/",
    "CC BY-SA 2.5": "https://creativecommons.org/licenses/by-sa/2.5/",
    "CC BY-SA 2.0": "https://creativecommons.org/licenses/by-sa/2.0/",
    "CC BY 4.0": "https://creativecommons.org/licenses/by/4.0/",
    "CC BY 3.0": "https://creativecommons.org/licenses/by/3.0/",
    "CC BY 2.0": "https://creativecommons.org/licenses/by/2.0/",
    "CC0 1.0": "https://creativecommons.org/publicdomain/zero/1.0/",
  };
  const galleryIndexes = STOPS.map(() => 0);

  function setGalleryPhoto(chapter, index) {
    const photos = galleries[STOPS[chapter].id] || [];
    if (!photos.length) return null;
    const normalizedIndex = (index + photos.length) % photos.length;
    const photo = photos[normalizedIndex];
    galleryIndexes[chapter] = normalizedIndex;
    const card = cards[chapter];
    const image = card.querySelector("[data-gallery-image]");
    const trigger = card.querySelector("[data-photo-view]");
    trigger.dataset.photoIndex = String(normalizedIndex);
    trigger.dataset.photoSrc = photo.src;
    trigger.dataset.photoAlt = photo.alt;
    trigger.dataset.photoTitle = photo.title;
    trigger.setAttribute("aria-label", `Phóng to ảnh: ${photo.title}`);
    image.alt = photo.alt;
    image.src = photo.src;
    card.querySelector("[data-gallery-count]").textContent = `${String(normalizedIndex + 1).padStart(2, "0")} / ${String(photos.length).padStart(2, "0")}`;
    return photo;
  }

  function renderViewerPhoto(chapter, index) {
    const photo = setGalleryPhoto(chapter, index);
    if (!photo) return;
    currentViewerPhoto = { chapter, index: galleryIndexes[chapter] };
    photoViewerImage.src = photo.src;
    photoViewerImage.alt = photo.alt;
    photoViewerCaption.replaceChildren();
    const title = document.createElement("span");
    title.className = "photo-viewer__title";
    title.textContent = photo.title;
    const credit = document.createElement("span");
    credit.className = "photo-viewer__credit";
    credit.append(`${photo.author} · `);
    const license = document.createElement("a");
    license.href = licenseUrls[photo.license];
    license.target = "_blank";
    license.rel = "noreferrer";
    license.textContent = photo.license;
    const source = document.createElement("a");
    source.href = photo.source;
    source.target = "_blank";
    source.rel = "noreferrer";
    source.textContent = "Nguồn ảnh";
    credit.append(license, " · ", source);
    photoViewerCaption.append(title, credit);
    photoViewer.querySelector("[data-photo-prev]").disabled = galleries[STOPS[chapter].id].length < 2;
    photoViewer.querySelector("[data-photo-next]").disabled = galleries[STOPS[chapter].id].length < 2;
  }

  document.addEventListener("click", (event) => {
    const galleryStep = event.target.closest("[data-gallery-step]");
    if (galleryStep) {
      const card = galleryStep.closest(".card");
      const chapter = Number(card.dataset.chapter);
      setGalleryPhoto(chapter, galleryIndexes[chapter] + Number(galleryStep.dataset.galleryStep));
      return;
    }
    const trigger = event.target.closest("[data-photo-view]");
    if (!trigger?.dataset.photoSrc) return;
    lastPhotoTrigger = trigger;
    renderViewerPhoto(Number(trigger.dataset.photoChapter), Number(trigger.dataset.photoIndex));
    photoViewer.showModal();
  });
  photoViewer.querySelector("[data-photo-prev]").addEventListener("click", () => {
    if (currentViewerPhoto) renderViewerPhoto(currentViewerPhoto.chapter, currentViewerPhoto.index - 1);
  });
  photoViewer.querySelector("[data-photo-next]").addEventListener("click", () => {
    if (currentViewerPhoto) renderViewerPhoto(currentViewerPhoto.chapter, currentViewerPhoto.index + 1);
  });
  photoViewer.addEventListener("keydown", (event) => {
    if (!currentViewerPhoto) return;
    if (event.key === "ArrowLeft") { event.preventDefault(); renderViewerPhoto(currentViewerPhoto.chapter, currentViewerPhoto.index - 1); }
    if (event.key === "ArrowRight") { event.preventDefault(); renderViewerPhoto(currentViewerPhoto.chapter, currentViewerPhoto.index + 1); }
  });
  photoViewer.querySelector("[data-photo-close]").addEventListener("click", () => photoViewer.close());
  photoViewer.addEventListener("click", (event) => { if (event.target === photoViewer) photoViewer.close(); });
  photoViewer.addEventListener("close", () => {
    photoViewerImage.removeAttribute("src");
    currentViewerPhoto = null;
    lastPhotoTrigger?.focus();
  });

  function prepareGallery(chapter) {
    cards.forEach((card, cardIndex) => {
      const image = card.querySelector("[data-gallery-image]");
      if (cardIndex !== chapter) image.removeAttribute("src");
    });
    if (chapter < 0) return;
    setGalleryPhoto(chapter, galleryIndexes[chapter]);
  }

  function progressUnits() { return window.scrollY / unitPx(); }

  function shotAt(u) {
    let s = shots[shots.length - 1];
    for (const sh of shots) if (u < sh.start + sh.len) { s = sh; break; }
    return s;
  }

  function jumpToShot(index) {
    cancelAutoDrive();
    const s = shots[index];
    window.scrollTo({ top: (s.start + 0.02) * unitPx(), behavior: reduceMotion ? "auto" : "smooth" });
  }
  document.addEventListener("click", (e) => {
    const driveButton = e.target.closest("[data-drive-next]");
    if (driveButton) {
      e.preventDefault();
      startAutoDrive(Number(driveButton.dataset.driveNext), driveButton);
      return;
    }
    const btn = e.target.closest("[data-jump-shot], [data-jump]");
    if (!btn) return;
    e.preventDefault();
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
    if (reduceMotion) {
      jumpToShot(arrivalShot.index);
      return;
    }
    const from = (routeShot.start + 0.005) * unitPx();
    const to = (arrivalShot.start + arrivalShot.len * 0.34) * unitPx();
    const duration = Math.min(18000, Math.max(8000, 6500 + routeShot.leg.length / 1.2));
    let startedAt = 0;
    button.disabled = true;
    button.classList.add("is-driving");
    button.querySelector("span:nth-child(2)").textContent = `Đang đến ${STOPS[destination].short}…`;
    const driveFrame = (now) => {
      if (!startedAt) startedAt = now;
      const t = clamp01((now - startedAt) / duration);
      // Route camera and vehicle use cubic ease-in-out: gradual acceleration, then braking.
      window.scrollTo({ top: lerp(from, to, t), left: 0, behavior: "instant" });
      if (t < 1) autoDriveFrame = requestAnimationFrame(driveFrame);
      else {
        autoDriveFrame = 0;
        window.scrollTo({ top: to, left: 0, behavior: "instant" });
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
  });

  function updateTimecode(u) {
    const seconds = (u / total) * 420;
    const f = Math.floor((seconds % 1) * 24);
    const s = Math.floor(seconds) % 60, m = Math.floor(seconds / 60) % 60;
    $("#timecode").textContent = `00:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}:${String(f).padStart(2, "0")}`;
  }

  function applyShot(u) {
    const shot = shotAt(u);
    const t = clamp01((u - shot.start) / shot.len);
    target = shot.cam(t);
    const fx = shot.fx || {};
    const cover = reduceMotion ? 0 : shot.cover ? shot.cover(t) : 0;
    root.style.setProperty("--cover", cover.toFixed(3));
    document.body.classList.toggle("fx-clouds", cover > 0.001);
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

    // Story card: visible on hero shots of its chapter; photo clouds part on arrival.
    const heroChapter = shot.leg || shot.chapter < 0 || shot.chapter > 6 ? -1 : shot.chapter;
    if (heroChapter !== activeChapter) {
      activeChapter = heroChapter;
      cards.forEach((c) => c.classList.toggle("is-active", Number(c.dataset.chapter) === heroChapter));
      markers.forEach((m, i) => m.getElement().classList.toggle("is-active", i === heroChapter));
      prepareGallery(heroChapter);
      landmarks?.setActiveSite(heroChapter >= 0 ? STOPS[heroChapter].id : null);
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
      const d = ease(t) * leg.length;
      const step = [...leg.steps].reverse().find((s) => s.start <= d) || leg.steps[0];
      const next = leg.steps[leg.steps.indexOf(step) + 1];
      navHud.hidden = false;
      const carAt = pointAt(leg, d);
      const zoomNow = map.getZoom();
      landmarks?.setVehicle({
        visible: true,
        lonlat: carAt,
        bearing: heading(carAt, pointAt(leg, d + 12)),
        distance: d,
        // Illustrative size boost on wide shots so the car stays readable.
        scale: Math.min(3, Math.max(1, Math.pow(2, 20 - zoomNow))),
      });
      $("#nav-mode").textContent = leg.mode === "driving" ? "ĐANG DI CHUYỂN · XE" : "ĐANG ĐI BỘ";
      $("#nav-to").textContent = `Đến ${STOPS[shot.chapter].title}`;
      const left = leg.length - d;
      $("#nav-left").textContent = `Còn ${fmtKm(left)} · ${fmtMin((left / leg.length) * leg.duration_s)}`;
      $("#nav-step").textContent = stepText(next && next.start - d < 120 ? next : step);
      const key = `${shot.index}:${Math.round(d / 8)}`;
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
      map.setPaintProperty("old-quarter-line", "line-opacity", on);
      map.setPaintProperty("old-quarter-glow", "line-opacity", on * 0.5);
      map.setPaintProperty("old-quarter-label", "text-opacity", on);
    }
  }

  // Keep the subject clear of the story card (rule of thirds on desktop,
  // upper half on phones).
  function framePadding() {
    const w = window.innerWidth, h = window.innerHeight;
    if (shots[activeShot]?.chapter === 7) return w < 760 ? { top: 0, bottom: 0, left: 0, right: 0 } : { top: 60, bottom: 60, left: Math.round(w * 0.45), right: 0 };
    return w < 760 ? { top: 70, bottom: Math.round(h * 0.42), left: 0, right: 0 } : { top: 60, bottom: 60, left: 0, right: Math.round(Math.min(650, w * 0.48)) };
  }

  // Animate only while camera moves. Let MapLibre sleep between scroll events.
  let cameraFrame = 0;
  let last = performance.now();
  function frame(now) {
    cameraFrame = 0;
    if (explore) return;
    const dt = Math.min(0.25, (now - last) / 1000);
    last = now;
    const k = reduceMotion ? 1 : 1 - Math.exp(-dt * 7);
    const centerError = metres(current.center, target.center);
    const zoomError = Math.abs(current.zoom - target.zoom);
    const pitchError = Math.abs(current.pitch - target.pitch);
    const bearingError = Math.abs((((target.bearing - current.bearing + 540) % 360) - 180));
    if (centerError < 0.2 && zoomError < 0.001 && pitchError < 0.02 && bearingError < 0.02) return;
    current = lerpCam(current, target, k);
    map.jumpTo({ ...current, padding: framePadding() });
    cameraFrame = requestAnimationFrame(frame);
  }

  function scheduleCameraFrame() {
    if (explore || cameraFrame) return;
    last = performance.now();
    cameraFrame = requestAnimationFrame(frame);
  }

  let scheduled = false;
  const onScroll = () => {
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
  window.addEventListener("resize", () => { const u = progressUnits(); sizeTrack(); window.scrollTo(0, u * unitPx()); applyShot(u); scheduleCameraFrame(); });
  applyShot(progressUnits());
  scheduleCameraFrame();

  /* ---------- controls ---------- */
  const exploreBtn = $("#explore-toggle");
  exploreBtn.addEventListener("click", () => {
    explore = !explore;
    exploreBtn.setAttribute("aria-pressed", String(explore));
    exploreBtn.textContent = explore ? "Về chế độ phim" : "Tự khám phá";
    document.body.classList.toggle("is-exploring", explore);
    document.body.style.overflow = explore ? "hidden" : "";
    for (const h of ["scrollZoom", "dragPan", "dragRotate", "keyboard", "doubleClickZoom", "touchZoomRotate", "touchPitch"]) map[h][explore ? "enable" : "disable"]();
    root.style.setProperty("--cover", "0");
    root.style.setProperty("--dutch", "0deg");
    if (!explore) {
      current = { center: map.getCenter().toArray(), zoom: map.getZoom(), pitch: map.getPitch(), bearing: map.getBearing() };
      applyShot(progressUnits());
      scheduleCameraFrame();
    }
  });

  const dialog = $("#itinerary");
  $("#route-open").addEventListener("click", () => dialog.showModal());
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
  console.error(error);
  document.body.classList.remove("is-loading");
  $("#slate-note").textContent = "Không tải được dữ liệu bản đồ. Kiểm tra kết nối mạng và WebGL.";
});
