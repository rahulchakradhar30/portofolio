# MASTER OTT IMPLEMENTATION NOTE

Purpose: Use this as the baseline architecture and operations blueprint for your OTT streaming platform so it behaves like this project: stable frontend, stable backend, admin panel aligned with APIs, secure configuration, and clean deployment flow.

This document is written as a direct implementation guide. Replace portfolio-specific labels with OTT entities (movies, series, episodes, categories, subscriptions, banners, watchlists) while preserving the same engineering structure.

## 1. Target Architecture (What to Replicate)

### Core stack
- Next.js App Router
- React + TypeScript
- Tailwind CSS
- Firebase (client + admin)
- Firestore for primary content and admin data
- Vercel for deployment
- Optional supporting services: Cloudinary (assets), OpenAI (assistant), Resend (email)

### Verified dependency baseline from this project
- next: 16.2.3
- react/react-dom: 19.2.4
- typescript: 5.x
- tailwindcss: 4.x
- firebase: 12.12.0
- firebase-admin: 13.8.0
- framer-motion: 12.38.0
- openai: 6.34.0
- resend: 6.10.0

### Build scripts pattern
- dev: next dev
- build: next build
- start: next start
- lint: eslint
- setup:firebase: node scripts/setup-firebase-esm.mjs

## 2. Project Structure Pattern

Use the same layered structure:

- app
  - page.tsx (home composition)
  - admin
    - login/page.tsx
    - dashboard/page.tsx
    - layout.tsx
  - api
    - admin/* (protected CRUD)
    - public endpoints (contact/hire/chat equivalent for OTT)
- components (UI sections + reusable widgets)
- lib (auth, API clients, firebase, security, types)
- scripts (seed/setup/deploy helpers)
- docs (admin setup, env setup, API reference)

Why this works:
- Clear separation of concerns
- Admin and public APIs share the same data contracts
- Runtime-only Firebase admin initialization avoids build-time failures

## 3. Data Model Blueprint for OTT

Start from existing content models and extend into OTT entities.

### Essential collections
- admin_users
- activity_logs
- platform_content (hero banners, navigation copy, legal copy)
- ott_titles (movie/series-level metadata)
- ott_episodes (for series)
- ott_categories
- ott_assets (posters, backdrops, trailers)
- ott_live_events (premieres/live sessions)
- ott_subscriptions (plan definitions)
- ott_users (profile + entitlement summary)
- ott_watch_history
- ott_watchlist
- contact_messages (optional)
- hire_requests (optional)

### Sample OTT title shape (recommended)
- id
- kind: movie | series
- title
- slug
- synopsisShort
- synopsisLong
- genres: string[]
- languages: string[]
- maturityRating
- durationMinutes (movie)
- seasonsCount (series)
- releaseDate
- availabilityStart
- availabilityEnd
- featured
- heroFeatured
- posterUrl
- backdropUrl
- trailerUrl
- streamUrlHls (or playback provider reference)
- isPublished
- created_at
- updated_at

### Contract rule
One source of truth for types in lib/types.ts. API request and response payloads must use these exact contracts.

## 4. API Architecture Pattern (No Mismatch)

### Protected admin routes
- /api/admin/auth/login
- /api/admin/auth/logout
- /api/admin/auth/me
- /api/admin/titles
- /api/admin/titles/[id]
- /api/admin/episodes
- /api/admin/episodes/[id]
- /api/admin/categories
- /api/admin/categories/[id]
- /api/admin/content
- /api/admin/live-events
- /api/admin/live-events/[id]
- /api/admin/subscriptions
- /api/admin/subscriptions/[id]
- /api/admin/activity
- /api/admin/upload

### Public routes
- /api/titles
- /api/titles/[slug]
- /api/home-feed
- /api/search
- /api/live-events
- /api/subscriptions
- /api/chat (optional)
- /api/contact (optional)

### Route standards
- Validate auth first in all admin routes
- Validate payload with strict schema
- Return stable response shape: success, data, error
- Log meaningful failures with route context
- Add OPTIONS where needed for CORS and clients

## 5. Admin System Blueprint

### Login/session flow
1. Admin logs in through provider or secure credentials.
2. Backend creates HTTP-only admin session cookie.
3. Every admin API validates session before handler logic.
4. Unauthorized access returns 401/403 consistently.

### Dashboard modules
- Titles manager
- Episodes manager
- Categories manager
- Banners and editorial content manager
- Live events scheduler
- Subscription plans manager
- Media uploader manager
- User and entitlement overview
- Activity logs

### Critical production check
If you use a temporary auth bypass flag during debugging, force it to false before deployment. Add a pre-deploy checklist gate that blocks release if bypass is enabled.

## 6. Security and Reliability Baseline

### Firestore rules strategy
- Public read only for approved content collections
- Admin-only write for content and configuration
- User-private collections scoped by auth uid
- Block direct write to activity logs from clients

### API protections
- Rate limiting for public endpoints
- Basic bot detection and honeypot checks on forms
- Strict origin policy for CORS (allowlist only)
- Generic responses for account recovery flows (no email enumeration)

### Secret handling
- Never hardcode keys in repo
- Keep private values only in environment variables
- Use placeholders in documentation

## 7. Environment Variable Template

Use this format in docs and deployment, never real secrets in code.

### Public
- NEXT_PUBLIC_FIREBASE_API_KEY
- NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
- NEXT_PUBLIC_FIREBASE_PROJECT_ID
- NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
- NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
- NEXT_PUBLIC_FIREBASE_APP_ID
- NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME (if used)

### Private
- FIREBASE_PROJECT_ID
- FIREBASE_PRIVATE_KEY
- FIREBASE_CLIENT_EMAIL
- ADMIN_GOOGLE_EMAIL
- OPENAI_API_KEY (if chatbot/assistant enabled)
- RESEND_API_KEY (if email enabled)
- CLOUDINARY_API_KEY
- CLOUDINARY_API_SECRET
- ALLOWED_ORIGINS

## 8. Deployment Runbook (Vercel + Firebase)

### Local validation sequence
1. npm install
2. npm run lint
3. npm run build
4. npm run dev
5. Validate admin login + one complete CRUD cycle

### Firebase sequence
1. Confirm project and credentials
2. Deploy firestore.rules
3. Seed minimal required data for first run

### Vercel sequence
1. Connect repo
2. Add all environment variables
3. Redeploy after env update
4. Verify health endpoints and key pages

### Post-deploy smoke test
1. Home page renders feed and banners
2. Public title detail opens and playback metadata loads
3. Admin login succeeds
4. Admin create/update/delete for title succeeds
5. Uploaded media appears correctly in UI
6. Activity logs record admin actions
7. Rate limit triggers on abuse tests

## 9. Frontend-Backend Contract Discipline

To avoid mismatch errors:
- Keep shared type definitions in one file
- Use one admin API client utility for all dashboard calls
- Never call raw fetch inline across many components
- Version response shape if breaking changes are needed
- Add runtime guards for nullable fields from Firestore

Recommended rule:
Any change to data shape must include:
1. type update
2. API handler update
3. admin form update
4. public renderer update
5. migration or fallback logic

## 10. OTT Migration Map from This Project

Map current modules to OTT modules while preserving proven architecture.

- Projects -> OTT Titles
- Certifications -> Episodes or Assets (based on your UI)
- Skills -> Categories/Genres/Tags
- Portfolio content -> Platform content and editorial copy
- Hire/contact -> Support/contact (optional)
- Chatbot -> Viewer assistant (optional)

Keep the same:
- error boundary strategy
- admin API guard strategy
- content ordering and featured prioritization strategy
- upload pipeline and env handling strategy

## 11. Production Readiness Checklist

### Engineering
- All admin APIs require session validation
- No temporary bypass flags active
- All routes return typed response shapes
- Lint and build pass cleanly

### Data
- Required collections exist
- Indexes created for search/feed queries
- Seed data available for non-empty first load

### Security
- Firestore rules deployed
- CORS restricted to known origins
- Secrets only in environment manager

### Operations
- Rollback plan documented
- Error logs visible in deployment platform
- Admin action auditing enabled

## 12. Copy-Paste Kickstart for New OTT Repo

Use this order to bootstrap quickly with low risk.

1. Scaffold Next.js app with TypeScript + Tailwind + App Router.
2. Add lib/types.ts first and lock data contracts.
3. Implement firebaseClient.ts and firebaseAdmin.ts with lazy admin init.
4. Implement adminAuth.ts session guard and cookie helpers.
5. Build admin CRUD for one entity first: ott_titles.
6. Build public listing and detail pages from the same collection.
7. Add upload flow and media fields.
8. Add activity logs and rate limiter.
9. Add env docs and deployment scripts.
10. Run full smoke tests before adding advanced features.

## 13. Canonical References in This Repo

Use these files as source examples while implementing the OTT version:

- package.json
- app/lib/types.ts
- app/lib/firebaseAdmin.ts
- app/lib/firebaseClient.ts
- app/lib/firebaseServer.ts
- app/lib/adminAuth.ts
- app/lib/adminAPI.ts
- app/lib/rateLimit.ts
- app/lib/security.ts
- app/lib/contentOrdering.ts
- app/lib/skillLogoCatalog.ts
- app/api/admin/projects/route.ts
- app/api/admin/content/route.ts
- app/api/chat/route.ts
- firestore.rules
- VERCEL_ENV_SETUP_GUIDE.md
- ADMIN_GUIDE.md
- API_REFERENCE.md

## 14. Final Notes for Your OTT Build

- This architecture is already proven in your current project and is suitable as a stable base for OTT.
- Preserve structure first, then rename entities and UX for OTT.
- Avoid parallel rewrites of frontend, backend, and schema in one shot; migrate module-by-module.
- Enforce checklists at every deploy to keep frontend, backend, and admin fully aligned.
