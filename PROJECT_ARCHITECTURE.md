# PROJECT ARCHITECTURE & AUDIT DOCUMENTATION

> **Project Name:** Rahul Chakradhar Enterprise Portfolio & AI Interactive Platform (`portofolio`)  
> **Generated:** July 26, 2026  
> **Target Audience:** AI Engineers, Lead Architects, and Senior Full-Stack Developers  
> **Purpose:** Comprehensive, zero-assumptions architectural specification and code audit designed to enable seamless, non-breaking implementations of enterprise SEO, performance optimizations, and production deployments.

---

## 1. PROJECT OVERVIEW

### 1.1 Purpose
The project serves as a premium personal portfolio, interactive AI showcase, and talent acquisition platform for **Rahul Chakradhar**. It combines a dynamic content management system (CMS) with an AI assistant ("Chakradhar Stream"), real-time interactive visualizers (Skills Radar, Interactive Roadmap), and multi-channel communication pipelines (Contact forms, Hire Me requests, OTP verification, Resend email integration).

### 1.2 Target Audience
- Tech Recruiters, Talent Acquisition Leads, and Engineering Executives.
- Enterprise Clients seeking consulting, full-stack, and AI engineering services.
- Developers, Technical Collaborators, and Peer Engineers reviewing open-source code and project breakdowns.

### 1.3 Primary Features
1. **Dynamic CMS & Admin Dashboard:** 11 specialized administrative tabs for real-time management of Projects, Skills, Certifications, Site Copy, SEO Metadata, Animation Settings, Messages, Hire Requests, Activity Logs, and User RBAC.
2. **Interactive UI & Visualizers:**
   - **Portfolio Radar:** Radar chart visualization linking skills, projects, and certifications.
   - **Study Roadmap:** Interactive timeline showcasing academic background and metrics (CGPA, percentages).
   - **Command Palette:** Keyboard-driven navigation (`Ctrl+K` / `Cmd+K`) across sections and sub-pages.
   - **Image Lightbox:** High-resolution image/gallery viewer for project and certification media.
3. **AI Assistant ("Chakradhar Stream"):** Multi-provider AI chatbot supporting OpenAI, Groq, and HuggingFace LLM APIs, pre-conditioned with custom portfolio knowledge.
4. **Talent Acquisition Engine:** Dedicated `/hire` portal with customized inquiry fields, automated email notifications via Resend, and Firestore persistence.
5. **Multi-Factor Authentication & Security:** Custom HMAC session cookie authentication, Email & TOTP (Google Authenticator) 2FA, rate limiting, and HTTP security headers (`CSP`, `HSTS`, `X-Frame-Options`).
6. **Devtools Guard & Anti-Tampering:** Defense mechanism against unauthorized browser devtools inspection.

### 1.4 Current Development Status
- **Phase:** Production-Ready / Active Maintenance.
- **Framework Version:** Next.js 16 (App Router) with React 19.
- **Database:** Firebase Cloud Firestore (Hybrid Client SDK real-time sync + Server Admin SDK queries).

### 1.5 Tech Stack Summary
- **Core Framework:** Next.js `16.2.3` (App Router)
- **UI & Runtime:** React `19.2.4`, TypeScript `5.x`
- **Styling:** Tailwind CSS `4.x` (using `@tailwindcss/postcss`)
- **Animations:** Framer Motion `12.38.0`
- **Icons & Assets:** Lucide React `1.8.0`
- **Database & Auth:** Firebase Client `12.12.0`, Firebase Admin `13.8.0`
- **Email & Messaging:** Resend `6.10.0`, Nodemailer `9.0.3`
- **Security & 2FA:** Speakeasy `2.0.0`, QRCode `1.5.4`, Crypto-JS `4.2.0`
- **AI Integrations:** OpenAI `6.34.0`, REST calls to Groq API & HuggingFace Inference API
- **Deployment Platform:** Vercel (Serverless Functions + Edge Middleware)

---

## 2. TECHNOLOGY STACK

| Category | Technology / Library | Version | Purpose |
| :--- | :--- | :--- | :--- |
| **Framework** | Next.js | `16.2.3` | Core React App Router framework (SSR, Server Components, API routes) |
| **UI Library** | React | `19.2.4` | Component rendering engine |
| **Language** | TypeScript | `^5.0.0` | Strict static typing and interface definitions |
| **Styling** | Tailwind CSS | `^4.0.0` | Utility-first CSS engine with PostCSS processing (`@tailwindcss/postcss`) |
| **Animations** | Framer Motion | `^12.38.0` | Micro-interactions, page transitions, and smooth UI animations |
| **Icons** | Lucide React | `^1.8.0` | Scalable vector icon library |
| **Client Database** | Firebase Client SDK | `^12.12.0` | Client-side Firestore real-time snapshot listeners (`onSnapshot`) |
| **Server Database** | Firebase Admin SDK | `^13.8.0` | Server-side Firestore operations, user management, and privileged tasks |
| **Authentication** | Speakeasy | `^2.0.0` | Two-factor authentication (TOTP key generation & token verification) |
| **QR Codes** | QRCode | `^1.5.4` | Generating QR code data URLs for TOTP setup |
| **Cryptography** | Crypto-JS | `^4.2.0` | HMAC token generation and secure hashing for admin sessions |
| **Email Service** | Resend | `^6.10.0` | Primary transactional email dispatcher (OTP codes, message notifications) |
| **Email Fallback** | Nodemailer | `^9.0.3` | Secondary SMTP transport engine |
| **AI LLM API** | OpenAI | `^6.34.0` | Official client for GPT-based chatbot responses |
| **Database Alternative** | Supabase JS | `^2.103.0` | Installed utility client for potential multi-cloud data sync |
| **Environment Utility**| Dotenv | `^17.4.1` | Local environment variable parser |
| **Linting & Code Quality**| ESLint / `eslint-config-next` | `^9` / `16.2.3` | Code style enforcement and error detection |
| **Hosting Platform** | Vercel | N/A | Edge deployment target with serverless function execution |

---

## 3. DIRECTORY STRUCTURE

```
portofolio/
├── .env.local                     # Local environment variables (Git-ignored)
├── .firebaserc                    # Firebase project mapping configuration
├── .gitignore                     # Git ignore rules
├── ADMIN_GUIDE.md                 # Documentation for CMS operation
├── ADMIN_SETUP.md                 # Setup guide for initial admin user creation
├── AGENTS.md                      # AI agent execution rules and guidelines
├── API_REFERENCE.md               # Endpoints and payload specifications
├── CHATBOT_SETUP.md               # AI chatbot integration guide
├── DOCUMENTATION_INDEX.md         # Master index of project documentation files
├── eslint.config.mjs              # ESLint flat configuration file
├── firebase-credentials.json      # Firebase Admin service account key (Local/Dev)
├── firebase.json                  # Firebase hosting and Firestore deployment config
├── firestore.rules                # Firestore security rules definition
├── next-env.d.ts                  # Next.js TypeScript declarations
├── next.config.ts                 # Next.config definition (Image hostnames)
├── package.json                   # Project dependencies and npm scripts
├── postcss.config.mjs             # PostCSS plugin setup for Tailwind CSS v4
├── proxy.ts                       # Next.js Middleware security proxy & CSP configuration
├── tsconfig.json                  # TypeScript compiler settings and path aliases (`@/*`)
├── app/                           # Next.js App Router root
│   ├── favicon.ico                # Site favicon
│   ├── globals.css                # Global CSS styles, Tailwind imports, CSS variables
│   ├── layout.tsx                 # Root layout with providers (Context, Motion, Devtools)
│   ├── page.tsx                   # Main Landing Page (Single-page app with section anchors)
│   ├── manifest.ts                # Web App Manifest generator (`/manifest.json`)
│   ├── robots.ts                  # Robots text rules generator (`/robots.txt`)
│   ├── sitemap.ts                 # Dynamic XML Sitemap generator (`/sitemap.xml`)
│   ├── admin/                     # Admin Portal Route Group
│   │   ├── layout.tsx             # Minimal admin wrapper layout
│   │   ├── page.tsx               # Admin entry redirect handler
│   │   ├── login/                 # Admin Login Page (`/admin/login`)
│   │   │   └── page.tsx           # Multi-step 2FA login form component
│   │   └── dashboard/             # Admin CMS Dashboard (`/admin/dashboard`)
│   │       ├── layout.tsx         # Dashboard protection layout wrapper
│   │       ├── page.tsx           # Main Dashboard tabs controller
│   │       └── components/        # Dashboard tab components
│   │           ├── ActivityTab.tsx
│   │           ├── AnimationsTab.tsx
│   │           ├── CertificationsTab.tsx
│   │           ├── ContentTab.tsx
│   │           ├── MessagesTab.tsx
│   │           ├── OverviewTab.tsx
│   │           ├── ProjectsTab.tsx
│   │           ├── SEOTab.tsx
│   │           ├── SettingsTab.tsx
│   │           ├── SkillsTab.tsx
│   │           └── UsersTab.tsx
│   ├── api/                       # Next.js API Routes (Serverless Endpoints)
│   │   ├── chat/route.ts          # AI Assistant chat proxy endpoint
│   │   ├── contact/route.ts       # Contact message handler endpoint
│   │   ├── hire/route.ts          # Talent acquisition submission endpoint
│   │   ├── send-otp/route.ts      # General OTP dispatch handler
│   │   ├── send-reply/route.ts    # Admin contact reply email sender
│   │   ├── verify-otp/route.ts    # OTP verification endpoint
│   │   ├── auth/                  # User self-service OTP endpoints
│   │   │   ├── send-signup-otp/route.ts
│   │   │   └── verify-signup-otp/route.ts
│   │   └── admin/                 # Protected Admin API Routes
│   │       ├── activity/route.ts
│   │       ├── ai-generate/route.ts
│   │       ├── certifications/
│   │       │   ├── route.ts
│   │       │   └── [id]/route.ts
│   │       ├── content/route.ts
│   │       ├── hire/route.ts
│   │       ├── media/route.ts
│   │       ├── messages/route.ts
│   │       ├── projects/
│   │       │   ├── route.ts
│   │       │   └── [id]/route.ts
│   │       ├── seed/route.ts
│   │       ├── skills/
│   │       │   ├── route.ts
│   │       │   └── [id]/route.ts
│   │       ├── upload/
│   │       │   ├── route.ts
│   │       │   └── cloudinary/route.ts
│   │       ├── users/route.ts
│   │       └── auth/
│   │           ├── login/route.ts
│   │           ├── logout/route.ts
│   │           ├── me/route.ts
│   │           ├── send-otp/route.ts
│   │           └── verify-otp/route.ts
│   ├── certifications/            # Public Certifications Pages
│   │   ├── page.tsx               # Certifications index page
│   │   ├── CertificationsPageClient.tsx
│   │   └── [id]/                  # Certification Detail Page
│   │       ├── page.tsx           # Dynamic metadata & server route
│   │       └── CertificationDetailClient.tsx
│   ├── components/                # Shared Application Components
│   │   ├── AIAssistant.tsx        # Floating AI chat widget modal
│   │   ├── About.tsx              # About Me section with stats and copy
│   │   ├── AdminUIComponents.tsx  # Shared admin form controls, modal frames, inputs
│   │   ├── AppShell.tsx           # Layout wrapper for public header/footer shell
│   │   ├── Certifications.tsx     # Landing page certifications grid
│   │   ├── Chatbot.tsx            # Full interactive chatbot interface
│   │   ├── CommandPalette.tsx     # Keyboard command palette modal (`Ctrl+K`)
│   │   ├── Contact.tsx            # Contact form section
│   │   ├── CookieConsent.tsx      # GDPR cookie banner component
│   │   ├── DevtoolsGuard.tsx      # Browser inspector anti-tamper hook component
│   │   ├── ExpandableSection.tsx  # Accordion container component
│   │   ├── Footer.tsx             # Site footer component
│   │   ├── Header.tsx             # Top navigation bar component
│   │   ├── Hero.tsx               # Main hero section with interactive spotlights
│   │   ├── ImageLightbox.tsx      # Fullscreen media preview modal
│   │   ├── LoadingSkeleton.tsx    # Skeleton loading placeholder frames
│   │   ├── MotionProvider.tsx     # Framer Motion LazyMotion context provider
│   │   ├── PageTransition.tsx     # Route transition wrapper
│   │   ├── PortfolioContentProvider.tsx # Global Firestore content Context Provider
│   │   ├── PortfolioRadar.tsx     # Interactive SVG Radar Chart visualizer
│   │   ├── Projects.tsx           # Landing page projects grid
│   │   ├── SectionErrorBoundary.tsx # Error boundary wrapper for landing sections
│   │   ├── Skills.tsx             # Skills catalog grid with progress bars
│   │   ├── StudyRoadmap.tsx       # Educational timeline and metrics component
│   │   └── useViewport.ts         # Screen breakpoint reactive custom hook
│   ├── hire/                      # Public Hire Me Page (`/hire`)
│   │   ├── page.tsx
│   │   └── HirePageClient.tsx
│   ├── lib/                       # Core Business Logic & Server Helpers
│   │   ├── adminAPI.ts            # Client-side Admin API fetch helper utilities
│   │   ├── adminAudit.ts          # Audit logging helper for admin actions
│   │   ├── adminAuth.ts           # Admin session authentication & password verification
│   │   ├── adminAuthHmac.ts       # HMAC session signature sign/verify engine
│   │   ├── contentOrdering.ts     # Content items ordering helper
│   │   ├── dbRateLimit.ts         # Firestore-based API rate limiting implementation
│   │   ├── devtoolsBlocker.ts     # Devtools detection algorithms
│   │   ├── firebaseAdmin.ts       # Singleton Firebase Admin SDK initializer
│   │   ├── firebaseClient.ts      # Singleton Firebase Client SDK initializer
│   │   ├── firebaseServer.ts     # Server-side Firebase helper functions
│   │   ├── mail.ts                # Resend / SMTP email dispatch logic
│   │   ├── premiumAnimations.ts   # Shared Framer Motion animation variants
│   │   ├── rateLimit.ts           # In-memory rate limiter helper
│   │   ├── security.ts            # Input sanitization and security helpers
│   │   ├── siteCopy.ts            # Default site text copy fallbacks
│   │   ├── skillLogoCatalog.ts    # Comprehensive catalog of tech logos & categories
│   │   ├── types.ts               # Core TypeScript interface definitions
│   │   ├── validation.ts          # Request payload validator utilities
│   │   └── youtube.ts             # YouTube video ID parser and embed helper
│   ├── projects/                  # Public Projects Pages
│   │   ├── page.tsx               # Projects index page
│   │   ├── AllProjectsClient.tsx
│   │   └── [id]/                  # Project Detail Page
│   │       ├── page.tsx           # Dynamic metadata & server route
│   │       └── ProjectDetailClient.tsx
│   └── skills/                    # Public Skills Pages
│       ├── page.tsx               # Skills index page
│       └── SkillsPageClient.tsx
├── public/                        # Static Public Assets (SVGs, icons)
└── scripts/                       # Maintenance & Seeding Scripts
    ├── deploy-rules.mjs           # Firestore rules deployment script
    ├── seed-data.ts               # Sample portfolio data definitions
    ├── setup-firebase-esm.mjs     # ES module Firebase setup script
    └── setup-firebase.ts          # TypeScript Firebase setup script
```

---

## 4. APP ROUTER ARCHITECTURE

| Route URL | Purpose | Component Type | Dynamic Route | Layout Used | Metadata Source |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `/` | Main Portfolio Landing Page | Server Component (`Home`) with Client Sub-Components | No (`force-dynamic`) | `RootLayout` | Dynamic (`generateMetadata` via Firestore `portfolio_content`) |
| `/admin` | Admin Portal Entry point | Server Component (Redirects to `/admin/dashboard` or `/admin/login`) | No | `RootLayout` | Inherited from Root |
| `/admin/login` | Admin Authentication Screen | Client Component (`"use client"`) | No | `RootLayout` | Static Page Metadata |
| `/admin/dashboard` | Admin Management Portal | Client Component (`"use client"`) | No | `AdminDashboardLayout` | Static Dashboard Metadata |
| `/projects` | All Projects Index Page | Server Component + `AllProjectsClient` | No | `RootLayout` | Static Projects Metadata |
| `/projects/[id]` | Individual Project Detail | Server Component + `ProjectDetailClient` | Yes (`[id]`) | `RootLayout` | Dynamic (`generateMetadata` via Firestore project query) |
| `/skills` | All Skills Catalog Page | Server Component + `SkillsPageClient` | No | `RootLayout` | Static Skills Metadata |
| `/certifications` | All Certifications Index | Server Component + `CertificationsPageClient` | No | `RootLayout` | Static Certifications Metadata |
| `/certifications/[id]` | Individual Certification Detail | Server Component + `CertificationDetailClient` | Yes (`[id]`) | `RootLayout` | Dynamic (`generateMetadata` via Firestore cert query) |
| `/hire` | Talent Request / Hire Portal | Server Component + `HirePageClient` | No | `RootLayout` | Static Hire Metadata |
| `/sitemap.xml` | Dynamic XML Sitemap | Server Endpoint (`sitemap.ts`) | No | N/A | XML Document Output |
| `/robots.txt` | Search Engine Directives | Server Endpoint (`robots.ts`) | No | N/A | Plain Text Output |
| `/manifest.json` | Web App Manifest | Server Endpoint (`manifest.ts`) | No | N/A | JSON Output |

---

## 5. PAGE INVENTORY

| Page Path | Purpose | Access Control | Metadata Implementation | SEO Status | Auth Required |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `/` | Primary landing page containing all sections | Public | Dynamic via `generateMetadata` fetching Firestore content | Partially complete (Missing JSON-LD) | No |
| `/projects` | Overview grid of all public projects | Public | Static metadata (Title, Description) | Basic Metadata Only | No |
| `/projects/[id]` | In-depth showcase for a specific project | Public | Dynamic metadata fetching project title/description | Basic Metadata (Missing OpenGraph sizing) | No |
| `/skills` | Complete directory of technical skills | Public | Static metadata | Basic Metadata Only | No |
| `/certifications` | Directory of verified certifications | Public | Static metadata | Basic Metadata Only | No |
| `/certifications/[id]`| Detailed view of an individual credential | Public | Dynamic metadata fetching certification details | Basic Metadata Only | No |
| `/hire` | Client proposal & hiring submission page | Public | Static metadata | Basic Metadata Only | No |
| `/admin/login` | Secure multi-step 2FA login form | Public | Static title ("Admin Login") | Disallowed via `robots.txt` | No |
| `/admin/dashboard`| CMS control center for portfolio management | Private (Admin) | Static title ("Admin Dashboard") | Disallowed via `robots.txt` | **Yes** (Cookie `adminSession`) |

---

## 6. COMPONENT INVENTORY

### 6.1 Shared Application Components (`app/components/`)

1. **`PortfolioContentProvider.tsx`**
   - **Purpose:** Context provider that manages real-time Firestore synchronization for portfolio copy, settings, visibility flags, and fallback REST API polling.
   - **Props:** `{ children: React.ReactNode }`
   - **Dependencies:** Firebase Client SDK (`onSnapshot`), `DEFAULT_SITE_COPY`.
   - **Used By:** `app/layout.tsx` (Wraps entire application).

2. **`Header.tsx`**
   - **Purpose:** Sticky header navigation bar with brand logo, smooth-scroll section anchors, external links, command palette launch trigger, and mobile drawer.
   - **Props:** None.
   - **Dependencies:** `usePortfolioContent`, Lucide icons (`Menu`, `X`, `Command`, `Briefcase`).
   - **Used By:** `app/page.tsx`, `AppShell.tsx`.

3. **`Hero.tsx`**
   - **Purpose:** Above-the-fold introductory section featuring dynamic titles, CTA action buttons, availability badges, and interactive spotlight text cards.
   - **Props:** None.
   - **Dependencies:** `usePortfolioContent`, Framer Motion.
   - **Used By:** `app/page.tsx`.

4. **`About.tsx`**
   - **Purpose:** Highlights personal background, key stats, bio copy, and dynamic tag badges.
   - **Props:** None.
   - **Dependencies:** `usePortfolioContent`, Framer Motion.
   - **Used By:** `app/page.tsx`.

5. **`StudyRoadmap.tsx`**
   - **Purpose:** Renders academic history timeline with metric badges (CGPA, marks) and higher education extensions.
   - **Props:** None.
   - **Dependencies:** `usePortfolioContent`, Framer Motion.
   - **Used By:** `app/page.tsx`.

6. **`PortfolioRadar.tsx`**
   - **Purpose:** Interactive SVG radar visualizer demonstrating relative proficiencies across skills, projects, and certifications.
   - **Props:** None.
   - **Dependencies:** `usePortfolioContent`, Lucide icons.
   - **Used By:** `app/page.tsx`.

7. **`Skills.tsx`**
   - **Purpose:** Grid display of top skills grouped by domain with interactive proficiency percentage indicators.
   - **Props:** None.
   - **Dependencies:** `usePortfolioContent`, `skillLogoCatalog.ts`.
   - **Used By:** `app/page.tsx`.

8. **`Projects.tsx`**
   - **Purpose:** Featured projects showcase grid with filterable tags, demo links, and detail view triggers.
   - **Props:** None.
   - **Dependencies:** `usePortfolioContent`, `ImageLightbox.tsx`.
   - **Used By:** `app/page.tsx`.

9. **`Certifications.tsx`**
   - **Purpose:** Grid display of earned credentials, verification links, and issuing organization badges.
   - **Props:** None.
   - **Dependencies:** `usePortfolioContent`.
   - **Used By:** `app/page.tsx`.

10. **`Contact.tsx`**
    - **Purpose:** Interactive contact form supporting message dispatch, Resend email delivery, and social profile links.
    - **Props:** None.
    - **Dependencies:** `usePortfolioContent`, REST API `/api/contact`.
    - **Used By:** `app/page.tsx`.

11. **`Footer.tsx`**
    - **Purpose:** Global page footer displaying brand copy, quick navigation links, services list, and copyright.
    - **Props:** None.
    - **Dependencies:** `usePortfolioContent`.
    - **Used By:** `app/page.tsx`, `AppShell.tsx`.

12. **`Chatbot.tsx` / `AIAssistant.tsx`**
    - **Purpose:** Dynamic AI assistant chat interface allowing visitors to query portfolio details using LLM integration.
    - **Props:** None.
    - **Dependencies:** `/api/chat`, Framer Motion.
    - **Used By:** `AppShell.tsx`.

13. **`CommandPalette.tsx`**
    - **Purpose:** Modal command menu (`Cmd+K`) enabling fast keyboard search across all sections, projects, and links.
    - **Props:** `{ isOpen: boolean; onClose: () => void }`
    - **Dependencies:** Framer Motion, Lucide Icons, Next.js Router (`useRouter`).
    - **Used By:** `AppShell.tsx`.

14. **`ImageLightbox.tsx`**
    - **Purpose:** Fullscreen modal lightbox for gallery previewing images and YouTube video embeds.
    - **Props:** `{ isOpen: boolean; onClose: () => void; images: string[]; activeIndex: number; title: string; youtubeUrl?: string }`
    - **Dependencies:** Framer Motion, Lucide icons.
    - **Used By:** `Projects.tsx`, `Certifications.tsx`, detail pages.

15. **`DevtoolsGuard.tsx`**
    - **Purpose:** Client component that runs security anti-tampering algorithms to detect and mitigate browser inspect element debugging.
    - **Props:** None.
    - **Dependencies:** `devtoolsBlocker.ts`.
    - **Used By:** `app/layout.tsx`.

16. **`CookieConsent.tsx`**
    - **Purpose:** GDPR cookie notice banner with accept/decline state persisted in browser `localStorage`.
    - **Props:** None.
    - **Dependencies:** Framer Motion.
    - **Used By:** `app/layout.tsx`.

17. **`MotionProvider.tsx`**
    - **Purpose:** Performance-optimized Framer Motion wrapper executing `LazyMotion` with `domAnimation` features.
    - **Props:** `{ children: React.ReactNode }`
    - **Dependencies:** Framer Motion (`LazyMotion`, `domAnimation`).
    - **Used By:** `app/layout.tsx`.

18. **`SectionErrorBoundary.tsx`**
    - **Purpose:** React Error Boundary catching render errors in individual landing sections without crashing the whole application.
    - **Props:** `{ children: React.ReactNode; sectionName: string }`
    - **Dependencies:** React `Component`.
    - **Used By:** `app/page.tsx`.

---

## 7. LAYOUT HIERARCHY

```
app/layout.tsx (RootLayout)
└── <PortfolioContentProvider> (Global Firestore Realtime / REST State)
    └── <MotionProvider> (LazyMotion Animation Features)
        ├── <DevtoolsGuard /> (Client Anti-Tamper Listener)
        ├── <AppShell> (Public Shell Container)
        │   ├── <Header /> (Sticky Nav)
        │   ├── {children} (Page Content: app/page.tsx, /projects, /hire, etc.)
        │   ├── <AIAssistant /> (Floating Chat Trigger & Modal)
        │   ├── <CommandPalette /> (Global Cmd+K Modal Listener)
        │   └── <Footer /> (Public Footer)
        └── <CookieConsent /> (Bottom Banner)
```

---

## 8. STATE MANAGEMENT

### 8.1 State Architecture Overview
1. **Global Context (`PortfolioContentContext`):**
   - Maintained in `PortfolioContentProvider.tsx`.
   - Listens to Firestore document `portfolio_content` via client SDK `onSnapshot`.
   - Provides `{ content, loading, error }` globally through the custom hook `usePortfolioContent()`.
   - Contains fallback mechanics to query `/api/admin/content` if client Firebase initialization is unavailable.

2. **Custom Hooks:**
   - `usePortfolioContent()`: Grants components instant access to dynamic CMS copy, visibility flags, and configuration without prop drilling.
   - `useViewport()`: Reactive screen dimension monitor (`isMobile`, `isTablet`, `isDesktop`).

3. **Local Component State:**
   - Used extensively for form fields (`Contact.tsx`, `HirePageClient.tsx`, `Admin/Login`), active modal states (`CommandPalette.tsx`, `ImageLightbox.tsx`), active tab indexes (`Admin/Dashboard`), and interactive chat logs (`Chatbot.tsx`).

4. **Firestore Real-time Listener Strategy:**
   - Active listener on collection `portfolio_content` (limited to 1 document).
   - Updates state seamlessly using React 19 `useTransition()` to prevent blocking UI frame updates during snapshots.

---

## 9. DATA FLOW ARCHITECTURE

```
+-------------------------------------------------------------------------+
|                          FIRESTORE DATABASE                             |
| Collections: portfolio_content, projects, skills, certifications, etc. |
+-------------------------------------------------------------------------+
       |                                                    |
 (Client SDK Listener)                             (Server Admin SDK Query)
       |                                                    |
       v                                                    v
+------------------------------------+             +------------------------+
|   PortfolioContentProvider.tsx     |             | Server Component Pages |
|   (Client Context Engine)          |             | (app/page.tsx, etc.)   |
+------------------------------------+             +------------------------+
       |                                                    |
  usePortfolioContent() Hook                           generateMetadata()
       |                                                    |
       v                                                    v
+------------------------------------+             +------------------------+
| UI Components (Hero, About, etc.)  |             | Dynamic HTML & SEO Meta|
+------------------------------------+             +------------------------+
       |
       v
+------------------------------------+
| Rendered DOM & User Interactions   |
+------------------------------------+
```

---

## 10. FIREBASE ARCHITECTURE

### 10.1 Integration Strategy
The application employs a **Hybrid Dual-SDK Firebase Architecture**:
- **Firebase Client SDK (`app/lib/firebaseClient.ts`):** Lightweight client-side initialization used exclusively for real-time `onSnapshot` subscriptions on public collections (`portfolio_content`) when public client environment variables are set.
- **Firebase Admin SDK (`app/lib/firebaseAdmin.ts` & `firebaseServer.ts`):** Privileged Node.js SDK initialized using service account credentials (`firebase-credentials.json` or `FIREBASE_PRIVATE_KEY` env). Used in all Next.js Server Components and API Routes for secure, unconstrained database queries, OTP verification, and administrative mutations.

### 10.2 Firestore Security Rules (`firestore.rules`)
- **`portfolio_content` & `projects` & `skills`:** Publicly readable (`allow read: if true;`), writable only by authenticated admins (`allow write: if isAdmin();`).
- **`contact_messages`:** Publicly writable (`allow create: if true;`), readable/updatable only by admins.
- **`admin_users`:** Read/write strictly restricted to the authenticating admin user (`request.auth.uid == userId`).
- **`email_otps`:** Public creation permitted with expiration checks (`expires_at > request.time`).
- **`admin_otps`, `signup_otps`, `rate_limits`:** Fully blocked from client SDK access (`allow read, write: if false;`). Handled exclusively by Firebase Admin SDK in API routes.

---

## 11. DATABASE STRUCTURE (FIRESTORE SCHEMA)

### 11.1 Collection Specifications

#### 1. Collection: `portfolio_content`
- **Document ID:** Single auto-generated or fixed doc ID.
- **Fields:**
  - `heroTitle` (string): Main headline.
  - `heroSubtitle` (string): Secondary sub-headline.
  - `heroTagline` (string): Tagline text.
  - `aboutText` (string): Detailed biography.
  - `email`, `phone`, `location` (string): Contact info.
  - `sectionVisibility` (map): Booleans toggling display of `hero`, `about`, `roadmap`, `radar`, `skills`, `projects`, `certifications`, `contact`.
  - `siteCopy` (map): Overridden text labels for all UI buttons and headlines.
  - `seoTitle`, `seoDescription`, `seoKeywords`, `seoCanonicalUrl`, `seoOgImage`, `seoTwitterCard`, `seoFavicon`, `seoThemeColor` (string): Custom SEO configuration parameters.

#### 2. Collection: `projects`
- **Document ID:** Auto-generated.
- **Fields:**
  - `title` (string), `description` (string), `longDescription` (string).
  - `image` (string): Primary image URL (Cloudinary).
  - `galleryImages` (array of strings): Additional image URLs.
  - `tech` (array of strings): Technology tags (e.g., `["Next.js", "Firebase"]`).
  - `github` (string): GitHub repo URL.
  - `demo` (string): Live demo URL.
  - `featured` (boolean): Flag for landing page grid display.
  - `category` (string): Project domain category.
  - `created_at`, `updated_at` (string ISO dates).

#### 3. Collection: `skills`
- **Document ID:** Auto-generated.
- **Fields:**
  - `title` (string): Skill name.
  - `description` (string): Category label (e.g., "Frontend", "AI / ML").
  - `color`, `bgColor` (string): Hex/CSS color tokens.
  - `icon` (string): Lucide icon reference string.
  - `proficiency` (number): Percentage rating (0 to 100).
  - `featured` (boolean): Landing page flag.

#### 4. Collection: `certifications`
- **Document ID:** Auto-generated.
- **Fields:**
  - `title` (string): Name of credential.
  - `issuer` (string): Issuing organization (e.g., "Google Cloud", "AWS").
  - `issuedDate` (string): Issue date.
  - `credentialId` (string): Unique identifier.
  - `credentialUrl` (string): Verification link.
  - `image` (string): Certificate badge/image URL.

#### 5. Collection: `contact_messages`
- **Document ID:** Auto-generated.
- **Fields:**
  - `firstName`, `lastName`, `email`, `subject`, `message` (string).
  - `createdAt` (string ISO date).
  - `read` (boolean): Read/unread flag.

#### 6. Collection: `hire_requests`
- **Document ID:** Auto-generated.
- **Fields:**
  - `fullName`, `companyName`, `email`, `phone`, `website`, `projectType`, `budget`, `timeline`, `description` (string).
  - `createdAt` (string ISO date).
  - `status` (string: `'new' | 'contacted' | 'quoted' | 'won' | 'archived'`).

#### 7. Collection: `admin_users`
- **Document ID:** Auto-generated or User UID.
- **Fields:**
  - `email` (string), `name` (string), `password_hash` (string: bcrypt/crypto hash).
  - `otp_enabled` (boolean), `otp_secret` (string: Speakeasy secret key).
  - `role` (string: `'admin' | 'editor' | 'viewer'`).

---

## 12. AUTHENTICATION & SECURITY

```
+-----------------------------------------------------------------------+
|                         ADMIN LOGIN FLOW                              |
+-----------------------------------------------------------------------+
| 1. User submits Email & Password to /api/admin/auth/login             |
| 2. Server verifies password hash against admin_users collection        |
| 3. If OTP/2FA is enabled:                                             |
|    - Server responds with { requireOtp: true }                        |
|    - User submits 6-digit OTP to /api/admin/auth/verify-otp            |
| 4. Server verifies OTP via Speakeasy (TOTP) or Email OTP               |
| 5. Server generates HMAC signature token using server secret          |
| 6. Server sets HTTP-Only, Secure, SameSite Cookie: adminSession        |
| 7. Proxy Middleware (proxy.ts) validates adminSession on protected routes|
+-----------------------------------------------------------------------+
```

### 12.1 Middleware Authorization Rules (`proxy.ts`)
- **Public Routes:** `/`, `/projects`, `/skills`, `/certifications`, `/hire`, `/admin/login`.
- **Protected Routes:** `/admin/dashboard`, `/api/admin/*` (except public GET reads for content/projects).
- **Session Check:** Extracts `adminSession` cookie and validates HMAC signature against `ADMIN_JWT_SECRET` / server key. Unauthenticated requests to protected API endpoints return HTTP `401 Unauthorized`; browser requests are redirected to `/admin/login`.

---

## 13. API ROUTES ARCHITECTURE

| API Route | Method(s) | Purpose | Input Payload | Output Payload | Auth Required |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `/api/chat` | POST | Proxy requests to OpenAI/Groq for AI Assistant | `{ messages: Array, model?: string }` | `{ message: string }` | No |
| `/api/contact` | POST | Send public contact message | `{ firstName, lastName, email, subject, message }` | `{ success: boolean, id: string }` | No |
| `/api/hire` | POST | Submit talent acquisition proposal | `{ fullName, email, projectType, description, ... }` | `{ success: boolean, id: string }` | No |
| `/api/send-otp` | POST | Dispatch email OTP code | `{ email, type }` | `{ success: boolean }` | No |
| `/api/verify-otp` | POST | Validate email OTP code | `{ email, otp, type }` | `{ valid: boolean }` | No |
| `/api/send-reply` | POST | Dispatch admin reply to contact inquiry | `{ to, subject, message, originalMessageId }` | `{ success: boolean }` | **Yes** (Admin) |
| `/api/admin/auth/login` | POST | Initiate admin login sequence | `{ email, password }` | `{ success: boolean, requireOtp: boolean }` | No |
| `/api/admin/auth/verify-otp`| POST | Verify 2FA & issue session cookie | `{ email, otp, tempToken }` | `{ success: boolean }` | No |
| `/api/admin/auth/logout` | POST | Clear `adminSession` cookie | None | `{ success: boolean }` | **Yes** (Admin) |
| `/api/admin/auth/me` | GET | Retrieve authenticated admin identity | None | `{ user: AdminUser }` | **Yes** (Admin) |
| `/api/admin/content` | GET, PUT | Read or update global portfolio content | GET: None, PUT: `Partial<PortfolioContent>` | `{ content: PortfolioContent }` | GET: No, PUT: **Yes** |
| `/api/admin/projects` | GET, POST | Fetch all projects or create new project | POST: `Omit<Project, 'id'>` | `{ success: boolean, project: Project }` | GET: No, POST: **Yes** |
| `/api/admin/projects/[id]`| PUT, DELETE | Update or delete a specific project | PUT: `Partial<Project>` | `{ success: boolean }` | **Yes** (Admin) |
| `/api/admin/skills` | GET, POST | Fetch all skills or create new skill | POST: `Omit<Skill, 'id'>` | `{ success: boolean, skill: Skill }` | GET: No, POST: **Yes** |
| `/api/admin/skills/[id]` | PUT, DELETE | Update or delete a specific skill | PUT: `Partial<Skill>` | `{ success: boolean }` | **Yes** (Admin) |
| `/api/admin/certifications`| GET, POST | Fetch all credentials or add credential | POST: `Omit<Certification, 'id'>` | `{ success: boolean, cert: Certification }` | GET: No, POST: **Yes** |
| `/api/admin/certifications/[id]`| PUT, DELETE| Update or delete a credential | PUT: `Partial<Certification>` | `{ success: boolean }` | **Yes** (Admin) |
| `/api/admin/messages` | GET, DELETE | Manage stored contact form submissions | GET: None, DELETE: `{ id }` | `{ messages: ContactMessage[] }` | **Yes** (Admin) |
| `/api/admin/hire` | GET, PATCH | Manage received hire proposals | GET: None, PATCH: `{ id, status }` | `{ requests: HireRequest[] }` | **Yes** (Admin) |
| `/api/admin/upload/cloudinary`| POST | Upload image file to Cloudinary CDN | `FormData` (file) | `{ url: string, public_id: string }` | **Yes** (Admin) |
| `/api/admin/ai-generate` | POST | Generate CMS text copy using LLM | `{ prompt, context }` | `{ text: string }` | **Yes** (Admin) |

---

## 14. METADATA AUDIT

### 14.1 Current Implementation State
- **Root Layout (`app/layout.tsx`):** Provides fallback static `title` and `description`.
- **Home Page (`app/page.tsx`):** Implements dynamic `generateMetadata()` by reading `seoTitle`, `seoDescription`, `seoKeywords`, `seoCanonicalUrl`, and `seoOgImage` from the Firestore `portfolio_content` collection.
- **Dynamic Sub-Pages (`app/projects/[id]/page.tsx`, `app/certifications/[id]/page.tsx`):** Implement `generateMetadata()` fetching project and certification titles dynamically.
- **App Router Special Files:**
  - `app/manifest.ts`: Generates web app manifest (`/manifest.json`).
  - `app/robots.ts`: Generates search directives (`/robots.txt`) allowing `/` and blocking `/admin/`.
  - `app/sitemap.ts`: Dynamically fetches all project and certification IDs to build `/sitemap.xml`.

### 14.2 Highlighted SEO Gaps & Missing Elements
1. **Missing JSON-LD Structured Data:** No `<script type="application/ld+json">` present for `Person`, `WebSite`, `Organization`, `Project`, or `BreadcrumbList` schemas.
2. **Missing OpenGraph Image Sizing:** OpenGraph metadata tags omit `width`, `height`, and `alt` properties.
3. **Missing Twitter Creator Details:** Omits `@username` creator and site handles in `twitter:creator`.
4. **No Dynamic Alternative Language Tags:** Omits `hreflang` definitions.
5. **Static Fallback Limitations:** In scenarios where Firestore returns null during server rendering, default fallback metadata is basic.

---

## 15. PERFORMANCE AUDIT

### 15.1 Asset & Code Analysis
- **Images:** Utilizes Next.js `<Image />` component with configured Cloudinary remote patterns (`res.cloudinary.com`).
- **Bundle Size & Component Tree:** Framer Motion is included across multiple landing sections. `MotionProvider.tsx` wraps the app in Framer Motion's `LazyMotion` component using `domAnimation` to reduce initial JavaScript bundle overhead.
- **Rendering Strategy (`force-dynamic`):** `app/page.tsx` explicitly exports `export const dynamic = "force-dynamic";`. This forces server-side rendering (SSR) on every single request, completely bypassing static HTML edge caching on Vercel.

### 15.2 Identified Bottlenecks
1. **Uncached SSR on Main Page:** `force-dynamic` prevents Vercel CDN from serving pre-rendered static HTML, increasing Time-To-First-Byte (TTFB).
2. **Client-Side Firestore Listener Overhead:** `PortfolioContentProvider` establishes a client-side `onSnapshot` listener on mount, causing re-hydration state updates shortly after DOM paint.
3. **Large SVGs in Main Bundle:** `skillLogoCatalog.ts` (25.5 KB) embeds inline SVG paths in TypeScript arrays instead of serving optimized external SVGs.

---

## 16. ACCESSIBILITY (A11Y) AUDIT

- **Semantic Landmark HTML:** HTML5 elements (`<main>`, `<header>`, `<footer>`, `<section>`) are properly structured.
- **Keyboard Navigation:** Command Palette responds to `Cmd+K` / `Ctrl+K`. Focus states on key buttons use Tailwind focus ring utilities.
- **Heading Hierarchy:** `<h1>` defined on Hero, `<h2>` on major section titles (`About`, `Skills`, `Projects`, `Contact`).
- **Areas for Improvement:**
  - Dynamic interactive cards in `PortfolioRadar` lack full keyboard navigation ARIA roles (`role="graphics-document"`, `aria-roledescription`).
  - Image lightboxes require explicit focus locking (`focus-trap`) to prevent background tab navigation while open.

---

## 17. SECURITY AUDIT

### 17.1 Security Headers (`proxy.ts`)
The custom proxy middleware enforces strict response headers on all matched routes:
- `Content-Security-Policy`: Explicit whitelist for script, style, image, font, and connect origins (Cloudinary, Google APIs, Firebase, Resend).
- `X-Frame-Options: DENY`: Prevents clickjacking inside iframes.
- `X-Content-Type-Options: nosniff`: Prevents MIME-type sniffing.
- `Referrer-Policy: strict-origin-when-cross-origin`.
- `Strict-Transport-Security`: Enforced in production (`max-age=31536000; includeSubDomains; preload`).

### 17.2 Security Flags & Audit Warnings
- **`TEMP_DISABLE_ADMIN_AUTH` Flag:** In `proxy.ts`, line 5 sets `const TEMP_DISABLE_ADMIN_AUTH = false;`. This emergency maintenance bypass **must remain `false` in production** to prevent unauthorized access.
- **CSP `'unsafe-inline'`:** Script and style directives contain `'unsafe-inline'`, required for Next.js inline scripts and dynamic Tailwind styles. A nonce-based CSP can be implemented for heightened enterprise security.

---

## 18. DEPLOYMENT & ENVIRONMENT REQUIREMENTS

### 18.1 Required Environment Variables

```env
# Public Client Firebase Credentials
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=rahul-portofolio.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=rahul-portofolio
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=rahul-portofolio.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:...
NEXT_PUBLIC_SITE_URL=https://rahulchakradhar.com

# Server-Side Firebase Admin Credentials
FIREBASE_PROJECT_ID=rahul-portofolio
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@rahul-portofolio.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# Security & Authentication Secrets
ADMIN_JWT_SECRET=super-secret-hmac-key
ADMIN_PASSWORD_HASH=$2b$10$...

# Email & Third-Party APIs
RESEND_API_KEY=re_...
OPENAI_API_KEY=sk-proj-...
CLOUDINARY_CLOUD_NAME=dxxxxxx
CLOUDINARY_API_KEY=123456789
CLOUDINARY_API_SECRET=xxxxxxx
```

### 18.2 Build & Execution Scripts
- `npm run dev`: Launch local development server (`next dev`).
- `npm run build`: Compile Next.js production application (`next build`).
- `npm run start`: Launch production server (`next start`).
- `npm run lint`: Run ESLint checks.

---

## 19. SEO READINESS EVALUATION

| Platform / Engine | Readiness Grade | Analysis & Current Limitations |
| :--- | :--- | :--- |
| **Google Search** | **B+** | Good basic indexability via dynamic sitemap and robots.txt. Lacks structured data JSON-LD (Person/Organization) for rich snippet features. |
| **Google Discover** | **C+** | High-quality imagery present via Cloudinary, but lacks large image previews metadata (`max-image-preview:large`) and structured article schemas. |
| **Bing Search** | **B** | Standard crawlability intact. Missing Bing Webmaster verification meta tags. |
| **AI Search Engines**<br>*(ChatGPT, Perplexity, Gemini, Claude)* | **B-** | Machine readability is clear through semantic HTML, but lacks machine-readable JSON-LD graph objects defining entity relationships (e.g., author expertise, skill proficiencies, explicit project authorship). |

---

## 20. PRIORITIZED IMPROVEMENT OPPORTUNITIES

| Priority | Feature / Refactoring Opportunity | Architectural Rationale |
| :--- | :--- | :--- |
| **CRITICAL** | **Inject Comprehensive JSON-LD Structured Data** | Essential for AI search engines (Perplexity, ChatGPT Search) and Google Knowledge Graph recognition. Add `Person`, `WebSite`, `Project`, and `BreadcrumbList` schemas. |
| **HIGH** | **Optimize Page Caching Strategy** | Replace `export const dynamic = "force-dynamic"` in `app/page.tsx` with Incremental Static Regeneration (ISR `revalidate = 3600`) or tag-based revalidation (`revalidateTag`) to dramatically lower TTFB. |
| **HIGH** | **Enhance OpenGraph & Twitter Social Cards** | Add explicit `width`, `height`, and `twitter:creator` handle metadata across all dynamic pages. |
| **MEDIUM** | **Extract Logo Paths from `skillLogoCatalog.ts`** | Move large SVG path definitions into static CDN assets or separate JSON files to shrink initial bundle JS size. |
| **MEDIUM** | **Implement Focus Trapping in Modals** | Add `focus-trap` capability to `ImageLightbox` and `CommandPalette` for enhanced WCAG 2.1 compliance. |
| **LOW** | **Nonce-based Content Security Policy** | Replace `'unsafe-inline'` script CSP policy with dynamic cryptographically generated nonces. |

---

## 21. FILE INVENTORY

| File Path | Core Purpose | Key Dependencies | Primary Consumers |
| :--- | :--- | :--- | :--- |
| `app/layout.tsx` | Main application shell wrapper and global provider container | `PortfolioContentProvider`, `MotionProvider`, `DevtoolsGuard` | Next.js Router |
| `app/page.tsx` | Main portfolio landing page compiling all section components | `firebaseServer`, Section components | Next.js Router (`/`) |
| `proxy.ts` | Edge security proxy middleware enforcing CSP and Admin authentication | `next/server` | Next.js Request Pipeline |
| `firestore.rules` | Database access control security rules | Firestore Engine | Firebase Cloud Engine |
| `app/lib/firebaseAdmin.ts` | Lazy-initialized singleton for Firebase Admin SDK | `firebase-admin` | `firebaseServer.ts`, API Routes |
| `app/lib/firebaseClient.ts` | Client Firebase SDK setup | `firebase/app`, `firebase/firestore` | `PortfolioContentProvider.tsx` |
| `app/lib/firebaseServer.ts` | Server-side data fetching and mutation helper functions | `firebaseAdmin.ts` | `app/page.tsx`, Admin API Routes |
| `app/lib/types.ts` | TypeScript interface definitions for entire application | None | All components, helpers, and routes |
| `app/lib/siteCopy.ts` | Fallback text copy dictionary for portfolio interface | None | `PortfolioContentProvider.tsx` |
| `app/components/PortfolioContentProvider.tsx` | Real-time Firestore content state sync context provider | `firebaseClient.ts` | `app/layout.tsx`, UI components |

---

## 22. ARCHITECTURE SUMMARY

### Execution Workflow: From Request to Render

1. **HTTP Request Ingress:**
   - Client issues HTTP GET request to `https://rahulchakradhar.com/`.
   - The request hits Next.js Middleware in `proxy.ts`.
   - `proxy.ts` validates security policies and attaches standard security headers (`CSP`, `X-Frame-Options`, `X-Content-Type-Options`).

2. **Server-Side Execution (`app/page.tsx`):**
   - Next.js invokes `generateMetadata()`, executing `serverFirebaseHelpers.getPortfolioContent()` via the Firebase Admin SDK to fetch SEO parameters from Firestore.
   - The server component `Home()` renders the section hierarchy (`Header`, `Hero`, `About`, `StudyRoadmap`, `PortfolioRadar`, `Skills`, `Projects`, `Certifications`, `Contact`, `Footer`). Each section is safely wrapped in a `SectionErrorBoundary`.

3. **Client Hydration & Real-time State Initialization:**
   - HTML and initial JavaScript bundles stream to the client browser.
   - `app/layout.tsx` initializes `PortfolioContentProvider`.
   - The provider initializes a client-side Firestore `onSnapshot` listener targeted at the `portfolio_content` collection.
   - Any modifications made in the Admin CMS (`/admin/dashboard`) immediately propagate to all connected clients without requiring a page reload.

---

## 23. SEO IMPLEMENTATION READINESS

This section outlines the exact specification required for an AI engineer or developer to implement enterprise-grade SEO without modifying core application logic or breaking existing functionalities.

### 23.1 Information Requirements for SEO Implementation
To implement full enterprise-grade SEO, the following schema implementations and meta configurations must be integrated into the metadata layer:

#### 1. JSON-LD Structured Data Specs (To be injected into `app/layout.tsx` or `app/page.tsx`)

##### Schema: `Person` & `ProfilePage`
```json
{
  "@context": "https://schema.org",
  "@type": "ProfilePage",
  "mainEntity": {
    "@type": "Person",
    "name": "Rahul Chakradhar",
    "jobTitle": "AI Systems Engineer & Full-Stack Developer",
    "url": "https://rahulchakradhar.com",
    "sameAs": [
      "https://github.com/rahulchakradhar",
      "https://linkedin.com/in/rahulchakradhar",
      "https://instagram.com/rahulchakradhar"
    ],
    "knowsAbout": [
      "Artificial Intelligence",
      "Next.js",
      "TypeScript",
      "Firebase",
      "Cloud Architecture"
    ]
  }
}
```

##### Schema: `WebSite` & `SearchAction`
```json
{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "Rahul Chakradhar Portfolio",
  "url": "https://rahulchakradhar.com",
  "author": {
    "@type": "Person",
    "name": "Rahul Chakradhar"
  }
}
```

#### 2. OpenGraph & Twitter Meta Standard Specification
Ensure `generateMetadata()` in `app/page.tsx`, `app/projects/[id]/page.tsx`, and `app/certifications/[id]/page.tsx` returns complete media dimensions:

```typescript
openGraph: {
  title: content.seoTitle,
  description: content.seoDescription,
  url: content.seoCanonicalUrl || 'https://rahulchakradhar.com',
  siteName: 'Rahul Chakradhar Portfolio',
  images: [
    {
      url: content.seoOgImage || 'https://res.cloudinary.com/.../og-default.png',
      width: 1200,
      height: 630,
      alt: 'Rahul Chakradhar Portfolio Preview',
    },
  ],
  locale: 'en_US',
  type: 'website',
},
twitter: {
  card: 'summary_large_image',
  title: content.seoTitle,
  description: content.seoDescription,
  images: [content.seoOgImage || 'https://res.cloudinary.com/.../og-default.png'],
  creator: '@rahulchakradhar',
}
```

### 23.2 Non-Breaking Execution Guarantees
When implementing the above SEO enhancements:
- **Do not modify** `PortfolioContentProvider.tsx` context contract.
- **Do not modify** `proxy.ts` security header directives unless extending CSP `img-src` for schema image domains.
- **Do not alter** Firestore schema field names in `portfolio_content`; utilize existing `seoTitle`, `seoDescription`, `seoKeywords`, `seoCanonicalUrl`, and `seoOgImage` properties.
