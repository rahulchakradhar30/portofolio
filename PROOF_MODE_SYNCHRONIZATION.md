# Proof Mode Production Synchronization

## Previous Problem

After updating Proof Mode content from the Admin Portal, the updated data was visible in the current admin browser. However, when opening the deployed website in Incognito mode, in a different browser, or on a separate device, the old stale state (or empty state stating *"Proof Mode is being prepared."*) was rendered. 

This caused published Proof Mode configurations to not be consumed by fresh public visitors.

## Root Cause Analysis

The issue was caused by a combination of Next.js Route Handler static caching and missing HTTP cache-control headers on API responses:

1. **Missing Route Handler Dynamic Declarations**:
   The Route Handlers `app/api/admin/proof-mode/route.ts` and `app/api/admin/proof-mode/[id]/route.ts` lacked explicit `export const dynamic = 'force-dynamic'` and `export const revalidate = 0` configuration. In Next.js App Router, GET route handlers without dynamic declarations are subject to static build-time generation and server-side route caching.

2. **Missing Response Cache-Control Headers**:
   The GET response helper did not return `Cache-Control: no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0` headers. As a result, edge CDNs (such as Vercel Edge Network) and browser HTTP caches retained and served the initial GET response for `/api/admin/proof-mode`.

3. **Query Parameter Discrepancy Bypassing Cache for Admin Only**:
   When saving or refreshing within the Admin Portal, the Admin UI fetched data via `adminAPI.getProofExperiences(true)` -> `/api/admin/proof-mode?includeDrafts=true`. The query parameter `?includeDrafts=true` created a distinct request key that bypassed the public GET `/api/admin/proof-mode` cache. Meanwhile, public visitors requested `/api/admin/proof-mode` (without query params) and continued to receive the stale cached response.

4. **Public Client Fetch Without `cache: 'no-store'`**:
   The public page component (`app/proof-mode/page.tsx`) fetched `/api/admin/proof-mode` without specifying `{ cache: "no-store" }`, allowing local browser cache to re-use stale responses.

## Data Flow Architecture

```
ADMIN PORTAL
    ↓
Admin edits & publishes Proof Experience
    ↓
PUT/POST /api/admin/proof-mode (Authenticated & Audit Logged)
    ↓
Firestore Collection: proof_experiences (Persistent Storage)
    ↓
Public Visitor opens /proof-mode
    ↓
GET /api/admin/proof-mode (dynamic = 'force-dynamic', Cache-Control: no-store)
    ↓
Firestore Query: where('published', '==', true)
    ↓
Fresh JSON payload returned to Client
    ↓
Rendered Proof Mode UI
```

## Persistence

Proof Mode data is stored in Google Cloud Firestore under the `proof_experiences` collection. Each document contains:
- `title` (string)
- `category` (string)
- `shortDescription` (string)
- `projectId` (string reference to `projects` collection)
- `problem` (string)
- `approach` (string)
- `technicalDetails` (string)
- `demonstrationType` (`architecture_visualizer` | `before_after` | `decision_simulation` | `system_flow` | `interactive_demo`)
- `demonstrationConfig` (object)
- `result` (string)
- `evidenceLinks` (array of `{ label, url, type }`)
- `published` (boolean)
- `order` (number)
- `created_at` & `updated_at` (ISO timestamp strings)

Database writes use `serverFirebaseHelpers` (Firebase Admin SDK) which guarantees server-side persistence.

## Caching Strategy

To ensure zero latency stale data issues while avoiding global cache degradation:

- **Targeted Dynamic Execution**: `export const dynamic = 'force-dynamic'` and `export const revalidate = 0` are exported exclusively on Proof Mode API routes (`/api/admin/proof-mode` and `/api/admin/proof-mode/[id]`).
- **HTTP Cache Control Headers**: Responses from `/api/admin/proof-mode` include `Cache-Control: no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0` to ensure CDN and browser caches never freeze Proof Mode GET responses.
- **Explicit Client Fetch Policy**: Client components fetch `/api/admin/proof-mode` with `{ cache: "no-store" }`.

## Fallback Rules

- **Valid Published Backend Data**: Always rendered when `proofExperiences.length > 0`.
- **Prepared Empty State**: The *"Proof Mode is being prepared."* state is rendered **ONLY** when Firestore contains 0 published items (`published == true`). It never overrides valid server data.

## Security

- **Admin Write Protection**: All POST, PUT, and DELETE operations require session validation (`assertAdminSession`), rate limiting (`enforceRateLimit`), and audit logging (`logAdminAudit`).
- **Public Read Access**: Public GET requests return ONLY items where `published == true`. Unauthenticated requests cannot read draft items.
- **Firestore Security Rules**: Rules enforce `match /proof_experiences/{proofId} { allow read: if true; allow write: if isAdmin(); }`.

## Verification & Testing Matrix

| Test Scenario | Action | Expected Result |
| :--- | :--- | :--- |
| **TEST A — Admin Save** | Save new Proof Experience in Admin Portal | Database returns HTTP 200/201 with updated fields in Firestore |
| **TEST B — Same Browser** | Visit `/proof-mode` in same browser | Latest published Proof Experience renders |
| **TEST C — Incognito** | Open `/proof-mode` in Incognito mode | Identical latest published Proof Experience renders |
| **TEST D — Different Browser** | Open `/proof-mode` in another browser | Identical latest published Proof Experience renders |
| **TEST E — Different Device** | Open `/proof-mode` on another device | Identical latest published Proof Experience renders |
| **TEST F — Hard Refresh** | Press `Ctrl + Shift + R` | Latest published Proof Experience persists |
| **TEST G — Logout** | Logout from Admin & visit `/proof-mode` | Latest published Proof Experience remains visible |
