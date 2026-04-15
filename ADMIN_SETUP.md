# Admin Backend Setup Guide

## 1. Environment Variables (.env.local)

Create a `.env.local` file in the project root with these variables:

```
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_KEY=your_service_role_key

# Email OTP (Resend)
RESEND_API_KEY=your_resend_api_key

# JWT Secret for session management
ADMIN_JWT_SECRET=your_secure_random_string_min_32_chars

# Cloudinary (for image upload)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=portfolio
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

**Cloudinary Setup:**
1. Go to https://cloudinary.com/console/settings/upload
2. Find "Upload presets" section
3. Create a new unsigned upload preset named "portfolio"
4. Enable "Unsigned requests"
5. Set folder: portfolio/projects

## 2. Supabase Database Tables

Run these SQL queries in Supabase SQL Editor:

```sql
-- Admin Users Table
CREATE TABLE admin_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  otp_secret VARCHAR(255),
  otp_enabled BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Portfolio Content Table
CREATE TABLE portfolio_content (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hero_title VARCHAR(255),
  hero_subtitle VARCHAR(255),
  hero_tagline TEXT,
  about_text TEXT,
  email VARCHAR(255),
  location VARCHAR(255),
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Projects Table
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  long_description TEXT,
  image_url VARCHAR(500),
  tech_stack TEXT[],
  github_url VARCHAR(255),
  demo_url VARCHAR(255),
  category VARCHAR(100),
  featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Skills Table
CREATE TABLE skills (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  proficiency INT CHECK (proficiency >= 0 AND proficiency <= 100),
  icon_name VARCHAR(100),
  color VARCHAR(50),
  bg_color VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Contact Messages Table
CREATE TABLE contact_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  first_name VARCHAR(255) NOT NULL,
  last_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  subject VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Email OTP Table (for verification and password reset)
CREATE TABLE email_otps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) NOT NULL,
  otp VARCHAR(6) NOT NULL,
  type VARCHAR(50) DEFAULT 'email_verification', -- 'email_verification' or 'password_reset'
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX idx_projects_featured ON projects(featured);
CREATE INDEX idx_skills_proficiency ON skills(proficiency);
CREATE INDEX idx_messages_read ON contact_messages(is_read);
CREATE INDEX idx_email_otps_email ON email_otps(email);
CREATE INDEX idx_email_otps_type ON email_otps(type);
```

## 3. Cloudinary Setup (for Free Image Storage)

1. Sign up at https://cloudinary.com (free tier: 5GB storage)
2. Get your Cloud Name, API Key, and API Secret
3. Add them to `.env.local`

## 4. Resend Setup (for Email OTP)

1. Sign up at https://resend.com (free tier: 100 emails/day)
2. Create an API key
3. Add to `.env.local` as `RESEND_API_KEY`

## 5. API Endpoints Reference

### Authentication Endpoints

**POST /api/auth/register-init**
- Purpose: Initiate registration with email
- Body: `{ email: string }`
- Rate: 5 attempts per 15 minutes per email
- Response: `{ success: true, email: string, message: string }`

**POST /api/auth/verify-email-otp**
- Purpose: Complete registration with OTP
- Body: `{ email: string, otp: string, name: string, password: string }`
- Validation: password ≥ 8 chars, OTP not expired (10 min window)
- Response: `{ success: true, user: { id, email, name } }`

**POST /api/auth/login**
- Purpose: Admin login
- Body: `{ email: string, password: string, totpCode?: string }`
- Rate: 5 attempts per 15 minutes per email
- Response: `{ success: true, user: { id, email, name } }` or `{ requiresTOTP: true }`
- Cookie: admin_token (httpOnly, 24hr expiration)

**POST /api/auth/setup-2fa**
- Purpose: Generate QR code and backup codes for Google Authenticator
- Auth: Bearer token required
- Response: `{ success: true, secret: string, qrCode: string, backupCodes: string[] }`

**POST /api/auth/verify-2fa**
- Purpose: Verify TOTP code and complete login
- Body: `{ email: string, totpCode: string }`
- Validation: TOTP code ≥ 6 digits, verify against stored secret
- Response: `{ success: true, user: { id, email, name } }`
- Cookie: admin_token (httpOnly, 24hr expiration)

**POST /api/auth/logout**
- Purpose: Logout and clear session cookie
- Auth: Bearer token required
- Response: `{ success: true, message: string }`

**POST /api/auth/password-reset-request**
- Purpose: Request password reset via email OTP
- Body: `{ email: string }`
- Rate: 5 attempts per 15 minutes per email
- Response: `{ success: true, message: string }` (always success for privacy)

**POST /api/auth/password-reset-confirm**
- Purpose: Reset password with OTP verification
- Body: `{ email: string, otp: string, newPassword: string }`
- Validation: password ≥ 8 chars, OTP valid and not expired
- Response: `{ success: true, message: string }`

### Content Management Endpoints

**GET /api/admin/content**
- Purpose: Get portfolio content (public)
- Response: `{ content: { heroTitle, heroSubtitle, heroTagline, aboutText, email, location } }`

**PUT /api/admin/content**
- Purpose: Update portfolio content
- Auth: Bearer token required
- Body: `{ heroTitle?, heroSubtitle?, heroTagline?, aboutText?, email?, location? }`
- Response: `{ success: true, content: object }`

### Projects Management

**GET /api/admin/projects**
- Purpose: List all projects (public)
- Response: `{ projects: array }`

**POST /api/admin/projects**
- Purpose: Create new project
- Auth: Bearer token required
- Body: `{ title: string, description: string, longDescription?, imageUrl?, techStack[], githubUrl?, demoUrl?, category?, featured? }`
- Response: `{ success: true, project: object }`

**GET /api/admin/projects/[id]**
- Purpose: Get single project (public)
- Response: `{ project: object }`

**PUT /api/admin/projects/[id]**
- Purpose: Update project
- Auth: Bearer token required
- Body: Same as POST
- Response: `{ success: true, project: object }`

**DELETE /api/admin/projects/[id]**
- Purpose: Delete project
- Auth: Bearer token required
- Response: `{ success: true, message: string }`

### Skills Management

**GET /api/admin/skills**
- Purpose: List all skills (public)
- Response: `{ skills: array }`

**POST /api/admin/skills**
- Purpose: Create new skill
- Auth: Bearer token required
- Body: `{ title: string, description?, proficiency: number (0-100)?, iconName?, color?, bgColor? }`
- Response: `{ success: true, skill: object }`

**GET /api/admin/skills/[id]**
- Purpose: Get single skill (public)
- Response: `{ skill: object }`

**PUT /api/admin/skills/[id]**
- Purpose: Update skill
- Auth: Bearer token required
- Body: Same as POST
- Response: `{ success: true, skill: object }`

**DELETE /api/admin/skills/[id]**
- Purpose: Delete skill
- Auth: Bearer token required
- Response: `{ success: true, message: string }`

### Messages Management

**GET /api/admin/messages**
- Purpose: List contact messages
- Auth: Bearer token required
- Query: `?unread=true` (optional filter)
- Response: `{ messages: array }`

**PUT /api/admin/messages**
- Purpose: Mark message as read/unread
- Auth: Bearer token required
- Body: `{ messageId: string, isRead: boolean }`
- Response: `{ success: true, message: object }`

**DELETE /api/admin/messages**
- Purpose: Delete message
- Auth: Bearer token required
- Body: `{ messageId: string }`
- Response: `{ success: true, message: string }`

### Image Upload

**POST /api/admin/upload**
- Purpose: Upload project image to Cloudinary
- Auth: Bearer token required
- Body: FormData with `file` field (JPEG, PNG, WebP, GIF max 5MB)
- Response: `{ success: true, image: { url: string, publicId: string, width: number, height: number } }`

**DELETE /api/admin/upload**
- Purpose: Delete image from Cloudinary
- Auth: Bearer token required
- Body: `{ publicId: string }`
- Response: `{ success: true, message: string }`
