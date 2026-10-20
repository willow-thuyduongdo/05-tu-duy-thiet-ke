# Hà Nội — bảy cảnh quay · visual direction

## Concept

A film you scroll. The page is a fixed, full-screen 3D map; scroll position drives a sequence of named camera moves from classic cinematography. Story cards, a slate and a timecode frame the map like a camera monitor.

## Palette and type

- Canvas `#0B0D0C`, warm white `#F3EFE6`, amber `#F2B84B`, REC red `#FF4D3D`
- Basemap: OpenFreeMap dark, water regraded to deep teal, city blocks extruded in graphite
- Be Vietnam Pro for headings and UI, JetBrains Mono for the slate, timecode and data

## Interface

- Top HUD: brand, chapter chips, REC + timecode, "Lộ trình", "Tự khám phá"
- Slate (bottom left): shot number, technique, lens, one-line note
- Story card (right; bottom sheet on phones): photo revealed by parting clouds, history, quote, facts, directions from the previous stop
- Navigation HUD during tracking shots: mode, distance and time left, next turn
- Timeline at the bottom with chapter ticks

## Motion

- Damped camera follow (gimbal feel), map padding keeps the subject clear of the card
- Cloud wipe hides the cut between a tracking shot and the arrival shot
- Letterbox 2.39:1 (capped at 11vh), tilt-shift blur bands, whip-pan blur, Dutch rotation
- `prefers-reduced-motion`: no easing, no clouds, no whip or Dutch
