# Admin Multi-Method 2FA Architecture Guide

This document details the multi-factor authentication (2FA) architecture for the Admin portal, supporting Email OTP, Google Authenticator (TOTP), and Passkeys (WebAuthn).

---

## Purpose

The Admin 2FA system provides flexible, high-security authentication options for the website Administrator. Rather than restricting the Admin to a single method or forcing one specific mechanism, multiple 2FA methods can be enabled in Admin Settings, allowing the Admin to choose their preferred verification method for each individual login.

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
- **Selection Model**: The Admin controls which 2FA methods are **ENABLED** for their account.
- **Enabled vs Configured**:
  - `Email OTP`: Enabled by default (can be toggled if another usable method exists).
  - `Google Authenticator`: Requires initial setup & 6-digit verification code before it can be enabled.
  - `Passkey`: Requires registering at least one WebAuthn credential before it can be enabled.
- **Lockout Prevention**: At least one usable 2FA method must remain enabled at all times.

---

## Login Flow & Method Selection

1. **Step 1: Credential Verification**
   - Admin enters Email and Password.
   - Primary credentials are validated by Firebase Auth.
   - Server returns the list of usable enabled methods (`usableMethods`).
   - **NO OTP email is sent during this step.**

2. **Step 2: Verification Method Selection**
   - The login UI presents a **Choose Verification Method** screen listing all available usable methods:
     - `Email OTP`: "Receive a verification code by email."
     - `Google Authenticator`: "Enter the code from your authenticator app."
     - `Passkey`: "Use your device passkey, biometric, PIN, or security key."
   - The Admin selects ONE method for the current login session.

3. **Step 3: Verification Execution**
   - **Email OTP**: OTP is generated and emailed **ONLY** when Email OTP is selected.
   - **Google Authenticator**: Prompts for 6-digit TOTP code. **NO email OTP is generated or sent.**
   - **Passkey**: Prompts for WebAuthn credential verification. **NO email OTP is generated or sent.**

4. **Step 4: Method Switching**
   - On challenge screens, a `"← Use another verification method"` action returns the Admin to the selection screen if multiple methods are enabled.

---

## Email OTP Trigger Rule

> **CRITICAL RULE**: Email OTP is generated and sent ONLY when the Admin explicitly selects Email OTP for the current login session.

The `/api/admin/auth/send-otp` endpoint checks `resolveUsable2FAMethods` on the server before generating or emailing any OTP. If TOTP or Passkey is used, no email is sent and no OTP entry is written to Firestore.

---

## Google Authenticator (TOTP)

- **Standard**: RFC 6238 TOTP with SHA-1 algorithm, 6 digits, and 30-second time period.
- **Secret Generation**: Cryptographically secure 20-byte base32 secret generated server-side using `otplib`.
- **Provisioning URI Format**:
  `otpauth://totp/{ISSUER}:{ACCOUNT}?secret={BASE32_SECRET}&issuer={ISSUER}`
- **QR Provisioning**: Generated as a PNG Data URI via `qrcode`.
- **Manual Setup Key**: Displayed alongside QR code formatted for easy typing.
- **Verification**: Occurs strictly server-side (`otplib.authenticator.verify`).
- **Secret Storage**: Encrypted at rest in Firestore `admin_security` collection using AES-256-GCM encryption with a key derived from server environment credentials.

---

## Passkeys (WebAuthn)

- **Standard**: FIDO2 / W3C Web Authentication API (`@simplewebauthn/server` and `@simplewebauthn/browser`).
- **Registration**:
  1. Server generates random WebAuthn registration challenge (`/api/admin/auth/passkey/register-options`).
  2. Client calls `navigator.credentials.create()`.
  3. Server verifies registration response (`verifyRegistrationResponse`), stores public key, credential ID, sign counter, and transports, and sets `enabledMethods.passkey = true`.
- **Authentication**:
  1. Server generates authentication challenge (`/api/admin/auth/passkey/login-options`).
  2. Client calls `navigator.credentials.get()`.
  3. Server verifies signature, RP ID, origin, and counter (`verifyAuthenticationResponse`).
- **Credential Security**: Private keys NEVER leave the user's authenticator device. Only public keys and metadata are stored on the server.

---

## Security Considerations

- **Server-Side Authorization**: All 2FA decisions (usable methods, challenge issuance, credential verification) are enforced by server API routes. Frontend requests for methods are strictly validated.
- **Rate Limiting**: `asyncEnforceAdminRateLimit` protects OTP, TOTP, and Passkey verification endpoints against brute-force attacks.
- **Secret Hygiene**: TOTP secrets and WebAuthn challenges are never logged, never exposed in client bundles, and encrypted at rest using AES-256-GCM.
- **Origin Verification**: WebAuthn checks `expectedRPID` and `expectedOrigin` to prevent phishing and relay attacks.

---

## Key Files

- [admin2FA.ts](file:///r:/Repo/portofolio/app/lib/admin2FA.ts) — Centralized 2FA resolver & AES-256-GCM encryption.
- [2fa-status/route.ts](file:///r:/Repo/portofolio/app/api/admin/auth/2fa-status/route.ts) — Endpoint returning `usableMethods` & `enabledMethods`.
- [2fa-config/route.ts](file:///r:/Repo/portofolio/app/api/admin/auth/2fa-config/route.ts) — Endpoint to enable/disable 2FA methods in Admin Settings.
- [send-otp/route.ts](file:///r:/Repo/portofolio/app/api/admin/auth/send-otp/route.ts) — Email OTP endpoint enforced to execute only when Email OTP is selected.
- [Security2FASection.tsx](file:///r:/Repo/portofolio/app/admin/dashboard/components/Security2FASection.tsx) — Admin Settings UI with independent method enablement toggles.
- [page.tsx (Admin Login)](file:///r:/Repo/portofolio/app/admin/login/page.tsx) — Multi-step login flow with method selection screen.
