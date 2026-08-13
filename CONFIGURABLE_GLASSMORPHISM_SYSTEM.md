# Configurable Glassmorphism Design System

## Overview & Purpose

The **Configurable Glassmorphism Design System** is an admin-controlled visual layer introduced to elevate component surfaces across the portfolio while maintaining the permanent foundation of the **Paper Layout** design system.

Rather than hardcoding translucency, backdrop blurs, or custom borders into individual components, this system derives all glass styling dynamically from:
1. **Active Admin Theme Colors** (background, surface, text, accent)
2. **Admin Glassmorphism Settings** (master toggle, presets, fine-tuning controls, component overrides)

---

## Visual Hierarchy

```
EXISTING PAPER LAYOUT
        +
ADMIN-CONTROLLED THEME COLORS
        +
OPTIONAL GLASSMORPHISM
        ↓
PREMIUM COMPONENT SURFACES
```

When Glassmorphism is **OFF**:
- The website displays 100% classic Paper Layout appearance.

When Glassmorphism is **ON**:
- Registered components (`Navbar`, `Projects`, `Certifications`, `Skills`, `Proof Mode`, `Modals`, `Detail Pages`) receive theme-adaptive glass surfaces.

---

## Central Token & Resolver Architecture

The system is powered by `app/lib/glassResolver.ts`:
- **`normalizeGlassConfig(input)`**: Validates and normalizes raw database configuration.
- **`resolveGlassTokens(themeTokens, glassConfig)`**: Calculates RGBA translucent surface tints, fine border alphas, top highlight glows, saturation multipliers, and drop shadows.
- **`applyGlassTokensToDOM(themeTokens, glassConfig)`**: Injects CSS variables onto `:root` (`--glass-bg`, `--glass-border`, `--glass-blur`, `--glass-shadow`, `--glass-highlight`) and updates `html[data-glass="true|false"]`.

---

## Admin CMS Controls (`GlassmorphismTab.tsx`)

Located at **Admin Dashboard → Glass Design**:

1. **Master Switch**: `Enable Glassmorphism [ ON / OFF ]`
2. **Presets**:
   - `Paper Glass`: Subtle translucent paper tint (8px blur, 75% surface alpha)
   - `Soft Glass`: Balanced frosted glass (14px blur, 60% surface alpha)
   - `Deep Glass`: Strong modern glass depth (20px blur, 45% surface alpha)
   - `Custom`: Fine-tuning sliders
3. **Fine-Tuning Controls**:
   - Backdrop Blur Slider (4px - 24px)
   - Surface Alpha / Transparency Slider (10% - 95%)
   - Glass Intensity Slider (10% - 100%)
   - Border Strength Slider (5% - 80%)
   - Surface Contrast Slider (10% - 100%)
   - Elevation Shadow Depth Slider (10% - 100%)
4. **Section & Component Overrides**:
   - Individual section controls for Header, Hero, Projects, Certifications, Skills, Proof Mode, About, and Contact.
5. **Live Glass Preview Panel**:
   - Interactive preview displaying real-time updates of active theme colors and glass token adjustments.

---

## Performance & Accessibility Strategy

1. **GPU Composited Layers**: Glass surfaces use `will-change: transform, backdrop-filter` to prevent unnecessary repaints during scrolling.
2. **Mobile Optimization**: On viewports `<640px`, backdrop blur is capped to `min(var(--glass-blur), 10px)` to protect mobile frame rates.
3. **Browser Fallbacks**: `@supports not (backdrop-filter: blur(1px))` provides graceful translucent/solid fallbacks.
4. **Reduced Motion**: Respects `prefers-reduced-motion` and `html[data-motion="reduced"]` without disabling static glass legibility.
5. **Contrast Safeguards**: Text contrast is preserved through automated minimum surface alpha rules.

---

## Files Created & Modified

### Created
- `app/lib/glassResolver.ts`: Token derivation engine and DOM synchronizer.
- `app/components/GlassSurface.tsx`: Wrapper component & `useGlassSurface` hook.
- `app/admin/dashboard/components/GlassmorphismTab.tsx`: Admin CMS tab with live preview.
- `CONFIGURABLE_GLASSMORPHISM_SYSTEM.md`: Complete system documentation.

### Modified
- `app/lib/types.ts`: Added `glassConfig` to `PortfolioContent` and glass interfaces.
- `app/globals.css`: Added CSS token defaults, `.glass-surface` system, and media queries.
- `app/components/MotionProvider.tsx`: Synchronizes glass tokens alongside theme tokens.
- `app/admin/dashboard/page.tsx`: Registered `Glass Design` tab in Admin menu.
- `app/admin/dashboard/components/ThemesTab.tsx`: Updated theme changes to re-sync glass tokens.
- Registered Components: `Header.tsx`, `Projects.tsx`, `Certifications.tsx`, `Skills.tsx`, `About.tsx`, `Hero.tsx`, `ProofModeEntry.tsx`, `Contact.tsx`, `CommandPalette.tsx`, `ProjectDetailClient.tsx`, `CertificationDetailClient.tsx`.
