# Hà Nội Xưa — visual direction

## Reference

Adapted from [Vauban Hanoi](https://vauban-hanoi.vercel.app/), inspected at desktop size. The reference uses a near-black canvas, warm gold accents, cream serif headlines, Vietnamese sans-serif body text, full-bleed heritage imagery, compact scene controls, and a sequence of history and place cards. Its strongest interaction is the persistent panorama scene card while the visitor moves through the page.

## Design intent

Keep the existing Hà Nội Xưa identity—film grain, archival map, lacquer red, and warm paper—then move the seven-stop tour into a more immersive, two-part experience. The main journey pairs a persistent architectural model on the left with one large archival photograph and a concise historical passage on the right. Scrolling the right-hand story changes the 3D scene and its label. A seven-stop rail and drag control provide direct access.

## Palette and type

- Journey canvas: `#11130F` / `#141612`
- Warm text: `#F2EDE1`
- Scene accent: `#EFC46D`
- Existing lacquer accent: `#9B3B2F`
- Existing paper: `#EFE6D3`
- Headlines: Fraunces, with Georgia as fallback
- Interface and body: Be Vietnam Pro, with system sans-serif fallback

## Layout and components

- Keep the existing cinematic hero and 1891 map as the opening sequence.
- Introduce the seven-stop section with a large two-line serif title and one short instruction.
- On desktop, split the tour into equal columns. The left scene console stays sticky for the full story sequence; the right column presents seven full-height image-and-history chapters.
- The scene console contains the real-time 3D canvas, location number and metadata, rotation slider, seven-step rail, fine blueprint grid, atmospheric haze, and interpretive-model note.
- On narrow screens, place the scene console before the story cards and make each chapter a stacked photo-and-copy card.
- Keep image credits and history-source notes visible in the existing footer disclosure.

## Motion and interaction

- Change the 3D reconstruction when a history card enters the center of the viewport.
- Support direct scene changes from the numbered rail, pointer drag, touch drag, and a rotation slider.
- Use slow model turns, gentle vertical drift, warm light, and drifting haze. Honor `prefers-reduced-motion` for page transitions and ambient movement.
- Keep text readable over the photos and retain visible focus states through the existing global styles.

## Source observation

The reference hero uses a full-width historical scene with a dark overlay, pill navigation, and a floating current-location panel. Lower sections use compact gold labels, serif titles, timeline entries, and large rounded photo cards. The implementation adapts these patterns to the requested half-model / half-history composition rather than reproducing Vauban's branding or 360-degree imagery.
