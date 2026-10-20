# Hà Nội xưa — bảy cảnh quay

A buildless, scroll-driven film over a real 3D map of Hà Nội. Scrolling does not move a page: it moves the camera. Each scroll step is a named camera move (aerial establishing, push-in, crane, orbit, tracking, tilt-shift, whip pan, Dutch tilt, one-point dolly, top shot, pull-back reveal) that travels the real walking and driving route from Bát Tràng to Hồ Gươm.

## Preview

From this directory, run: python -m http.server 4173 --directory dist

Open http://localhost:4173. The page needs WebGL and network access for the basemap tiles and the CDN libraries.

## How it works

- `app.js` — the camera director. `STOPS` holds the story content; `heroShots()` and `buildShots()` define 26 shots, each mapping scroll progress to a map camera (`center`, `zoom`, `pitch`, `bearing`). A damped follow eases the real camera toward the scroll target like a gimbal. It also draws the live route progress, the turn-by-turn navigation HUD, the cloud wipes, letterbox, tilt-shift and Dutch-angle effects, and hides the OpenStreetMap blocks that sit under each landmark.
- `landmarks.js` — detailed landmark models rendered inside MapLibre through a three.js custom layer, placed on their OpenStreetMap footprints at real scale. Materials are procedural albedo + normal maps (brick, ngói mũi hài tiles, aged plaster, granite, lacquer, wood, paving). Roof tile courses are modelled in the mesh, ground contact is darkened by a baked vertex-colour pass, and each model casts real shadows on the map.
- Opening: Hà Nội xưa title in Vietnamese calligraphy over blurred, slowly crossfading photographs of Tháp Rùa, Long Biên and Chùa Một Cột, with the ca dao "Gió đưa cành trúc la đà / Tiếng chuông Trấn Vũ, canh gà Thọ Xương". Photographic CC0 clouds gather and part to reveal the light map.
- Materials: a weathering layer injected into the PBR shader adds moss on sky-facing surfaces, rain streaks on walls and rising damp near the ground; lacquer, granite and glass use clearcoat, bronze is metallic, and every model reflects a PMREM sky environment.
- Water: Hồ Hoàn Kiếm is built from OSM relation 198437 with a wave shader (directional waves + noise normals, fresnel sky reflection, sun glints, ripples from the island) and grassy islands with earth banks.
- Particles: GPU point sprites simulated in the vertex shader — kiln smoke and embers (Bát Tràng), incense (Mã Mây), sunlit dust (Đoan Môn), falling leaves (Văn Miếu), water glints and drifting mist (Hồ Gươm).
- `data/` — `lake.geojson` (Hồ Hoàn Kiếm), `sites.geojson` (footprints and anchors), `routes.geojson` (6 legs with turn-by-turn steps) and `old-quarter.geojson` (45 guild streets). `scripts/fetch_geodata.py` regenerates them from Overpass and FOSSGIS OSRM.
- `dist/` — the published static copy (`.openai/hosting.json` serves it). Copy `index.html`, `app.js`, `landmarks.js`, `styles.css` and `data/` into it after changes.

## Shots

| Stop | Camera moves |
| --- | --- |
| Opening | Aerial establishing, clouds part over the city |
| Bát Tràng | Drone push-in, crane down onto the pottery museum, 180° roof-garden orbit, trucking along the village street, push-in on the old kiln |
| 87 Mã Mây | Aerial tracking (14 km by road), tilt-shift miniature, steadicam orbit |
| Phố Cổ | Tracking, street-level steadicam, whip pan, top shot over the guild streets |
| Đoan Môn | Tracking, low-angle Dutch tilt, whip pan, arc shot |
| Lăng Bác | Tracking, one-point symmetry dolly in, crane-up reveal |
| Khuê Văn Các | Tracking, god's-eye top-down, tilt down to hero, 120° orbit |
| Tháp Rùa | Tracking, telephoto arc, pull-back reveal |
| Ending | Final wide over the whole 22 km route |

## Model dimensions

| Model | Dimensions used |
| --- | --- |
| Bảo tàng gốm Bát Tràng | Seven interlocking potter's-wheel volumes on OSM way 1206576120 (48 × 27 m); 4 storeys + roof garden, open-air ground floor; site 3,380 m², GFA 6,300 m² (1+1>2 Architects, via Archify/Designboom); storey height 4.1 m estimated |
| Lò bầu cổ Bát Tràng | 5 firing chambers; chamber size estimated; placed at the pottery market (approximate) |
| 87 Mã Mây | 28 m deep, 5 m frontage widening to 6 m |
| Lăng Bác | 41.2 m wide, 21.6 m high, three tiers (OSM footprint 41.1 m) |
| Khuê Văn Các | 6.8 m base, four 1 × 1 m pillars, eight roofs (OSM footprint 6.4 m) |
| Đoan Môn | 46.5 m long, about 6 m high, five arches |
| Tháp Rùa | 8.8 m high; storeys 6.28 × 4.54, 4.8 × 3.64, 2.97 × 1.9 m (OSM footprint 6.3 × 4.6 m) |

Sources and image licences are listed in the page credits. Column counts, kiln chamber sizes and the Khuê Văn Các height are estimated from photographs. The models are procedural real-time assets, not survey or photogrammetry data.

## Type and assets

- Type: ThuPhap Thien An by Michael Đinh Kiên ("Free for everyone") for the big Hà Nội xưa title (`assets/fonts` holds a Vietnamese WOFF2 subset; an installed 9Slide copy is used first); Charm (bold) for stop names and headings and Vujahday Script for the poem and quotes, both SIL OFL from Google Fonts with full Vietnamese diacritics. Body text stays in Be Vietnam Pro.
- Clouds: `assets/clouds` from "Clouds with transparency" by WickedInsignia (OpenGameArt, CC0), brightened and resized to WebP.
- Opening photos (`assets/backdrop`): Tháp Rùa — P. Hughes, CC BY 4.0; Cầu Long Biên — Amenoc, CC0; Chùa Một Cột — Daderot, CC0 (Wikimedia Commons).

## Accessibility

All story content is real HTML. With `prefers-reduced-motion` the camera jumps without easing and cloud, whip and Dutch effects are off. "Tự khám phá" hands the map controls to the visitor; "Lộ trình" lists every leg with steps and a Google Maps link.
