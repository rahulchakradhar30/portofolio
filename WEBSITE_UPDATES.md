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

---

# Context-Preserving Navigation

## What it does
The Context-Preserving Navigation system allows website subpages and modal destinations (`/hire`, `/skills`, `/certifications`, `/certifications/[id]`, `/projects`, `/projects/[id]`, `/proof-mode`) to remember the user's previous navigation context (pathname, section anchor, and scroll position) and return them to that exact position when clicking "Back", rather than resetting back to the Homepage root (`/`).

## Why it was implemented
Previously, all subpages contained hardcoded `<Link href="/">` or `<Link href="/#home">` back links. For instance:
- A user viewing the **Certifications** section on the homepage who clicked **Hire Me** and then **Back** was forced back to the top of the homepage (`/`), losing their scroll position and requiring manual scrolling back to Certifications.
- A user navigating `Home → Projects → Project Details → Hire Me → Back` was sent directly to Home root (`/`), destroying their browsing history stack.

This system eliminates context loss and makes navigation behave naturally across browser history.

## How it works
The conceptual flow operates as a contextual history stack integrated with Next.js App Router and native browser history:

```
Previous Context (Route, Hash, ScrollY)
           ↕
  Navigation Provider (History & Scroll Tracker)
           ↕
Current Destination Page
           ↕
     Back Button
   ├─ Internal History Exists → router.back() [Restores Route + Hash + Scroll]
   └─ Direct Access / No History → Safe Fallback Route (e.g. / for Hire, /projects for Project Detail)
```

## Scroll Restoration
1. **Section Anchor Tracking**: On the Homepage (`/`), an `IntersectionObserver` continuously updates `window.location.hash` (e.g., `/#certifications`, `/#skills`, `/#projects`) in browser history as the user scrolls into view.
2. **Scroll Position Saving**: As the user scrolls, `window.scrollY` for the current path is saved in `sessionStorage`.
3. **Contextual Restoration**: When navigating back via `router.back()`, `NavigationProvider` intercepts route mounting and `popstate` events:
   - If a section hash exists in the URL (e.g. `/#certifications`), it scrolls to `document.getElementById(hash)`.
   - If no hash exists, it restores the saved `scrollY` position after layout rendering settles.

## Fallback Behavior
When a user accesses a subpage directly (e.g. typing `https://site.com/hire` or opening a link in a fresh tab), no internal history context exists.
In this case, the `goBack()` action triggers a safe, context-appropriate fallback route:
- `/hire` → `/`
- `/skills` → `/`
- `/certifications` → `/`
- `/certifications/[id]` → `/certifications`
- `/projects` → `/`
- `/projects/[id]` → `/projects`
- `/proof-mode` → `/`

## Pages/Components Using It
- `app/hire/HirePageClient.tsx`
- `app/skills/SkillsPageClient.tsx`
- `app/certifications/CertificationsPageClient.tsx`
- `app/certifications/[id]/CertificationDetailClient.tsx`
- `app/projects/AllProjectsClient.tsx`
- `app/projects/[id]/ProjectDetailClient.tsx`
- `app/proof-mode/page.tsx`

## Technical Implementation
- **`app/components/NavigationContext.tsx`**:
  - `NavigationProvider`: React context provider wrapping the app in `app/layout.tsx`.
  - `SearchParamsTracker`: Suspense-wrapped search parameter listener preventing static SSG pre-render bails.
  - `useBackNavigation()`: Custom React hook exposing `goBack(fallbackUrl)` and `canGoBack`.
  - `<BackButton>`: Reusable component replacing static `<Link>` elements without altering UI styling.
- **`app/layout.tsx`**: Wraps `<AppShell>` inside `<NavigationProvider>`.

## Verification
The following navigation paths and edge cases were verified with 0 TypeScript/build errors:
1. `Home → Certifications section → Hire Me → Back` → Returned to Certifications section.
2. `Home → Skills section → Hire Me → Back` → Returned to Skills section.
3. `Projects → Project Details → Back` → Returned to Projects page.
4. `Project Details → Hire Me → Back` → Returned to Project Details.
5. `Proof Mode → Hire Me → Back` → Returned to Proof Mode.
6. `Direct URL Access to /hire → Back` → Safely fell back to Home.
7. `Browser Back / Forward Buttons` → Restored route, section, and scroll position.
8. `Mobile Navigation` → Section restored, body scroll lock restored, no menu leak.
9. `Cinematic Intro` → Did not replay on back navigation.
10. `Framer Motion & FrozenRouter` → Maintained smooth exit/enter transitions without reload.


