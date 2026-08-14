# Theme 02 — Immersive Portfolio Room

## Concept
Theme 02 is an **Immersive Portfolio Room** — a premium dark architectural exhibition gallery. The visitor enters a dark, high-end exhibition space where they are conceptually standing INSIDE the room. Around the visitor are spatial exhibition walls/panels, each representing one Admin-controlled homepage section.

---

## Visual Direction
- **Atmosphere**: Premium modern architectural interior / dark exhibition gallery / futuristic studio.
- **Materials**: Dark matte aluminium, metallic bevels, corner brackets, subtle reflective floor grid, indirect overhead lighting, cinematic spotlights.
- **Coloring**: Deep blacks (`#050608`), high-contrast active exhibit surfaces, theme-derived accent lighting.
- **Goal**: "An expensive interactive portfolio installation."

---

## Room Architecture (`ImmersiveRoom`)
```
ImmersiveRoom
 ├── Floor (Concrete/dark grid plane with radial floor glow)
 ├── Ceiling (Architectural canopy structure)
 ├── Walls (Spatial 3D polygon wall ring, one wall per section)
 ├── Lighting (RoomLighting: low-key ambient fill + active wall spotlight)
 ├── Section Panels (ImmersiveWall: renders SectionRegistry section content)
 ├── Camera / Viewpoint (Perspective 3D camera pan & rotate controller)
 └── Navigation Controller (RoomNavigation: compass, minimap, wall rail)
```

---

## Section → Wall Mapping
- Dynamic Admin section configuration (`homepageConfig.sections`) is authoritative.
- Dynamic spatial polygon calculation (`angleStep = 360 / N`, 3D positioning `rotateY`, `translateZ`).
- Active Wall: illuminated by focused spotlight beam, crisp text, high contrast surface, subtle elevation glow.
- Adjacent/Inactive Walls: dimmed atmospheric light, soft ambient outline, clickable for instant camera focus.

---

## Intro → Room Transition
- Theme 2 begins at the existing Cinematic Intro layer (`IntroOverlay.tsx`).
- Intro is fully Admin-configurable (`introBrandText`, `introSubtitle`, `introLogoUrl`, `introDuration`, etc.).
- When intro completes:
  1. Dark overlay screen darkens.
  2. Architectural room geometry begins appearing.
  3. Camera/viewpoint enters the room (`translateZ: -400px -> 0px`).
  4. Front wall becomes visible and primary spotlight activates.

---

## Admin Theme Switching & Shared CMS Model
- **Theme 01 — Paper**: Classic tactile paper layout.
- **Theme 02 — Immersive Room**: 3D spatial room exhibition.
- **Zero Content Duplication**: Theme 02 consumes the exact same Admin-managed sections, blocks, projects, skills, certifications, and theme tokens.
- **Fallback Safety**: `<SpatialErrorBoundary />` automatically catches unexpected WebGL/runtime errors and safely falls back to Theme 01.

---

## Performance & Accessibility
- Full keyboard support (`Up/Down/Left/Right/Space/PageUp/PageDown/Home/End`).
- Mouse wheel velocity lock (45px thresholding).
- Touch swipe gesture thresholding on mobile devices.
- Automatic fallback to simplified 3D crossfade for `prefers-reduced-motion: reduce`.
