# Dynamic Admin-Controlled Favicon System

## Purpose
The Dynamic Admin Favicon feature allows website administrators to update, upload, replace, preview, enable, disable, and restore the portfolio website's favicon directly from the Admin Portal (`System & Media -> Branding -> Website Favicon`) at runtime without requiring manual code changes, image conversions, rebuilds, or deployments.

## Upload Flow
```
Admin Portal UI (System & Media -> Website Favicon)
  ↓
Upload Image File (PNG, JPG, WEBP, ICO, SVG)
  ↓
Server Validation (assertAdminSession, rateLimit, magic bytes signature, max 2MB)
  ↓
Image Normalization (Sharp resizes/fits into 64x64 square canvas, preserving aspect ratio & transparency)
  ↓
SVG Sanitization (Sharp rasterizes SVG to pure 64x64 PNG buffer, eliminating XSS vectors)
  ↓
Storage (Uploaded to Cloudinary CDN "portfolio/branding", with Base64 data URI fallback)
  ↓
Database Persistence (Updates faviconConfig object inside Firestore portfolio_content)
  ↓
Dynamic Favicon Endpoint (/api/favicon & /favicon.ico)
  ↓
Browser displays active Admin-selected favicon
```

## Supported Formats
- **PNG** (`image/png`)
- **JPG / JPEG** (`image/jpeg`, `image/jpg`)
- **WEBP** (`image/webp`)
- **ICO** (`image/x-icon`, `image/vnd.microsoft.icon`)
- **SVG** (`image/svg+xml`)

## Image Processing
Uploaded raster and vector images are normalized server-side using `sharp`:
1. Resized and fitted inside a 64×64 square canvas (`fit: 'contain'`) to prevent stretching.
2. Transparency is maintained (`background: { r: 0, g: 0, b: 0, alpha: 0 }`).
3. SVG files are rendered to a clean 64x64 PNG raster image server-side before storage, guaranteeing zero client-side XSS vulnerability while maintaining crisp display.

## Runtime Behavior
Changing the favicon in the Admin Portal takes effect immediately. The public website reads the current favicon configuration directly from Firestore on request via `/api/favicon` and `/favicon.ico`. Changing the favicon does **NOT** require:
- Rebuilding Next.js (`npm run build`)
- Redeploying to Vercel/hosting
- Modifying project source code
- Manually replacing `app/favicon.ico`

## Storage
- **Primary Storage**: Cloudinary CDN (`portfolio/branding` folder) providing secure edge delivery.
- **Fallback Storage**: If Cloudinary environment variables are missing or unconfigured, the system automatically uses inline base64 data URIs stored in Firestore so the system functions seamlessly out of the box in all environments.

## Security
- **Admin Authorization**: All upload (`POST`), toggle (`PUT`), and delete (`DELETE`) operations are strictly protected by `assertAdminSession(request)` and rate-limited.
- **File Validation**: Sever-side signature (magic bytes) checking validates PNG, JPEG, WEBP, ICO, and SVG file headers, ignoring fake file extensions. Max size is capped at 2MB.
- **SVG Safety**: SVGs are converted to PNGs via server-side rendering, ensuring no executable scripts or malicious attributes reach the client browser.
- **Audit Logging**: All favicon administration events are recorded in the admin audit log (`logAdminAudit`).

## Cache Strategy
- Public `/api/favicon` and `/favicon.ico` endpoints support version-based cache-busting (`/api/favicon?v=<timestamp>`).
- When `?v=` parameter is present, responses set `Cache-Control: public, max-age=86400, immutable`.
- When called without `v`, responses set `Cache-Control: public, max-age=3600, s-maxage=86400`.
- The version parameter changes only when an Admin uploads, replaces, enables, disables, or restores the favicon.

## Fallback Behavior
- When custom favicon is disabled or removed, `/api/favicon` and `/favicon.ico` serve the portfolio's default gold emblem (`PRC` logo asset stored in `public/icon.svg` and `public/default-favicon.ico`).

## Files Modified & Created

### Modified Files:
- [types.ts](file:///r:/Repo/portofolio/app/lib/types.ts) — Added `FaviconConfig` interface & extended `PortfolioContent`.
- [adminAPI.ts](file:///r:/Repo/portofolio/app/lib/adminAPI.ts) — Added `uploadFavicon`, `updateFaviconConfig`, and `removeFavicon` methods.
- [layout.tsx](file:///r:/Repo/portofolio/app/layout.tsx) — Updated `icons` metadata to point to `/api/favicon`.
- [manifest.ts](file:///r:/Repo/portofolio/app/manifest.ts) — Updated PWA manifest icon `src` to `/api/favicon`.
- [SettingsTab.tsx](file:///r:/Repo/portofolio/app/admin/dashboard/components/SettingsTab.tsx) — Added Website Favicon & Branding section with live tab preview and control actions.

### Created Files:
- [route.ts](file:///r:/Repo/portofolio/app/api/favicon/route.ts) — Public dynamic favicon handler.
- [route.ts](file:///r:/Repo/portofolio/app/favicon.ico/route.ts) — Root favicon handler forwarding to dynamic favicon logic.
- [route.ts](file:///r:/Repo/portofolio/app/api/admin/favicon/route.ts) — Authenticated Admin favicon management API.
- [DYNAMIC_FAVICON.md](file:///r:/Repo/portofolio/DYNAMIC_FAVICON.md) — Feature documentation.
