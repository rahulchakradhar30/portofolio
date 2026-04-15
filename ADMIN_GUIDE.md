# 📚 Admin Portal Complete Guide

## 🔐 Login & Access

### Default Credentials
```
Email:    admin@portfolio.com
Password: Admin@12345
```

### Access URLs
- **Local Development:** `http://localhost:3000/admin/login`
- **Production (Vercel):** `https://rahulchakradhar.vercel.app/admin/login`

---

## ✨ Dashboard Features

### 1️⃣ **Authentication & Security**
- ✅ Email/Password login
- ✅ Sign up for new admin accounts
- ✅ Two-Factor Authentication (2FA) with TOTP
- ✅ JWT session tokens
- ✅ Secure logout
- ✅ Password reset via email OTP
- ⚠️ **IMPORTANT:** Change default password after first login

### 2️⃣ **Dashboard Overview**
Main landing page after login showing:
- Activity summary
- Recent changes
- Quick access to all features
- System status

### 3️⃣ **Projects Management** 📁
Full CRUD operations for portfolio projects:

**Create New Project:**
- Project title
- Detailed description
- Project image/thumbnail
- Technology stack (tags)
- Live URL / GitHub repository links
- Completion date
- Featured flag (show on homepage)

**Edit Project:**
- Update any project information
- Change images and links
- Modify categories and tags
- Update status (In Progress / Completed)

**Delete Project:**
- Remove projects from portfolio
- Soft delete with archive option

**View All Projects:**
- List all portfolio projects
- Filter by category/tag
- Search by title
- Pagination support

### 4️⃣ **Skills Management** ⚡
Organize and display your technical skills:

**Add Skills:**
- Skill name
- Category (Frontend, Backend, Database, Tools, etc.)
- Proficiency level (Beginner, Intermediate, Advanced, Expert)
- Years of experience

**Edit Skills:**
- Update skill details
- Change category or proficiency
- Reorder skills for display priority

**Delete Skills:**
- Remove outdated skills
- Clean up unused entries

**Display Options:**
- Skills appear on homepage
- Filtered by category
- Sorted by proficiency level
- Visual proficiency indicators

### 5️⃣ **Portfolio Content** 📄
Manage overall portfolio information:

**Update Portfolio Details:**
- Portfolio title/headline
- Professional bio/about section
- Contact email
- Social media links
- CV/Resume download link

**Manage "About" Section:**
- Personal introduction
- Professional background
- Career goals
- Areas of expertise
- Team/company information

### 6️⃣ **Contact Messages** 💬
Monitor and manage visitor inquiries:

**View Messages:**
- See all contact form submissions
- Timestamp of each message
- Sender's name, email, phone
- Message content
- Subject line

**Message Actions:**
- Mark as read/unread
- Reply to messages (via email)
- Archive important messages
- Delete spam/unwanted messages
- Search and filter messages
- Export message history

### 7️⃣ **Activity Log** 📊
Complete audit trail of all admin actions:

**Track:**
- Who made changes (admin user)
- What was changed (project, skill, content, etc.)
- When it happened (timestamp)
- Type of action (Create, Update, Delete)
- Before/after values (for audit purposes)

**Features:**
- Filter by date range
- Search by user or action type
- Export activity logs
- Real-time activity updates

### 8️⃣ **User Management** 👥
Manage admin accounts and permissions:

**Admin User Actions:**
- View all admin users
- Create new admin accounts
- Edit user roles and permissions
- Deactivate/activate users
- Reset user passwords
- Assign 2FA requirements

**User Roles:**
- Super Admin (full access)
- Admin (content management)
- Editor (limited editing)
- Viewer (read-only access)

---

## 🔒 Security Features

✅ **Firebase Authentication**
- Secure password storage
- OAuth 2.0 integration ready
- Email verification
- Password reset via OTP

✅ **Two-Factor Authentication (2FA)**
- Time-based One-Time Password (TOTP)
- QR code generation
- Compatible with Google Authenticator, Authy, Microsoft Authenticator
- Required for sensitive operations

✅ **Session Management**
- JWT tokens with expiration
- Secure cookie storage
- Automatic logout on inactivity
- Device fingerprinting

✅ **Data Protection**
- Firestore database encryption
- HTTPS/TLS for all connections
- Environment variables for secrets
- Role-based access control (RBAC)

---

## 🚀 Getting Started

### First Time Setup

1. **Access Login Page**
   - Go to `http://localhost:3000/admin/login` (local)
   - Or `https://rahulchakradhar.vercel.app/admin/login` (production)

2. **Login or Sign Up**
   - Use default credentials to login
   - OR click "Sign Up" to create your own account

3. **Setup 2FA** (Recommended)
   - System will prompt you to enable 2FA
   - Scan QR code with authenticator app
   - Enter verification code
   - Save backup codes in secure location

4. **Change Default Password**
   - Go to account settings
   - Update password to something secure
   - Choose a strong, unique password

5. **Start Managing Portfolio**
   - Add your projects
   - Add your skills
   - Update portfolio content
   - Monitor contact messages

---

## 📋 Workflow Examples

### Add a New Project
1. Click "Projects" in sidebar
2. Click "Add New Project" button
3. Fill in project details
4. Upload project image
5. Add technology tags
6. Click "Save Project"
7. Project appears on portfolio homepage

### Update Skills Section
1. Go to "Skills" section
2. Click "Add New Skill" or edit existing skill
3. Enter skill name and category
4. Set proficiency level
5. Save changes
6. Skills auto-update on portfolio

### Respond to Contact Message
1. Go to "Messages"
2. Click on unread message
3. Review sender details
4. Click "Reply"
5. Compose email response
6. Send reply (auto-emails visitor)
7. Mark as resolved

### Enable 2FA for New Admin
1. Go to "User Management"
2. Find user to secure
3. Click "Enable 2FA"
4. Share QR code with user
5. User scans and confirms
6. 2FA is now active

---

## 🔧 API Endpoints (Backend Integration)

All admin operations use these secure API endpoints:

```
POST   /api/admin/auth/login               - Login
POST   /api/admin/auth/verify-2fa          - Verify 2FA code
POST   /api/admin/auth/generate-2fa        - Generate 2FA QR code
GET    /api/admin/auth/me                  - Get current user
POST   /api/admin/projects                 - Create project
GET    /api/admin/projects                 - List all projects
PUT    /api/admin/projects/[id]            - Update project
DELETE /api/admin/projects/[id]            - Delete project
POST   /api/admin/skills                   - Create skill
GET    /api/admin/skills                   - List all skills
PUT    /api/admin/skills/[id]              - Update skill
DELETE /api/admin/skills/[id]              - Delete skill
GET    /api/admin/messages                 - List messages
PUT    /api/admin/content                  - Update portfolio content
GET    /api/admin/activity                 - Get activity logs
```

---

## ⚠️ Important Notes

1. **Backup Your Data**
   - Regularly export your projects and messages
   - Keep backups of important content

2. **Security Best Practices**
   - Never share your login credentials
   - Always use 2FA
   - Change password regularly
   - Log out when not using dashboard

3. **Browser Compatibility**
   - Works on Chrome, Firefox, Safari, Edge
   - Requires JavaScript enabled
   - Best experience on desktop browsers

4. **Firebase Setup**
   - Ensure Firebase project is active
   - Firestore database must be created
   - Storage bucket configured for file uploads
   - Authentication providers enabled

---

## 🆘 Troubleshooting

**Can't login?**
- Check email/password spelling
- Ensure Firebase is initialized
- Clear browser cache and cookies
- Try private/incognito mode

**2FA not working?**
- Check device time is synced
- Ensure authenticator app is up-to-date
- Try regenerating QR code

**Changes not saving?**
- Check internet connection
- Verify Firebase permissions
- Check browser console for errors
- Try refreshing the page

**Messages not appearing?**
- Verify Firestore structure
- Check collection permissions
- Ensure contact form is posting to API
- Check API endpoint configuration

---

## 📞 Support

For issues or feature requests:
- Check the troubleshooting guide above
- Review Firebase Console for errors
- Check browser console (F12) for JavaScript errors
- Review API response status codes

---

**Last Updated:** April 15, 2026
**Next Review:** Monthly security audit recommended
