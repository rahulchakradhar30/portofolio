# Homepage Content & Layout Builder

## Why This System Exists
The Homepage Content & Layout Builder evolves the portfolio's static content management system into a data-driven content, section, and block management architecture. It enables the site administrator to manage section sequence, visibility, navbar links, visual cards, journey/roadmap stages, metric grids, highlight callouts, buttons, and custom sections without modifying source code or compromising existing Paper Layout aesthetics, Framer Motion micro-animations, or security.

---

## Architecture
The system follows a strict, unidirectional configuration pipeline:

```
ADMIN CMS (Homepage Builder)
        ↓
PUBLISHED FIRESTORE MODEL (portfolio_content -> homepageConfig)
        ↓
API / REACTIVE CONTEXT (PortfolioContentProvider & Rest API)
        ↓
SECTION REGISTRY (Built-in + Custom Section Routers)
        ↓
BLOCK REGISTRY (Paper Card, Timeline, Metric, Callout, Button Renderers)
        ↓
PUBLIC HOMEPAGE (app/page.tsx & Header.tsx)
```

---

## Section Registry
The `SectionRegistry` (`app/components/SectionRegistry.tsx`) maps section IDs to production React components:
- **Built-in Sections:**
  - `hero` -> `Hero.tsx` (#home)
  - `about` -> `About.tsx` (#about)
  - `roadmap` -> `StudyRoadmap.tsx` (#roadmap)
  - `radar` -> `PortfolioRadar.tsx` (#radar)
  - `skills` -> `Skills.tsx` (#skills)
  - `projects` -> `Projects.tsx` (#projects)
  - `certifications` -> `Certifications.tsx` (#certifications)
  - `contact` -> `Contact.tsx` (#contact)
- **Custom Sections:**
  - `custom-*` -> `CustomSectionRenderer.tsx` (#custom-id)

Built-in section components remain intact, while optional Admin-configured blocks are appended to built-in sections dynamically.

---

## Block Registry
The `BlockRegistry` (`app/components/blocks/BlockRegistry.tsx`) renders structured block schemas:
1. `heading` — H2, H3, H4 headings with typography styling
2. `paragraph` / `rich_text` — Editorial body text with bold, italic, underline, color options
3. `button` / `button_group` — CTA button groups with style presets and safe URL sanitization
4. `highlight_box` — Editorial callout box with icon and paper layout shadow
5. `stat_box` — Metric/stat highlight box with badge and subtext
6. `metric_grid` — Grid of metric cards with labels, stats, and action buttons
7. `card_grid` / `card` — Interactive cards with images, badges, tags, and buttons
8. `timeline_group` — Sequential journey/roadmap cards with connecting visual lines and metrics
9. `tag_group` — Badge/capability tag clusters
10. `image` — Image block with caption and alt text
11. `divider` — Paper layout horizontal separator line

---

## Built-in Sections
Built-in sections cannot be destroyed or deleted, protecting production components. However, Admin can:
- Reorder their position on the homepage
- Toggle public visibility (Show/Hide)
- Customize display title & navbar label
- Toggle visibility in navbar
- Append extra content blocks

---

## Custom Sections
Admin can create brand new dynamic homepage sections:
- Custom section ID, internal name, display title, navbar label
- Layout preset (`paper`, `hero`, `timeline`, `grid`, `standard`)
- Background treatment (`default`, `soft`, `strong`, `glass`)
- Animation preset (`fade`, `slide`, `scale`)
- Full Block CRUD (Add, Edit, Reorder, Duplicate, Delete blocks inside section)
- Custom sections can be duplicated or deleted safely.

---

## Buttons
Buttons are configured via `BlockButton` schemas:
- **Destinations:** Internal route (`/proof-mode`), Section hash (`#projects`), External URL (`https://...`), Email (`mailto:...`).
- **Safety:** Protocol validation rejects `javascript:`, `data:`, or unsafe scripts.
- **Style Presets:** `primary`, `secondary`, `outline`, `ghost`, `accent`, `proof`.
- **Iconography:** Dynamic Lucide SVG icon resolution (zero user-facing emojis).

---

## Cards
Cards support flexible field configurations:
- Title, subtitle, description
- Image URL
- Badge & tags
- Stat value & stat label
- Action button
- Responsive column wrapping (1 / 2 / 3 / 4 columns on Desktop/Tablet/Mobile)

---

## Typography
Typography uses project tokens and Tailwind typography utilities:
- Heading levels (`h2`, `h3`, `h4`)
- Font weight (`bold`, `black`, `semibold`)
- Text alignment (`left`, `center`, `right`)
- Text color overrides

---

## Layout
- **Spacing:** Compact (`my-3`), Normal (`my-6`), Spacious (`my-10`)
- **Width:** Narrow, Standard, Wide
- **Alignment:** Left, Center, Right
- **Grid Columns:** 1 / 2 / 3 / 4 columns on desktop, responsive breakdown on tablet & mobile

---

## Navigation
The `Header` component (`app/components/Header.tsx`) reads `homepageConfig.navItems`:
- Admin controls navbar item order and visibility.
- If a section is hidden, its navbar link is automatically suppressed.
- Special items (`Quick Search`, `Proof Mode`, `Hire Me`) remain functional and preserved.

---

## Animation Integration
Reuses the existing Framer Motion animation engine:
- Reduced motion preferences honored via `useMotionPreferences()`.
- Animation presets (`fade`, `slide`, `scale`, `stagger`).

---

## Theme Integration
All dynamic sections and blocks consume existing global theme tokens:
- CSS variables: `var(--foreground)`, `var(--surface)`, `var(--surface-soft)`, `var(--surface-strong)`, `var(--accent)`.
- Reuses Paper Layout styling classes (`paper-card`, `paper-chip`, `paper-button`).

---

## Draft / Publish
- **Draft Mode:** Admin can edit sections, blocks, cards, and navbar settings in real time with live production preview.
- **Publish:** Clicking "Publish Layout" sends `homepageConfig` to `/api/admin/content` via `PUT` request, updating Firestore and triggering immediate site-wide reactive updates.

---

## Database Model
Stored inside the `portfolio_content` collection document in Firestore under `homepageConfig`:

```ts
export interface HomepageConfig {
  version: number;
  sections: HomepageSectionConfig[];
  navItems: NavigationItemConfig[];
  updatedAt?: string;
}
```

---

## Security
- Server-side admin authorization required for all `PUT` updates (`assertAdminSession`).
- Rate limiting enforced on update endpoints (`enforceRateLimit`).
- Strict URL protocol sanitizer filters out `javascript:` or unsafe schemes.
- Raw HTML/JS string execution is prohibited; all rendering occurs through registered React components.

---

## Fallback Behavior
If `homepageConfig` is missing, empty, or invalid:
- `normalizeHomepageConfig` automatically returns default configuration `getDefaultHomepageConfig()`.
- Renders default 8 built-in sections in original order.
- Prevents page crashes or broken navigation.

---

## Responsive Behavior
- Desktop: Multi-column grid support (up to 4 columns).
- Tablet: Auto-adapts to 2 columns.
- Mobile: Single column layout with overflow prevention and touch-friendly targets.

---

## How Admin Creates a New Section
1. Go to Admin Dashboard -> **Homepage Builder**.
2. Click **Add Custom Section**.
3. Enter section title, navbar label, and background treatment.
4. Switch to **Block Builder** sub-tab and select the new section.
5. Add blocks (Heading, Paragraph, Metric Grid, Card Grid, Timeline).
6. Click **Publish Layout**.

---

## How Admin Adds a New Block
1. In Admin Dashboard -> **Homepage Builder**, click **Block Builder** tab.
2. Select target section from dropdown.
3. Click desired block type from palette (e.g., `Highlight Callout` or `Timeline / Journey`).
4. Edit block text, cards, metrics, or timeline stages in inspector panel.
5. Preview block rendering live in panel.
6. Click **Publish Layout**.

---

## How Admin Adds a Button
1. Select target block (Button Group, Card, or Metric Grid).
2. Enter button text, destination type (`hash`, `route`, `url`, `email`), and destination target.
3. Select style preset (`primary`, `secondary`, `outline`, `proof`).
4. Click **Publish Layout**.

---

## How Admin Changes Navbar
1. In Homepage Builder, click **Navbar Controls** tab.
2. Edit nav labels, toggle link visibility, or click **Sync with Active Sections**.
3. Click **Publish Layout**.

---

## How Existing Hardcoded Content Was Migrated
- Built-in sections (`Hero`, `About`, `StudyRoadmap`, `PortfolioRadar`, `Skills`, `Projects`, `Certifications`, `Contact`) were wrapped inside `SectionRegistry`.
- `Header` navigation converted from hardcoded array to dynamic `useMemo` computation.
- Homepage `page.tsx` converted from hardcoded JSX section list to dynamic map over `activeSections`.

---

## Files Created
- `app/lib/homepageConfig.ts`
- `app/components/blocks/BlockRegistry.tsx`
- `app/components/blocks/CustomSectionRenderer.tsx`
- `app/components/SectionRegistry.tsx`
- `app/admin/dashboard/components/HomepageBuilderTab.tsx`
- `HOMEPAGE_CONTENT_BUILDER.md`

---

## Files Modified
- `app/lib/types.ts`
- `app/api/admin/content/route.ts`
- `app/components/Header.tsx`
- `app/page.tsx`
- `app/admin/dashboard/page.tsx`

---

## Testing & Verification
- TypeScript compilation: Passed cleanly (`npx tsc --noEmit`).
- Production build: `npm run build` executed successfully.
- Public homepage: All sections render in published order with animations and paper layout intact.
- Mobile navigation: Tested drawer navigation and responsive block layouts.
