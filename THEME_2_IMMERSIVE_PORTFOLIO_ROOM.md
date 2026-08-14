# Theme 02 — Immersive Portfolio Room

## Executive Overview
**Theme 02: Immersive Portfolio Room** transforms the portfolio into an interactive 3D architectural exhibition space. Instead of traditional document scrolling, the visitor is conceptually standing INSIDE a dark, high-end exhibition room. Surrounding the visitor are spatial exhibition walls, where each wall represents one Admin-managed homepage section (`Hero`, `About`, `Academic`, `Radar`, `Skills`, `Experience`, `Projects`, `Certifications`, `Contact`, `Proof Mode`, and custom sections).

---

## 1. Architectural Concept & Visual Language
- **Environment**: Dark architectural interior, aluminium/metal paneling, ceiling spotlighting, dark glass displays, concrete floor grid reflections.
- **Lighting Model**: Layered lighting consisting of low-key ambient room fill, ceiling-mounted active wall spotlight, metallic rim highlights, and floor radial glow.
- **Color System**: Dynamically driven by Admin color tokens (`--accent`, `--surface`, `--background`, `--foreground`). Changing theme colors in Admin instantly recolors room spotlights, emissive indicators, floor reflections, and wall borders.
- **Data Model**: 100% CMS-driven with zero content duplication. Theme 02 consumes the exact same database records, section order, block configurations, and business logic as Theme 01.

---

## 2. 3D Camera Engine & Cylindrical Wall Geometry
- **Dynamic Wall Geometry**: Calculates wall angles dynamically for any number `N` of Admin sections (`wallAngleStep = 360° / N`). The room automatically recalculates geometry whenever sections are added, removed, or reordered in Admin.
- **Camera Viewpoint**: The viewport acts as the visitor's camera. Turning clockwise or anti-clockwise rotates the room container (`rotateY(-activeIndex * wallAngleStep)`) around the visitor.
- **Camera Easing**: Uses controlled cubic-bezier easing (`[0.25, 1, 0.35, 1]`) with a 650ms transition lock cooldown to prevent camera jitter, rapid spinning, or nausea.

---

## 3. Multi-Device Input System
- **Keyboard Navigation**:
  - `ArrowLeft` / `A`: Turn anti-clockwise (previous wall).
  - `ArrowRight` / `D`: Turn clockwise (next wall).
  - `ArrowUp` / `ArrowDown` / `Space` / `PageUp` / `PageDown`: Advance wall position.
  - `Home` / `End`: Jump to first / last exhibition wall.
- **Mouse Drag / Look**: Dragging horizontally on the room floor/background turns the camera viewpoint with threshold snapping.
- **Mouse Wheel**: Trackpad and mouse wheel velocity threshold lock (45px accumulator lock).
- **Mobile Touch Gestures**: Responsive horizontal & vertical touch swipe gesture detection.

---

## 4. Exhibition Wall System & Section Compositions
Each section is housed inside a dark matte aluminium exhibition frame (`ImmersiveWall.tsx`) with metallic corner brackets, status indicators, and dedicated section headers:
- `EXHIBIT 01 // PERSONAL IDENTITY` — Hero entrance introduction panel.
- `EXHIBIT 02 // BACKGROUND & IMPACT` — Curated biography and stat metrics.
- `EXHIBIT 03 // ACADEMIC ROADMAP` — Educational roadmap timeline.
- `EXHIBIT 04 // PORTFOLIO RADAR` — Dedicated radar system installation.
- `EXHIBIT 05 // TECHNICAL CAPABILITIES` — Tech matrix and skill badges.
- `EXHIBIT 06 // CAREER HISTORY` — Professional experience timeline.
- `EXHIBIT 07 // FEATURED PROJECTS` — Interactive project gallery.
- `EXHIBIT 08 // CERTIFICATIONS` — Credential & certificate gallery.
- `EXHIBIT 09 // CONNECT & HIRE` — Calming exhibition conclusion panel.

---

## 5. Direct Navigation & Browser History Integration
- **Spatial Compass & Navigation Rail**: Minimal right-side indicator displaying active wall title, wall number (`01 HERO`, `02 ABOUT`, etc.), and rotation controls. Clicking any section indicator turns the 3D camera directly to that wall.
- **Browser History Integration**: Updating active walls pushes browser history state and updates URL hashes (`#about`, `#projects`, `#skills`). Native browser Back and Forward buttons smoothly rotate the 3D camera without reloading the page.

---

## 6. Admin Controls & Live Preview
- **Admin Dashboard -> Themes Tab**: Allows Admin to select `[ THEME 01 — PAPER ]` or `[ THEME 02 — IMMERSIVE ROOM ]`.
- **Theme 2 Room Controls**:
  - `Spotlight Intensity`: Adjust spotlight brightness (0.2x to 1.5x).
  - `Room Ambient Darkness`: Adjust room fill darkness (20% to 100%).
  - `Show Room Navigation Rail`: Toggle right-side navigation rail overlay.
  - `Enable Ambient Light Particles`: Toggle floating dust motes.
- **Live Preview Integration**: The Admin Section Builder and Live Editor render the actual Theme 2 room in real-time inside the preview canvas. Draft changes are visible live before publishing.

---

## 7. Performance & Optimization Architecture
- **DOM Performance Scoping**:
  - Active Wall: Full interactive DOM (`pointer-events-auto`), high contrast, spotlight beam highlight, high z-index.
  - Adjacent Walls (+1 / -1): Rendered as lightweight preview panels (30% opacity, 50% brightness, soft blur).
  - Distant Walls: Rendered as minimal standby frames to preserve memory and GPU bandwidth.
- **Atmospheric Particles**: Sparse 18-particle floating light dust system using lightweight CSS animations (`AtmosphericParticles.tsx`).

---

## 8. Mobile, Accessibility, SEO & Fallback Safety
- **Mobile Responsiveness**: Scales gracefully across 320px, 360px, 375px, 390px, 414px, 430px, tablet, and desktop viewports.
- **Reduced Motion**: `prefers-reduced-motion: reduce` or `motionMode === "reduced"` disables 3D rotation, replacing camera turns with clean crossfades.
- **SEO & Crawlability**: All semantic HTML (`<section>`, `<h1>`, `<h2>`, `<nav>`) remains inside standard DOM containers for search engine indexing.
- **Error Fallback**: `<SpatialErrorBoundary />` catches any runtime exception and falls back safely to Theme 01 (Paper Layout).

---

## 9. Created & Modified Files

### Created Files
- [ImmersiveRoom.tsx](file:///r:/Repo/portofolio/app/components/spatial/ImmersiveRoom.tsx)
- [ImmersiveWall.tsx](file:///r:/Repo/portofolio/app/components/spatial/ImmersiveWall.tsx)
- [RoomLighting.tsx](file:///r:/Repo/portofolio/app/components/spatial/RoomLighting.tsx)
- [RoomNavigation.tsx](file:///r:/Repo/portofolio/app/components/spatial/RoomNavigation.tsx)
- [AtmosphericParticles.tsx](file:///r:/Repo/portofolio/app/components/spatial/AtmosphericParticles.tsx)
- [THEME_2_IMMERSIVE_PORTFOLIO_ROOM.md](file:///r:/Repo/portofolio/THEME_2_IMMERSIVE_PORTFOLIO_ROOM.md)

### Modified Files
- [types.ts](file:///r:/Repo/portofolio/app/lib/types.ts)
- [themeResolver.ts](file:///r:/Repo/portofolio/app/lib/themeResolver.ts)
- [IntroOverlay.tsx](file:///r:/Repo/portofolio/app/components/IntroOverlay.tsx)
- [SpatialBackground.tsx](file:///r:/Repo/portofolio/app/components/spatial/SpatialBackground.tsx)
- [SpatialWebsiteView.tsx](file:///r:/Repo/portofolio/app/components/spatial/SpatialWebsiteView.tsx)
- [ThemesTab.tsx](file:///r:/Repo/portofolio/app/admin/dashboard/components/ThemesTab.tsx)
- [THEME_02_SPATIAL_CINEMATIC.md](file:///r:/Repo/portofolio/THEME_02_SPATIAL_CINEMATIC.md)
