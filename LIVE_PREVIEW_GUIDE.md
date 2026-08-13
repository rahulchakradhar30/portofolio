# True Live Website Preview — Section Builder & CMS Editor

## Purpose
The Section Builder & CMS Editor incorporates a **True Live Website Preview**. Rather than rendering a simulated wireframe or fake card approximation, the Admin editor embeds the **actual production website renderer** (`Header`, `SectionRegistry`, `BlockRegistry`, `Hero`, `About`, `StudyRoadmap`, `PortfolioRadar`, `Experience`, `Skills`, `Projects`, `Certifications`, `Contact`, `Footer`) directly inside the editor canvas.

---

## Architecture & Data Flow

```
ADMIN EDITOR (Keystrokes / Layout / Styling)
        ↓
IN-MEMORY LOCAL DRAFT STATE (draftHomepageConfig)
        ↓
DRAFT PORTFOLIO CONTENT PROVIDER (PortfolioContentProvider override)
        ↓
ACTUAL PRODUCTION WEBSITE RENDERER (SectionRegistry + Production Components)
        ↓
TRUE LIVE WEBSITE PREVIEW (Desktop / Tablet / Mobile Viewports)
```

---

## Key Differences from Mock Previews

| Feature | Previous Mock Preview | True Live Website Preview |
| :--- | :--- | :--- |
| **Renderer** | Simulated JSON card approximations | **Same production React components** used on live site |
| **Styling** | Static preview CSS | **Exact design tokens**, Paper Layout, Glassmorphism & theme tokens |
| **Animations** | Unanimated static blocks | **Framer Motion animations**, delays, stagger effects |
| **Network Overhead** | Saved on keystroke / polling | **Zero network calls** during editing; pure local reactivity |
| **Selection Sync** | Manual list selection | **Interactive canvas clicking**; click section to edit |

---

## Responsive Viewport Switcher

Admin can switch between device viewports directly in the editor toolbar:

1. **Desktop Viewport (`w-full`)**: Renders standard full-width desktop layout with multi-column card grids, horizontal headers, and wide paper surfaces.
2. **Tablet Viewport (`768px`)**: Renders 2-column tablet layouts and tablet navigation controls inside a device container.
3. **Mobile Viewport (`375px`)**: Renders single-column mobile layouts, mobile drawer navigation, and touch-friendly timeline connectors with zero horizontal page overflow.

---

## Editor Selection Overlays

When a section is active or hovered inside the Live Preview, an editor-only selection overlay appears:

`#section-id (Selected)` or `#section-id (Click to edit)`

Clicking any section directly inside the preview canvas automatically focuses its corresponding editor controls in the left control panel.

> [!NOTE]
> Editor selection overlays are client-side overlays rendered only inside the Admin editor. They **NEVER** appear on the public website.

---

## Draft State vs. Published State

- **Keystrokes & Tweaks**: When Admin edits text, headings, font colors, font weight, spacing, alignment, shadows, borders, section order, visibility, or layout modes, the preview updates instantly in local memory.
- **Reset Draft**: Clicking **Reset Draft** discards unsaved local changes and reverts the preview to the last published production configuration.
- **Publish Layout**: Clicking **Publish Layout** validates the draft, sends `homepageConfig` via `PUT` to `/api/admin/content`, updates Firestore, and triggers site-wide public reactive updates.

---

## Performance Optimization

- **Zero-Latency Rerendering**: Local draft updates mutate React state in memory without triggering Firestore network traffic or page reloads.
- **Memoized Section Pipeline**: Active visible sections and draft portfolio content objects are memoized via `useMemo()`.
- **Viewport Frame Isolation**: Device previews are contained within an isolated scrollable canvas (`max-h-[85vh]`).

---

## Files Created
- `app/components/LiveWebsitePreview.tsx`
- `LIVE_PREVIEW_GUIDE.md`

## Files Modified
- `app/components/PortfolioContentProvider.tsx`
- `app/admin/dashboard/components/HomepageBuilderTab.tsx`

---

## Automated & Manual Test Results
- **TypeScript compilation**: Passed with 0 errors (`npx tsc --noEmit`).
- **Next.js Production Build**: Passed successfully (`npm run build`).
- **Real-Time Keystrokes**: Typing text, changing section sequence, toggling visibility, and switching layout modes (`Vertical` vs `Horizontal / Snake`) update the live preview renderer instantly.
- **Publish & Discard Flow**: Verified that unsaved draft edits remain isolated from the live website until **Publish Layout** is clicked.
