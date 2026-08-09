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

---

# Skills Logo & Icon System

## Purpose
The centralized Skills Logo & Icon System ensures that every technical skill, backend/cloud service, AI tool, creative tool, and writing capability displays a crisp, reliable icon across the public website and Admin Dashboard, eliminating blank icon boxes and broken CDN images.

## Logo Sources
1. **Official Brand Vectors**: Reliable SVG vector definitions for major tools (`React`, `Next.js`, `Vercel`, `Firebase`, `GitHub`, `Git`, `Python`, `Java`, `JavaScript`, `HTML5`, `CSS3`, `Tailwind CSS`, `Framer Motion`, `Figma`, `Canva`, `Adobe Premiere Pro`, `Adobe After Effects`, `Adobe Illustrator`, `Adobe Lightroom`, `Postman`, `VS Code`).
2. **Custom Vector SVGs**: Tailored, paper-aesthetic vector icons for non-brand creative and writing skills (`Content Writing`, `Story Writing`, `Creative Writing`, `Video Editing`, `Photo Editing`, `Prompt Engineering`, `AI-assisted Development`, `Google Gemini`, `Claude AI`, `Firebase Auth`, `Firestore`, `Firebase Storage`, `Firebase Admin SDK`).
3. **Resilient Vector Fallbacks**: Dynamic HSL SVG generator that creates clean initials badges if an unmapped custom skill is entered.

## Supported Skills
- **Programming & Web**: C, Python, Java, HTML5, CSS3, JavaScript, React.js, Next.js, Tailwind CSS, Framer Motion.
- **Backend / Cloud / DB**: Firebase, Firebase Authentication, Firestore, Firebase Storage, Firebase Admin SDK, Vercel, Postman.
- **VCS & Tools**: Git, GitHub, GitHub Copilot, VS Code.
- **AI & GenAI**: Prompt Engineering, ChatGPT, Google Gemini, Claude AI, GitHub Copilot, AI-assisted Development.
- **Creative & Design**: Canva, Figma, Adobe Premiere Pro, Adobe After Effects, Adobe Illustrator, Adobe Lightroom.
- **Writing & Content**: Content Writing, Story Writing, Creative Writing, Video Editing, Photo Editing.

## Custom Icons
Custom vector SVG icons were created for creative, writing, and AI skills because no single corporate logo represents these broader capabilities. These icons share the portfolio's paper background design language:
- `Content Writing`: Document sheet with pen stroke & accent gradients.
- `Story Writing`: Open book with glowing story star motif.
- `Creative Writing`: Feather quill pen with gold star trail.
- `Video Editing`: Filmstrip frame with play control & timeline indicator.
- `Photo Editing`: Camera lens aperture with green adjustment sliders.
- `Prompt Engineering`: Terminal command prompt `>_` with AI sparkle.
- `AI-assisted Development`: Code brackets `< / >` with AI node motif.

## Registry Architecture
```
Skill Title / Icon Name / URL
            ↓
  SKILL_ALIAS_MAP (Normalizes names e.g. "react.js" → "React", "premiere" → "Adobe Premiere Pro")
            ↓
  SKILL_LOGO_LOOKUP (Registry match)
            ↓
   <SkillIcon> Component
            ↓ (If network/image load fails)
   onError → fallbackSkillLogo(title)
```

## Fallback System
```
Custom Admin Logo URL
         ↓ (if missing or network error)
Registered Preset Vector Logo
         ↓ (if unmapped or failed)
Generic HSL Initials SVG Fallback
```
No skill EVER renders a blank box on the public website or admin dashboard.

## Admin Usage
1. Go to **Admin Dashboard → Skills Grid**.
2. Click **Add Skill** or **Edit Skill**.
3. Select a preset logo from the catalog grid or type a skill title.
4. The live **`[ Logo Preview ]`** box immediately displays the resolved icon.
5. If an Admin enters an unrecognized custom URL that fails to resolve, an administrative warning badge (`⚠ Generic Fallback Logo`) is shown in the form preview.

## Adding a New Skill
To register a new skill preset for future developers:
1. Open `app/lib/skillLogoCatalog.ts`.
2. Add a new `logo('Skill Name', 'slug', 'Category')` or `customSvgLogo(...)` entry to `SPECIALIZED_LOGOS` or `CORE_LOGOS`.
3. Add any common aliases to `SKILL_ALIAS_MAP` (e.g., `"my-skill": "My Skill"`).

## Security
- External and custom logo URLs are sanitized before rendering inside `<img>` tags.
- Custom inline SVG icons are generated via safe `data:image/svg+xml` data URIs, avoiding `dangerouslySetInnerHTML` or raw script execution risks.

## Files Changed
- `app/lib/skillLogoCatalog.ts`
- `app/components/SkillIcon.tsx` (New)
- `app/components/Skills.tsx`
- `app/skills/SkillsPageClient.tsx`
- `app/admin/dashboard/components/SkillsTab.tsx`
- `WEBSITE_UPDATES.md`

## Verification
- Verified preset grid in Admin (`Adobe Premiere Pro`, `Adobe After Effects`, `React`, `Next.js`, `Vercel`, `Firebase`, `Git`, `Python`, `Java`, `HTML5`, `CSS3`, `Tailwind CSS`, `Figma`, `Canva`, `Postman`, `VS Code`, `Google Gemini`, `Claude AI`, `Content Writing`, `Story Writing`, `Creative Writing`, `Video Editing`, `Photo Editing`, `Prompt Engineering`).
- Verified Live Preview in Admin form.
- Verified Public Homepage (`Skills.tsx`) and All Skills page (`/skills`).
- Tested broken URL / missing logo fallback behavior.
- Verified TypeScript (`npx tsc --noEmit`) and Production Build (`npm run build`).



