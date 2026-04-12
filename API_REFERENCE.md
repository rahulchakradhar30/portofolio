# Complete Backend API Reference

## Authentication Flow

### 1. Registration with Email OTP

**Flow:**
```
User Email → Generate OTP → Send Email → User enters OTP → Create Account → JWT Token
```

**Step 1: POST /api/auth/register-init**
```json
{
  "email": "admin@example.com"
}
```
Response (200):
```json
{
  "success": true,
  "email": "admin@example.com",
  "message": "OTP sent to email"
}
```

**Step 2: POST /api/auth/verify-email-otp**
```json
{
  "email": "admin@example.com",
  "otp": "123456",
  "name": "Admin Name",
  "password": "SecurePassword123"
}
```
Response (200):
```json
{
  "success": true,
  "user": {
    "id": "uuid-123",
    "email": "admin@example.com",
    "name": "Admin Name"
  }
}
```
Sets HTTP-only cookie: `admin_token`

---

### 2. Login (Basic)

**POST /api/auth/login**
```json
{
  "email": "admin@example.com",
  "password": "SecurePassword123"
}
```

Response 1 - No 2FA (200):
```json
{
  "success": true,
  "user": {
    "id": "uuid-123",
    "email": "admin@example.com",
    "name": "Admin Name"
  }
}
```
Sets HTTP-only cookie: `admin_token`

Response 2 - 2FA Required (202):
```json
{
  "requiresTOTP": true,
  "message": "2FA code required"
}
```

---

### 3. Two-Factor Authentication (2FA) Setup

**Step 1: POST /api/auth/setup-2fa**
- Requires: `Authorization: Bearer {jwt_token}`

Response (200):
```json
{
  "success": true,
  "secret": "JBSWY3DPEBLW64TMMQ======",
  "qrCode": "data:image/png;base64,...",
  "backupCodes": [
    "ABC12345",
    "XYZ67890",
    ...8 more codes
  ],
  "message": "Scan QR code with Google Authenticator"
}
```

**Step 2: User scans QR code with Google Authenticator app**

---

### 4. Login with 2FA

**POST /api/auth/login** (2FA enabled)
```json
{
  "email": "admin@example.com",
  "password": "SecurePassword123",
  "totpCode": "123456"
}
```

Response (200):
```json
{
  "success": true,
  "user": {
    "id": "uuid-123",
    "email": "admin@example.com",
    "name": "Admin Name"
  }
}
```
Sets HTTP-only cookie: `admin_token`

---

### 5. Password Reset Flow

**Step 1: POST /api/auth/password-reset-request**
```json
{
  "email": "admin@example.com"
}
```

Response (200):
```json
{
  "success": true,
  "message": "If an account exists with that email, a reset link has been sent.",
  "email": "admin@example.com"
}
```
Sends OTP to email (same format as registration)

**Step 2: POST /api/auth/password-reset-confirm**
```json
{
  "email": "admin@example.com",
  "otp": "123456",
  "newPassword": "NewSecurePassword123"
}
```

Response (200):
```json
{
  "success": true,
  "message": "Password has been reset successfully"
}
```

---

### 6. Logout

**POST /api/auth/logout**
- Requires: `Authorization: Bearer {jwt_token}`

Response (200):
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```
Clears `admin_token` cookie

---

## Content Management

### Portfolio Content

**GET /api/admin/content** (Public)
```
No authentication required
```

Response (200):
```json
{
  "content": {
    "heroTitle": "Welcome",
    "heroSubtitle": "I'm a Developer",
    "heroTagline": "Building amazing things",
    "aboutText": "About me...",
    "email": "contact@example.com",
    "location": "San Francisco, CA"
  }
}
```

**PUT /api/admin/content**
- Requires: `Authorization: Bearer {jwt_token}`

Request:
```json
{
  "heroTitle": "Hello, I'm John",
  "heroSubtitle": "Full Stack Developer",
  "heroTagline": "Passionate about web development",
  "aboutText": "I specialize in React and Node.js",
  "email": "john@example.com",
  "location": "New York, NY"
}
```

Response (200):
```json
{
  "success": true,
  "content": {
    "id": "uuid-123",
    "heroTitle": "Hello, I'm John",
    ...
    "updated_at": "2024-01-15T10:30:00Z"
  }
}
```

---

## Projects Management

### List Projects

**GET /api/admin/projects** (Public)
```
No authentication required
```

Response (200):
```json
{
  "projects": [
    {
      "id": "uuid-123",
      "title": "E-Commerce Platform",
      "description": "Full-stack e-commerce with Stripe",
      "longDescription": "Detailed description...",
      "imageUrl": "https://cloudinary.com/...",
      "techStack": ["Next.js", "React", "Node.js", "PostgreSQL"],
      "githubUrl": "https://github.com/...",
      "demoUrl": "https://demo.example.com",
      "category": "Full Stack",
      "featured": true,
      "created_at": "2024-01-15T10:00:00Z",
      "updated_at": "2024-01-15T10:00:00Z"
    }
  ]
}
```

### Create Project

**POST /api/admin/projects**
- Requires: `Authorization: Bearer {jwt_token}`

Request:
```json
{
  "title": "E-Commerce Platform",
  "description": "Full-stack e-commerce with Stripe",
  "longDescription": "Detailed project description with features",
  "imageUrl": "https://cloudinary.com/image.jpg",
  "techStack": ["Next.js", "React", "Node.js", "PostgreSQL"],
  "githubUrl": "https://github.com/user/repo",
  "demoUrl": "https://demo.example.com",
  "category": "Full Stack",
  "featured": true
}
```

Response (201):
```json
{
  "success": true,
  "project": {
    "id": "uuid-123",
    "title": "E-Commerce Platform",
    ...
    "created_at": "2024-01-15T10:00:00Z"
  }
}
```

### Get Single Project

**GET /api/admin/projects/:id** (Public)
```
No authentication required
```

Response (200):
```json
{
  "project": {
    "id": "uuid-123",
    "title": "E-Commerce Platform",
    ...
  }
}
```

### Update Project

**PUT /api/admin/projects/:id**
- Requires: `Authorization: Bearer {jwt_token}`

Request: Same as POST

Response (200):
```json
{
  "success": true,
  "project": {
    "id": "uuid-123",
    ...
    "updated_at": "2024-01-15T11:30:00Z"
  }
}
```

### Delete Project

**DELETE /api/admin/projects/:id**
- Requires: `Authorization: Bearer {jwt_token}`

Response (200):
```json
{
  "success": true,
  "message": "Project deleted successfully"
}
```

---

## Skills Management

### List Skills

**GET /api/admin/skills** (Public)

Response (200):
```json
{
  "skills": [
    {
      "id": "uuid-123",
      "title": "React",
      "description": "16+ years experience",
      "proficiency": 95,
      "iconName": "ReactIcon",
      "color": "#61dafb",
      "bgColor": "#f0f9ff",
      "created_at": "2024-01-15T10:00:00Z",
      "updated_at": "2024-01-15T10:00:00Z"
    }
  ]
}
```

### Create Skill

**POST /api/admin/skills**
- Requires: `Authorization: Bearer {jwt_token}`

Request:
```json
{
  "title": "React",
  "description": "16+ years experience with React",
  "proficiency": 95,
  "iconName": "ReactIcon",
  "color": "#61dafb",
  "bgColor": "#f0f9ff"
}
```

Response (201):
```json
{
  "success": true,
  "skill": {
    "id": "uuid-123",
    "title": "React",
    ...
    "created_at": "2024-01-15T10:00:00Z"
  }
}
```

**Proficiency Validation:** Must be 0-100

### Get Single Skill

**GET /api/admin/skills/:id** (Public)

Response (200):
```json
{
  "skill": {
    "id": "uuid-123",
    "title": "React",
    ...
  }
}
```

### Update Skill

**PUT /api/admin/skills/:id**
- Requires: `Authorization: Bearer {jwt_token}`

Request: Same as POST

Response (200):
```json
{
  "success": true,
  "skill": {
    "id": "uuid-123",
    ...
    "updated_at": "2024-01-15T11:30:00Z"
  }
}
```

### Delete Skill

**DELETE /api/admin/skills/:id**
- Requires: `Authorization: Bearer {jwt_token}`

Response (200):
```json
{
  "success": true,
  "message": "Skill deleted successfully"
}
```

---

## Contact Messages Management

### List Messages

**GET /api/admin/messages**
- Requires: `Authorization: Bearer {jwt_token}`
- Query: `?unread=true` (optional, filter to unread only)

Response (200):
```json
{
  "messages": [
    {
      "id": "uuid-123",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com",
      "subject": "Interested in collaboration",
      "message": "I'd like to discuss a project...",
      "isRead": false,
      "created_at": "2024-01-15T10:00:00Z"
    }
  ]
}
```

### Mark Message as Read/Unread

**PUT /api/admin/messages**
- Requires: `Authorization: Bearer {jwt_token}`

Request:
```json
{
  "messageId": "uuid-123",
  "isRead": true
}
```

Response (200):
```json
{
  "success": true,
  "message": {
    "id": "uuid-123",
    "isRead": true
  }
}
```

### Delete Message

**DELETE /api/admin/messages**
- Requires: `Authorization: Bearer {jwt_token}`

Request:
```json
{
  "messageId": "uuid-123"
}
```

Response (200):
```json
{
  "success": true,
  "message": "Message deleted successfully"
}
```

---

## Image Upload

### Upload Image to Cloudinary

**POST /api/admin/upload**
- Requires: `Authorization: Bearer {jwt_token}`
- Content-Type: `multipart/form-data`

Request:
```
FormData:
  - file: <image_file> (JPEG, PNG, WebP, GIF, max 5MB)
```

Response (200):
```json
{
  "success": true,
  "image": {
    "url": "https://res.cloudinary.com/...",
    "publicId": "portfolio/projects/...",
    "width": 1920,
    "height": 1080
  }
}
```

### Delete Image from Cloudinary

**DELETE /api/admin/upload**
- Requires: `Authorization: Bearer {jwt_token}`

Request:
```json
{
  "publicId": "portfolio/projects/abc123"
}
```

Response (200):
```json
{
  "success": true,
  "message": "Image deleted successfully"
}
```

---

## Authentication Header Format

All admin endpoints require:
```
Authorization: Bearer {jwt_token}
```

Where `{jwt_token}` is obtained from login response and stored in HTTP-only cookie.

---

## Rate Limiting

- `/api/auth/register-init`: 5 attempts per 15 minutes per email
- `/api/auth/login`: 5 attempts per 15 minutes per email
- `/api/auth/password-reset-request`: 5 attempts per 15 minutes per email

---

## Error Responses

All errors follow this format:

```json
{
  "error": "Error message describing what went wrong"
}
```

Common HTTP Status Codes:
- `200`: Success
- `201`: Created
- `202`: Accepted (2FA required)
- `400`: Bad Request
- `401`: Unauthorized
- `404`: Not Found
- `429`: Too Many Requests (rate limit)
- `500`: Server Error

---

## Security Notes

1. **JWT Tokens:** Valid for 24 hours
2. **OTP Codes:** Expire after 10 minutes
3. **TOTP Window:** Accepts ±2 time windows (30-second intervals)
4. **Passwords:** Minimum 8 characters, SHA-256 hashed
5. **Cookie Flags:** HttpOnly, SameSite=strict (admin paths only)
6. **File Uploads:** Max 5MB, validates MIME type
