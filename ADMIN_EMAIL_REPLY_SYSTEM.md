# Admin Email Reply & Customer Communication System

## Purpose

The **Admin Email Reply System** provides a unified, secure, in-app communication portal within the Portfolio Admin Dashboard for responding directly to incoming:
1. **Contact Messages** (submitted via the public Contact form / modal)
2. **Hire Me Requests** (submitted via the `/hire` portal)

This feature enables the portfolio owner to compose and dispatch emails directly from the Admin interface using Nodemailer & Gmail SMTP without manually copying email addresses or leaving the dashboard.

---

## Supported Request Types

### 1. Contact Requests
- **Inbound Endpoint**: `/api/contact`
- **Database Collection**: Firestore `contact_messages`
- **Admin Section**: Admin Dashboard -> Communication Hub -> Contact Messages tab
- **Reply Subject**: `Re: [Original Customer Subject]`
- **Context Embedded**: Original message text and submitter details.

### 2. Hire Me Requests
- **Inbound Endpoint**: `/api/hire`
- **Database Collection**: Firestore `hire_requests`
- **Admin Section**: Admin Dashboard -> Communication Hub -> Hire Requests tab
- **Reply Subject**: `Re: Hiring Request — [ProjectType]`
- **Context Embedded**: Company, project type, budget, timeline, and description.

---

## System Architecture

```
CUSTOMER
   │ (Submits Contact or Hire Me form)
   ▼
FIRESTORE DATABASE (contact_messages / hire_requests)
   │
   ▼
ADMIN DASHBOARD (MessagesTab — Communication Hub)
   │ (Opens request details & composes reply)
   ▼
SERVER-SIDE API ROUTE (/api/send-reply)
   │ ├── 1. Session Auth (assertAdminSession & verifyAdminSession)
   │ ├── 2. DB Rate Limiter (enforceDbRateLimit)
   │ ├── 3. Authoritative Document Lookup (ticketId -> stored customer email)
   │ ├── 4. HTML Sanitization & Template Formatting
   │ └── 5. Nodemailer Transport Dispatch
   ▼
GMAIL SMTP SERVER (EMAIL_USER & EMAIL_PASS)
   │
   ▼
CUSTOMER INBOX
```

---

## Backend Endpoint Specification

### `POST /api/send-reply`

- **Authorization**: Mandatory Admin Session Cookie (`adminSession` or `admin-session`).
- **Rate Limit**: 20 requests / minute per admin user.
- **Request Body**:
  ```json
  {
    "requestType": "contact", // or "hire"
    "ticketId": "<FIRESTORE_DOC_ID>",
    "replyContent": "Hello! Thank you for reaching out..."
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "emailStatus": "success", // or "failed"
    "message": "Reply sent and logged successfully.",
    "reply": {
      "id": "reply_1786082400000_abc123",
      "emailId": "msg_1786082400000",
      "content": "Hello! Thank you for reaching out...",
      "repliedBy": "admin@domain.com",
      "repliedAt": "2026-08-12T21:48:00.000Z",
      "emailStatus": "success"
    }
  }
  ```

---

## Database Extensions

Replies are stored immutably in an array attribute `replies` inside the corresponding Firestore document (`contact_messages` or `hire_requests`).

### Schema Extensions:
```ts
export interface EmailReplyItem {
  id: string;
  emailId: string;
  content: string;
  repliedBy: string;
  repliedAt: string;
  emailStatus: 'success' | 'failed';
  attachments?: { name: string; url: string }[];
}

// Added to ContactMessage and HireRequest documents:
{
  replied: true,
  messageStatus: "Replied" | "Reply Failed",
  status: "contacted", // (for hire requests)
  replies: [ EmailReplyItem ]
}
```

---

## Security & Protection Controls

1. **Dual-Layer Admin Authentication**:
   - Primary: Firebase Admin Session Cookie verification (`assertAdminSession`).
   - Secondary: Signed HMAC Session Cookie verification (`verifyAdminSession`).
   - Unauthenticated requests receive `401 Unauthorized`.
2. **Authoritative Recipient Retrieval**:
   - The client passes `ticketId` and `requestType`.
   - The server queries Firestore directly to look up the stored document and retrieves the authoritative `email` field.
   - Client cannot supply or alter the recipient email address.
3. **HTML Sanitization**:
   - Outbound reply bodies are escaped to prevent XSS / script injection when embedded in HTML emails.
4. **Rate Limiting**:
   - Enforced per admin user to prevent spamming or mail quota exhaustion.
5. **Audit Logging**:
   - Admin actions are logged to `admin_activity_logs` in Firestore via `logAdminAudit`.

---

## Mail Configuration

Uses server-only environment variables in `.env.local` / Vercel Environment Variables:
- `EMAIL_USER`: Administrative Gmail address (e.g. `your-email@gmail.com`).
- `EMAIL_PASS`: Gmail App Password (16-character generated app password).

*Note: Environment variables are strictly server-side and never exposed to client-side bundles or `NEXT_PUBLIC_*` spaces.*

---

## Key Features in Admin UI

- **Draft Autosave**: Automatically persists active draft per request in `localStorage` (`reply_draft_<requestId>`). Cleared upon successful send.
- **Quick Reply Templates**:
  - *Contact*: Acknowledgment, Need More Info, Issue Resolved.
  - *Hire Me*: Received Ack, Schedule Call, Follow-up.
- **HTML Email Preview**: Toggleable in-app rendering of the outbound email before sending.
- **Reply History Log**: Displays past replies with timestamps, admin sender, content, and delivery badges.
- **Failure Resilience & Retry**: If SMTP dispatch fails, the reply is saved to Firestore with `emailStatus: 'failed'`, and an inline **Retry Send** button is presented.

---

## Verification & Build Results

- **TypeScript Compilation**: Clean (`npx tsc --noEmit` passed with 0 errors).
- **ESLint Check**: Passed (`npm run lint` passed clean).
- **Production Build**: Succeeded (`npm run build` completed successfully).
