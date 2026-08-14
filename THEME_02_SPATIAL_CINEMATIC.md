# Theme 02 — Spatial Cinematic Experience

## Concept
Theme 02 is a second complete visual website theme that transforms the portfolio into an interactive 3D cinematic spatial environment. Instead of traditional document scrolling, the viewport acts as a 3D camera and each portfolio section acts as an immersive spatial scene.

---

## Why It Exists
To provide a radically distinct visual language, navigation paradigm, and interactive presentation while consuming the **exact same Admin-managed content**, database records, business logic, and security features without duplication or schema changes.

---

## Difference From Theme 01
| Attribute | Theme 01 — Paper Layout | Theme 02 — Spatial Cinematic |
| :--- | :--- | :--- |
| **Visual Language** | Tactile, editorial paper & dotted grid | 3D depth, atmospheric lighting, spatial scene planes |
| **Navigation** | Vertical document scrolling | Fixed viewport camera scene navigation (`100dvh`) |
| **Viewport** | Long scrolling document | Fixed camera viewport |
| **Transitions** | Standard page scroll / section reveal | Spatial camera pan, depth zoom, perspective rotate & fade |
| **Navigation UI** | Sticky header nav links | Spatial Scene Navigation Rail & floating indicators |

---

## Scene Architecture
- Every section registered in `homepageConfig` (Hero, About, Academic, Radar, Skills, Experience, Projects, Certifications, Contact, and Admin Custom Sections) is wrapped as a `<SpatialScene />`.
- Sections are rendered inside 3D perspective card surfaces (`perspective: 1000px`, backdrop blur, surface contrast).
- Reordering sections in Admin automatically reorders the scene sequence.

---

## Navigation Model & Input Handling
- **Mouse Wheel / Trackpad**: Velocity thresholding (50px delta lock) prevents accidental multi-scene skipping.
- **Touch Gestures**: Safe touch swipe thresholding for mobile/tablet gesture navigation.
- **Keyboard Navigation**: Arrow keys (`Up`/`Down`), `PageUp`/`PageDown`, `Home`, `End`, `Space`.
- **Navigation Rail**: Interactive vertical dot rail with scene labels and direct scene jumping.
- **Deep Linking**: URL hashes (`#about`, `#projects`, `#skills`, `#contact`) automatically navigate to target scene and sync with browser history (`history.replaceState`).

---

## Theme Resolution & Shared Content Model
```
ADMIN CMS (Firestore / REST)
       ↓
PUBLISHED CONTENT
       ↓
UNIFIED THEME CONFIG (themeMode: "paper" | "spatial")
       ↓
THEME RENDERER
  ├── "paper"   → Paper Background & Stacked Section Layout
  └── "spatial" → Spatial Background & Spatial Scene Manager
```

---

## Animation, Motion Blur, & Glassmorphism
- **Framer Motion**: Drives GPU-composited 3D transitions (`transform`, `opacity`, `scale`, `rotateX`).
- **Motion Blur**: Inherits Admin `motionBlurConfig`. During scene transitions, dynamic motion blur filters are applied.
- **Glassmorphism**: Inherits Admin `glassConfig`. Scene surfaces automatically apply backdrop blur, edge highlights, and transparency based on active glass tokens.
- **Color Palettes**: Dynamically inherits `--background`, `--foreground`, `--surface`, `--accent`, `--accent-strong` from Admin color themes.

---

## Performance & Optimization
- **Active Scene**: Fully rendered, interactive, full GPU composite.
- **Nearby Scenes**: Lightweight prepared containers.
- **Distant Scenes**: Off-DOM / minimal element rendering to prevent unnecessary memory consumption.
- **Will-Change & GPU Compositing**: Applied to background light nodes and scene card transforms.

---

## Accessibility & Reduced Motion
- Full keyboard access for screen readers and keyboard users.
- `prefers-reduced-motion: reduce` or `motionMode === "reduced"` automatically disables 3D zoom/rotate camera movements, replacing them with subtle crossfades.
- All semantic HTML tags (`<section>`, `<h1>`, `<h2>`, `<nav>`) remain intact inside every scene.

---

## Mobile Experience
- Fixed viewport (`100dvh`) touch swipe gesture navigation with touch thresholds.
- Responsive spatial card scaling and mobile drawer navigation.

---

## SEO & Discoverability
- Direct hash routing (`#about`, `#projects`, etc.) and deep routes (`/projects`, `/proof-mode`) remain fully functional.
- Content remains standard semantic HTML in the DOM for search engine crawlers.

---

## Fallback Safety
- If Theme 02 encounters an unexpected runtime or WebGL error, `<SpatialErrorBoundary />` automatically catches it and falls back safely to Theme 01 Paper Layout.
- Admin can instantly toggle between Theme 01 and Theme 02 without database migration.

---

## Admin Controls & Live Preview
- **Admin Dashboard -> Color Themes**: Top banner allows Admin to select `[ Theme 01 — Paper ]` or `[ Theme 02 — Spatial Cinematic ]`.
- **Live Preview**: Admin Live Website Preview uses `<ThemeRenderer />`, enabling live preview testing of Theme 02 with draft section ordering, block edits, color palettes, and glass settings.

---

## Files Created & Modified

### New Files Created
- [SpatialBackground.tsx](file:///r:/Repo/portofolio/app/components/spatial/SpatialBackground.tsx)
- [SpatialScene.tsx](file:///r:/Repo/portofolio/app/components/spatial/SpatialScene.tsx)
- [SpatialSceneManager.tsx](file:///r:/Repo/portofolio/app/components/spatial/SpatialSceneManager.tsx)
- [SpatialHeader.tsx](file:///r:/Repo/portofolio/app/components/spatial/SpatialHeader.tsx)
- [SpatialFooter.tsx](file:///r:/Repo/portofolio/app/components/spatial/SpatialFooter.tsx)
- [SpatialErrorBoundary.tsx](file:///r:/Repo/portofolio/app/components/spatial/SpatialErrorBoundary.tsx)
- [SpatialWebsiteView.tsx](file:///r:/Repo/portofolio/app/components/spatial/SpatialWebsiteView.tsx)
- [ThemeBackground.tsx](file:///r:/Repo/portofolio/app/components/ThemeBackground.tsx)
- [ThemeRenderer.tsx](file:///r:/Repo/portofolio/app/components/ThemeRenderer.tsx)
- [THEME_02_SPATIAL_CINEMATIC.md](file:///r:/Repo/portofolio/THEME_02_SPATIAL_CINEMATIC.md)

### Modified Files
- [types.ts](file:///r:/Repo/portofolio/app/lib/types.ts)
- [themeResolver.ts](file:///r:/Repo/portofolio/app/lib/themeResolver.ts)
- [layout.tsx](file:///r:/Repo/portofolio/app/layout.tsx)
- [page.tsx](file:///r:/Repo/portofolio/app/page.tsx)
- [ThemesTab.tsx](file:///r:/Repo/portofolio/app/admin/dashboard/components/ThemesTab.tsx)
- [LiveWebsitePreview.tsx](file:///r:/Repo/portofolio/app/components/LiveWebsitePreview.tsx)
