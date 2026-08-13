# True Live Website Preview & Resizable Split-Pane Editor

## Purpose
The Section Builder & CMS Editor incorporates a **Professional Resizable Split-Pane Editor** and **True Live Website Preview**. Rather than rendering a simulated wireframe or fake card approximation, the Admin editor embeds the **actual production website renderer** (`Header`, `SectionRegistry`, `BlockRegistry`, `Hero`, `About`, `StudyRoadmap`, `PortfolioRadar`, `Experience`, `Skills`, `Projects`, `Certifications`, `Contact`, `Footer`) directly inside an interactive, resizable editor canvas.

---

## Architecture & Data Flow

```
ADMIN EDITOR (Keystrokes / Layout / Styling / Drag Resize)
        ↓
IN-MEMORY LOCAL DRAFT STATE (draftHomepageConfig)
        ↓
DRAFT PORTFOLIO CONTENT PROVIDER (PortfolioContentProvider override)
        ↓
ACTUAL PRODUCTION WEBSITE RENDERER (SectionRegistry + Production Components)
        ↓
TRUE LIVE WEBSITE PREVIEW (Desktop / Tablet / Mobile / Fit-to-View)
```

---

## Key Features

### 1. Resizable Split-Pane
- **Draggable Divider**: A horizontal drag handle with `col-resize` cursor and `GripVertical` indicator allows dragging left or right to adjust the sidebar width dynamically.
- **Constraints**: Minimum sidebar width (320px) and maximum sidebar width (55% of workspace width up to 720px) prevent broken layouts or squeezed previews.

### 2. Collapsible Editor Sidebar
- **Collapse Toggle**: Admin can click `[Collapse]` (`PanelLeftClose`) to fold away the left editor panel and view the Live Website Preview in 100% full width.
- **Floating Reopen Toggle**: When collapsed, a prominent `[Open Editor Controls]` button allows instant reopening at the previous sidebar width.

### 3. Local UI Preferences Persistence
- `sidebarWidth`, `sidebarCollapsed`, `fitToView`, `viewportMode`, and `viewLayout` choices are persisted in `localStorage` (`homepage_builder_ui_prefs`) for seamless workflow sessions across page reloads.

### 4. Viewport Switcher & Fit-to-View
- **Desktop (`w-full`)**: Standard full-width desktop website preview.
- **Tablet (`768px`)**: 2-column tablet layout container.
- **Mobile (`375px`)**: 375px mobile viewport with single-column connectors.
- **Fit Mode (`[Fit]`)**: Auto-scales preview viewports cleanly inside narrow panels.

### 5. Independent Scroll Containers
- Left Editor Panel and Right Live Preview Panel have independent vertical scrollbars (`max-h-[calc(100vh-210px)] overflow-y-auto`). Scrolling the preview does not scroll the editor form, eliminating nested scroll jumping.

### 6. Interactive Click-to-Select
- Clicking any section (`#section-id`) in the Live Preview highlights it with an editor outline (`#section-id [Selected]`) and focuses its settings in the left panel.

---

## Draft State vs. Published State

- **Keystrokes & Tweaks**: When Admin edits text, headings, font colors, font weight, spacing, alignment, shadows, borders, section order, visibility, or layout modes, the preview updates instantly in local memory.
- **Reset Draft**: Clicking **Reset Draft** discards unsaved local changes and reverts the preview to the last published production configuration.
- **Publish Layout**: Clicking **Publish Layout** validates the draft, sends `homepageConfig` via `PUT` to `/api/admin/content`, updates Firestore, and triggers site-wide public reactive updates.

---

## Files Created & Modified

### Created Files
- `app/components/LiveWebsitePreview.tsx`
- `LIVE_PREVIEW_GUIDE.md`

### Modified Files
- `app/components/PortfolioContentProvider.tsx`
- `app/admin/dashboard/components/HomepageBuilderTab.tsx`

---

## Automated & Manual Test Results
- **TypeScript compilation**: Passed with 0 errors (`npx tsc --noEmit`).
- **Next.js Production Build**: Passed successfully (`npm run build`).
- **Split-Pane Resizing**: Dragging the divider left/right resizes panels smoothly within bounds.
- **Sidebar Collapse & Reopen**: Collapsing expands preview to 100% width; reopening restores exact sidebar width.
- **Real-Time Keystrokes**: Edits to text, colors, layout modes (`Vertical` vs `Horizontal / Snake`), section reordering, and visibility toggling update the live preview instantly.
- **Publish & Discard Flow**: Unsaved draft edits remain strictly isolated from public visitors until **Publish Layout** is clicked.
