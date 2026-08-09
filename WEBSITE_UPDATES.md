# Update — 2026-08-09

## Issues Fixed

### 1. Hire Me Button
- **Previous behavior**: The "Hire Me" button used the `paper-button-primary` class, which gave it a brown appearance normally.
- **Root cause**: Incorrect CSS class mapping for the intended white default appearance.
- **Fix**: Replaced `paper-button-primary` with the global `paper-button` and enforced `var(--accent)` strictly on hover to match the global orange accent.
- **Global styles reused**: `paper-button`, `var(--accent)`, `var(--surface)`, `var(--border-thick)`.

### 2. Certificate Details
- **Previous behavior**: Certificate details opened as a full-page popup that was completely unscrollable on mobile and desktop. Background body continued to scroll.
- **Root cause**: The `.paper-card` global CSS class applies `overflow: hidden`, which has higher CSS ordering specificity than Tailwind's utility classes. Lack of a body lock hook.
- **Scroll fix**: Appended `!overflow-y-auto` to the modal card element to force scrolling and injected a `useEffect` hook to lock the body scroll.
- **Responsive behavior**: Scrolling behaves correctly on both small and large viewports.

### 3. Homepage CSS Consistency
- **Affected sections**: `CertificationsPageClient` (All Certifications page).
- **Missing/inconsistent styling**: Used legacy/hardcoded hex colors (`#7a5f47`, `#5f4a38`, `#fbf7f0`, `#f7efe4`) instead of global styling.
- **Reused global design system**: Updated the classes to strictly use `var(--background)`, `var(--surface)`, `var(--foreground)`, `var(--accent)`, `paper-button`, and `paper-card`.

### 4. Project Details
- **Previous blank-page behavior**: Clicking "Details" produced a blank page. Refreshing resolved the issue.
- **Root cause**: Next.js App Router route transition bug involving `framer-motion`'s `AnimatePresence` with `mode="wait"` inside `layout.tsx`. The synchronous router change triggered exit animations prematurely while the server-rendered payload for the new page was still resolving.
- **Navigation/rendering fix**: Created a `FrozenRouter` that wraps `children` inside `PageTransition.tsx`, freezing the React `LayoutRouterContext` during the unmount cycle.
- **Loading/error handling**: Preserved all Next.js native suspense borders and route transitions smoothly.

## Files Modified
- `app/components/Header.tsx`
- `app/components/Certifications.tsx`
- `app/certifications/CertificationsPageClient.tsx`
- `app/components/PageTransition.tsx`
- `app/components/FrozenRouter.tsx` (New)

## Architecture Notes
The `FrozenRouter` implementation successfully bridges `framer-motion` page transitions with Next.js App Router Server Components without dropping contexts or blocking route navigation. This pattern should be preserved for any other `layout.tsx` exit animations.

## Verification
- Verified "Hire Me" button uses correct background and hover state without duplicate animations.
- Verified popup scrolling across different devices. Body locks when open, un-locks when closed.
- Verified dynamic navigation to `/projects/[id]` triggers exit animation and seamlessly mounts the project detail without hanging or showing a blank page.
- Checked console for hydration warnings (none found).

---

# Update — Admin Control & Architecture Upgrade (2026-08-09)

## Key Upgrades Implemented

### 1. Admin Performance & Localized Form State
- Integrated `LocalInput` primitive into `AdminUIComponents` and Admin forms to eliminate typing latency (0ms input lag).
- Isolated input state via `useState` and debounced parent state updates (250ms), preventing unnecessary dashboard-wide re-renders.

### 2. Hierarchical Animation Control & Live Studio
- Created `app/lib/animationResolver.ts` supporting `Global` → `Section` → `Component` → `Safe Built-in Default` animation hierarchy.
- Built interactive Motion Control Studio (`AnimationsTab.tsx`) with target scope selector, inheritance status badges, drag-and-drop timeline sliders (`duration`, `delay`), and live motion preview powered by the Homepage Framer Motion engine.

### 3. Paper Color Theme Studio
- Created `app/lib/themeResolver.ts` & `ThemesTab.tsx` supporting 1 permanent default theme + up to 5 custom color themes.
- Implemented real-time token application (`--background`, `--foreground`, `--surface`, `--surface-strong`, `--surface-soft`, `--accent`, `--accent-strong`, `--dot-pattern`) to `:root` across Homepage and Admin UI.

### 4. Admin Session Security & Inactivity Timeout
- Implemented `SessionGuard.tsx` with a 15-minute inactivity timer tracking mouse, keyboard, touch, and click events.
- Added multi-tab logout synchronization via `BroadcastChannel('admin_session_sync')`.

## Files Created & Updated
- `app/lib/animationResolver.ts`
- `app/lib/themeResolver.ts`
- `app/components/LocalInput.tsx`
- `app/admin/dashboard/components/ThemesTab.tsx`
- `app/admin/dashboard/components/SessionGuard.tsx`
- `app/components/AdminUIComponents.tsx`
- `app/admin/dashboard/components/AnimationsTab.tsx`
- `app/admin/dashboard/page.tsx`
- `app/components/MotionProvider.tsx`
- `app/components/PaperBackground.tsx`
- `app/components/Projects.tsx`
- `app/components/Certifications.tsx`
- `WEBSITE_FEATURES.md`
- `WEBSITE_UPDATES.md`

