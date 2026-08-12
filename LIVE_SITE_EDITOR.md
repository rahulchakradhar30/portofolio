# Live Site Editor & Theme Synchronization Architecture

## Purpose
The Live Site Layout Editor and Theme Synchronization architecture allows authorized portfolio administrators to visually customize the public website layout, section ordering, visibility, spacing, project grid configuration, typography formatting, and animation overrides in real time, while enforcing single-source-of-truth theme inheritance across all public pages and sub-routes.

## Architecture

```
[ ADMIN LIVE SITE EDITOR ]
          │
  staged local draft
          │
   (Live Preview)
          │
     Publish (PUT /api/admin/content)
          │
          ▼
   [ DATABASE / FIRESTORE ]
   (portfolio_content.siteEditorConfig)
          │
          ▼
 [ PORTFOLIO CONTENT PROVIDER ]
          │
  [ ROOT CSS CUSTOM PROPERTIES ]
          │
   ┌──────┴─────────────────────────────────┐
   ▼                                        ▼
[ HOMEPAGE ]                         [ DETAIL PAGES ]
- SectionRenderer                     - Project Details
- Hero, About, Roadmap, Radar,       - Certification Details
  Skills, Projects, Certifications,   - Skills Page, All Projects, Hire
  Contact                             - Inherit :root CSS Variables
```

## Theme Synchronization
- **Single Source of Truth**: Active theme tokens (`background`, `surface`, `surfaceSoft`, `surfaceStrong`, `foreground`, `accent`, `accentStrong`) are managed centrally in `PortfolioContentProvider` / `MotionProvider` via `applyThemeTokensToDOM`.
- **CSS Custom Properties**: Detail pages (`/projects/[id]`, `/certifications/[id]`, `/skills`, `/projects`, `/hire`) consume CSS custom variables (`var(--background)`, `var(--surface)`, `var(--surface-soft)`, `var(--foreground)`, `var(--accent)`) and paper system styling classes (`paper-card`, `paper-button`, `paper-chip`, `paper-button-primary`).
- **Result**: Selecting or modifying a theme in Admin dynamically updates every public route, page, and sub-view without theme divergence.

## Section Ordering & Visibility
- Homepage section order is stored in `siteEditorConfig.sectionOrder`.
- Standard section IDs: `hero`, `about`, `roadmap`, `radar`, `skills`, `projects`, `certifications`, `contact`.
- `SectionRenderer` dynamically renders sections based on published or staged draft order.
- Section visibility (`visible: true/false`) hides sections without destroying source components or content.

## Layout & Responsive Controls
- **Spacing**: `compact`, `normal`, `large`.
- **Width**: `narrow` (`max-w-4xl`), `standard` (`max-w-7xl`), `wide` (`max-w-[1600px]`).
- **Alignment**: `left`, `center`, `right`.
- **Project Grid Controls**:
  - Desktop: 1, 2, 3, or 4 columns.
  - Tablet: 1, 2, or 3 columns.
  - Mobile: 1 or 2 columns.

## Typography Controls
- Granular controls for editable text and headings:
  - Font color palette (theme defaults or custom hex)
  - Bold toggle `[ B ]`
  - Italic toggle `[ I ]`
  - Underline toggle `[ U ]`
  - "Reset to Global Theme" mechanism
- `FormattedText` component renders typography overrides cleanly while defaulting to global theme styles.

## Animation Controls
- Seamlessly integrated with existing Framer Motion provider (`MotionProvider`).
- Configures section animation types (`fade`, `slide`, `scale`, `reveal`, `stagger`, `float`), duration, and delay without creating a duplicate animation engine.

## Responsive Controls & Preview
- Responsive viewport switcher in Admin Live Editor:
  - Desktop (100% width)
  - Tablet (768px width)
  - Mobile (375px width)
- Staged Live Preview frame allows instant visual feedback before committing changes.

## Draft / Publish & Reset
- Staged edits remain in local Admin memory during session editing.
- **Save / Publish**: Persists published configuration to `/api/admin/content`.
- **Reset to Published**: Restores staged state to match live published database configuration.
- **Reset Defaults**: Restores factory default section ordering and layout parameters.

## Database Storage & Security
- Stored inside `portfolio_content.siteEditorConfig` in Firestore/Backend.
- Read operations are public for site rendering.
- Write operations strictly require authenticated Admin session verification via `/api/admin/content`.

## Performance
- Zero polling or continuous network fetching.
- Public site reads cached configuration once via `PortfolioContentProvider`.
- Component updates use React state transitions and CSS custom properties for lightweight compositing.

---

# Emoji to SVG Migration Audit

## Reason
To uphold a cohesive, professional, premium editorial aesthetic and eliminate arbitrary OS-dependent raster emojis across the user-facing site and admin interface.

## Search & Replacement Strategy
- Searched all codebase files for Unicode emoji ranges (`[\u{1F300}-\u{1F9FF}]`, etc.).
- Replaced all user-facing emojis with Lucide React vector SVG components:
  - Security / Passkey / Authentication badges: `Lock`, `ShieldCheck`, `Key`, `Smartphone`, `Mail`
  - Warning indicators: `AlertTriangle`
  - AI Assistant / Chat greetings: Clean accessible text and standard SVG icons
  - OTP Email subject lines: Clean text headers

## Accessibility
- Decorative icons include `aria-hidden="true"`.
- Action buttons containing icons maintain descriptive accessible label text.
