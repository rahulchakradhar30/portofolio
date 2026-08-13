# Experience Homepage Section & CMS Architecture

## Purpose
The Experience system adds a data-driven **Experience** section to the homepage section management system. It enables administrators to manage professional career history, company logos, roles, employment types, structured date ranges, responsibilities/achievements, linked skills/technologies, and related projects without modifying source code or compromising Paper Layout aesthetics, Framer Motion animations, or security.

---

## System Architecture & Integration
The Experience section integrates seamlessly into the existing unidirectional Homepage Builder pipeline:

```
ADMIN DASHBOARD (Experience Tab & Homepage Builder)
        ↓
FIRESTORE PERSISTENCE (experiences collection & homepageConfig)
        ↓
REST API ENDPOINTS (/api/experiences & /api/admin/experiences)
        ↓
SECTION REGISTRY (app/components/SectionRegistry.tsx)
        ↓
PUBLIC RENDERER (app/components/Experience.tsx)
```

---

## Data Model (`ExperienceItem`)

```ts
export type ExperienceLayoutMode = "vertical" | "horizontal";

export interface ExperienceItem {
  id: string;
  companyName: string;
  companyLogo?: string;
  companyLogoPublicId?: string;
  role: string;
  employmentType?: string; // Full-time, Part-time, Contract, Internship, Freelance
  startDate: string;      // e.g. "Jan 2023" or "2023-01"
  endDate?: string;        // e.g. "Dec 2024" or empty if current
  isCurrent: boolean;      // Renders "Present" if true
  location?: string;       // e.g. "San Francisco, CA"
  workMode?: string;       // Remote, Hybrid, On-site
  shortDescription?: string;
  detailedDescription?: string;
  achievements?: string[];  // Structured list of bullet points
  skills?: string[];        // Array of Skill IDs from central Skills system
  technologies?: string[];  // Array of Skill IDs from central Skills system
  relatedProjectId?: string;// ID of related project from central Projects system
  companyUrl?: string;      // Company website URL
  order: number;            // Display order
  visible: boolean;          // Public visibility toggle
  created_at?: string;
  updated_at?: string;
}
```

---

## Supported Layout Modes

1. **Vertical Timeline (Default)**
   - Chronological timeline featuring visual connectors and node markers (`●`).
   - Cards alternate sides on desktop viewports or stream smoothly down.
   - Converts to a clean single-column left-connected line on mobile viewports.

2. **Horizontal / Snake Roadmap**
   - Multi-column chronological roadmap pattern with visual stage markers and sequence badges.
   - On mobile devices, adapts safely into a single-column track to prevent unwanted horizontal page overflow.

---

## Admin Workflow & Features

1. **Section Controls (Homepage Builder)**:
   - Toggle visibility (Show / Hide on Homepage)
   - Enable / Disable navbar link
   - Reorder section placement among homepage sections
   - Customize public heading and subtitle
   - Select Layout Mode (`Vertical` vs `Horizontal / Snake`)
   - Select animation preset and background treatment

2. **Entry-Level CRUD (Experience Tab)**:
   - **Create**: Add new experience with role, company, dates, employment type, location, work mode, description, achievements, skills, and related project.
   - **Read**: View all experience entries with current logo thumbnail, date range, and status.
   - **Update**: Full inline modal editor with drag-and-drop achievement bullet reordering.
   - **Delete**: Remove experience entry with confirmation.
   - **Reorder**: Move entries up/down to adjust timeline sequence.
   - **Duplicate**: Clone an existing experience entry.
   - **Toggle Visibility**: Temporarily hide an entry without deleting data.

---

## Automatic Company Logo Optimization Pipeline

```
Admin Upload File
        ↓
Server Signature Validation (Magic Bytes: JPEG, PNG, WebP, SVG)
        ↓
SHA-256 Hash Deduplication (Check media_assets collection)
        ↓
Cloudinary Automatic Optimization (w_400,h_400,c_limit,q_auto,f_auto)
        ↓
Store Optimized Asset URL
```

If no company logo is uploaded, the public Experience card renders a clean generic SVG icon (`Building2` / `Briefcase`) — avoiding broken image icons or emojis.

---

## Skill & Project Relationships

- **Skills Gained & Technologies Used**: Experience entries reference IDs from the central `skills` collection. The renderer resolves these IDs dynamically to retrieve skill title, icon, and colors. Updating a skill in the central Skills Manager automatically updates all associated Experience cards.
- **Related Project**: Experience entries can optionally link to an existing project ID from the central `projects` collection, displaying a clickable badge pointing to `#projects`.

---

## Theme & Glassmorphism System Integration

- Reuses existing CSS theme variables (`var(--surface)`, `var(--foreground)`, `var(--accent)`, `var(--surface-soft)`).
- When Glassmorphism is enabled in site settings, Experience cards inherit `useGlassStyle("sections", "experience")` surface styling.
- Respects reduced motion preferences via `useMotionPreferences()`.

---

## Security & Database Safety

- Server-side admin authorization required for all write operations (`assertAdminSession`).
- Rate limiting enforced on all write endpoints (`enforceRateLimit`).
- All updates use atomic/partial Firestore mutations, ensuring modifying an Experience entry will never overwrite projects, skills, themes, or 2FA credentials.

---

## Files Created
- `app/lib/imageOptimization.ts`
- `app/api/experiences/route.ts`
- `app/api/admin/experiences/route.ts`
- `app/api/admin/experiences/[id]/route.ts`
- `app/api/admin/experiences/reorder/route.ts`
- `app/api/admin/upload/logo/route.ts`
- `app/components/Experience.tsx`
- `app/admin/dashboard/components/ExperienceTab.tsx`
- `EXPERIENCE_SECTION.md`

## Files Modified
- `app/lib/types.ts`
- `app/lib/homepageConfig.ts`
- `app/lib/firebaseServer.ts`
- `app/lib/adminAPI.ts`
- `app/components/SectionRegistry.tsx`
- `app/admin/dashboard/components/HomepageBuilderTab.tsx`
- `app/admin/dashboard/page.tsx`
