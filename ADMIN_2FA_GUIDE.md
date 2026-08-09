# Admin Multi-Method 2FA

This document details the multi-factor authentication (2FA) architecture for the Admin portal, supporting Email OTP, Google Authenticator (TOTP), and Passkeys (WebAuthn).

---

## Purpose

The Admin 2FA system provides flexible, high-security authentication options for the website Administrator. Rather than forcing a single 2FA mechanism, the Admin can choose their preferred primary second factor while maintaining strict server-side policy enforcement.

---

## Supported Methods

1. **Email OTP** (Default, backward-compatible)
   - Sends a cryptographically generated 6-digit one-time code to the authorized Admin email address.
2. **Google Authenticator (TOTP)**
   - Uses Time-based One-Time Password (RFC 6238) compatible with Google Authenticator, Authy, 1Password, and standard TOTP authenticator apps.
3. **Passkey (WebAuthn / FIDO2)**
   - Leverages public-key cryptography and the Web Authentication API (`navigator.credentials`) for passwordless / biometric / security-key authentication.

---

## Admin Configuration

- **Location**: Admin Dashboard → Settings → Two-Factor Authentication
- **Selection Rule**: The Admin selects **ONE active primary 2FA method**.
- **State Indicators**:
  - `ACTIVE`: Currently selected 2FA method used for login verification.
  - `VERIFIED`: Configured and ready to be set active.
  - `NOT CONFIGURED`: Requires initial setup/registration before activation.

---

## Email OTP

- **Trigger Condition**:
  > Email OTP is generated and sent only when Email OTP is the active authentication method.
- **Server Enforcement**:
  The `/api/admin/auth/send-otp` endpoint checks `active2FAMethod` on the server before generating or emailing any OTP. If TOTP or Passkey is active, no email is sent and no OTP entry is written to Firestore.

---

## Google Authenticator (TOTP)

- **Standard**: RFC 6238 TOTP with SHA-1 algorithm, 6 digits, and 30-second time period.
- **Secret Generation**: Cryptographically secure 20-byte base32 secret generated server-side using `otplib`.
- **Provisioning URI Format**:
  Uses standard format:
  `otpauth://totp/{ISSUER}:{ACCOUNT}?secret={BASE32_SECRET}&issuer={ISSUER}`
- **QR Provisioning**: Generated as a PNG Data URI via `qrcode` from the provisioning URI.
- **Manual Setup Key**: Displayed alongside QR code formatted for easy typing.
- **Verification**: Occurs strictly server-side (`otplib.authenticator.verify`).
- **Secret Storage**: Encrypted at rest in Firestore `admin_security` collection using AES-256-GCM encryption with a key derived from server environment credentials.

---

## Passkeys (WebAuthn)

- **Standard**: FIDO2 / W3C Web Authentication API (`@simplewebauthn/server` and `@simplewebauthn/browser`).
- **Registration**:
  1. Server generates random WebAuthn registration challenge (`/api/admin/auth/passkey/register-options`).
  2. Client calls `navigator.credentials.create()`.
  3. Server verifies registration response (`verifyRegistrationResponse`), stores public key, credential ID, sign counter, and transports.
- **Authentication**:
  1. Server generates authentication challenge (`/api/admin/auth/passkey/login-options`).
  2. Client calls `navigator.credentials.get()`.
  3. Server verifies signature, RP ID, origin, and counter (`verifyAuthenticationResponse`).
- **Credential Security**: Private keys NEVER leave the user's authenticator device. Only public keys and metadata are stored on the server.

---

## Method Switching & Verification-Before-Activation

To prevent accidental lockout during configuration:
1. Admin selects a new method (e.g., Email OTP → Google Authenticator).
2. System initiates setup (generates secret / WebAuthn challenge).
3. Admin must **successfully verify** a code or biometric assertion.
4. Only upon successful verification does `active2FAMethod` update to the new method.
5. If verification fails or is cancelled, the existing 2FA method remains active without interruption.

---

## Recovery / Lockout Protection

- The system blocks deleting the last registered Passkey while Passkey is set as the active 2FA method.
- Existing Admin accounts without explicit 2FA configuration default safely to `EMAIL_OTP`.

---

## Security Considerations

- **Server-Side Enforcement**: All authentication decisions (which challenge to issue, verifying credentials, checking active method) are enforced by server API routes.
- **Rate Limiting**: `asyncEnforceAdminRateLimit` protects OTP, TOTP, and Passkey verification endpoints against brute-force attacks.
- **Secret Hygiene**: TOTP secrets and WebAuthn challenges are never logged, never exposed in client bundles, and encrypted at rest.
- **Origin Verification**: WebAuthn checks `expectedRPID` and `expectedOrigin` to prevent phishing and relay attacks.

---

## Files Changed

- [admin2FA.ts](file:///r:/Repo/portofolio/app/lib/admin2FA.ts) — Centralized 2FA Resolver & Firestore Persistence
- [send-otp/route.ts](file:///r:/Repo/portofolio/app/api/admin/auth/send-otp/route.ts) — Server check enforcing Email OTP rule
- [2fa-status/route.ts](file:///r:/Repo/portofolio/app/api/admin/auth/2fa-status/route.ts) — 2FA status query endpoint
- [totp/setup/route.ts](file:///r:/Repo/portofolio/app/api/admin/auth/totp/setup/route.ts) — TOTP secret & QR provisioning
- [totp/verify/route.ts](file:///r:/Repo/portofolio/app/api/admin/auth/totp/verify/route.ts) — TOTP setup & login verification
- [passkey/register-options/route.ts](file:///r:/Repo/portofolio/app/api/admin/auth/passkey/register-options/route.ts) — WebAuthn registration options
- [passkey/register-verify/route.ts](file:///r:/Repo/portofolio/app/api/admin/auth/passkey/register-verify/route.ts) — WebAuthn registration verification
- [passkey/login-options/route.ts](file:///r:/Repo/portofolio/app/api/admin/auth/passkey/login-options/route.ts) — WebAuthn login options
- [passkey/login-verify/route.ts](file:///r:/Repo/portofolio/app/api/admin/auth/passkey/login-verify/route.ts) — WebAuthn login assertion verification & session creation
- [passkey/manage/route.ts](file:///r:/Repo/portofolio/app/api/admin/auth/passkey/manage/route.ts) — Passkey management & deletion
- [2fa-method/route.ts](file:///r:/Repo/portofolio/app/api/admin/auth/2fa-method/route.ts) — Method activation endpoint
- [Security2FASection.tsx](file:///r:/Repo/portofolio/app/admin/dashboard/components/Security2FASection.tsx) — Admin 2FA Settings UI
- [SettingsTab.tsx](file:///r:/Repo/portofolio/app/admin/dashboard/components/SettingsTab.tsx) — Admin Settings dashboard integration
- [page.tsx (Admin Login)](file:///r:/Repo/portofolio/app/admin/login/page.tsx) — Login page 2FA method flow
