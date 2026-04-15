# 🚀 Admin Portal - Quick Reference

## Login
📍 **Local:** http://localhost:3000/admin/login
📍 **Live:** https://rahulchakradhar.vercel.app/admin/login

**Default Credentials:**
- Email: `admin@portfolio.com`
- Password: `Admin@12345`

⚠️ Change password after first login!

---

## Dashboard Sections

| Section | What You Can Do | Access Level |
|---------|-----------------|--------------|
| 🏠 **Dashboard** | View activity, stats, overview | View |
| 🎨 **Projects** | Create, edit, delete portfolio projects | Full Control |
| ⚡ **Skills** | Manage technical skills & expertise | Full Control |
| 📝 **Content** | Update portfolio bio, about, links | Full Control |
| 💬 **Messages** | View & reply to contact form submissions | Full Control |
| 📊 **Activity** | Audit trail of all changes | View Only |
| 👥 **Users** | Manage admin accounts & permissions | Admin Only |
| 🔒 **Security** | 2FA setup, password, sessions | Full Control |

---

## Quick Actions

### ✨ Add a Project
**Dashboard → Projects → Add New Project**
- Title, Description, Image
- Tech Stack Tags
- URLs (Live, GitHub)
- Feature on Homepage

### ⚡ Add a Skill
**Dashboard → Skills → Add Skill**
- Skill Name
- Category (Frontend, Backend, etc.)
- Proficiency Level (Beginner → Expert)
- Years of Experience

### 📝 Update Portfolio
**Dashboard → Content → Edit Portfolio**
- Headlines & Bio
- About Section
- Contact Info
- Social Links
- CV/Resume

### 💬 Respond to Messages
**Dashboard → Messages**
- View contact submissions
- Mark as read
- Reply via email
- Archive/Delete

---

## 🔒 Security Features

✅ **2FA Setup** - Scan QR code with authenticator app
✅ **Secure Login** - Email + Password
✅ **Session Tokens** - JWT with auto-logout
✅ **Email Verification** - OTP for sensitive actions
✅ **Activity Logs** - Track all admin changes
✅ **Role-Based Access** - Different permission levels

---

## 🎯 First Time Setup Checklist

- [ ] Login with default credentials
- [ ] Setup 2FA (enable on first login)
- [ ] Change admin password
- [ ] Add your projects
- [ ] Add your skills
- [ ] Update portfolio content
- [ ] Test contact form
- [ ] Verify messages appear
- [ ] Review activity log

---

## 📌 Pro Tips

1. **Drag & Drop** - Reorder projects and skills
2. **Bulk Edit** - Select multiple items (if available)
3. **Search** - Use search to find projects/messages quickly
4. **Export** - Download activity logs and messages
5. **Preview** - Preview portfolio changes before publish
6. **Mobile** - Responsive design works on tablets
7. **Keyboard Shortcuts** - Use Tab to navigate efficiently
8. **Auto-Save** - Changes save automatically

---

## ⚡ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Esc` | Close modals/dropdowns |
| `Ctrl+S` | Save form |
| `Ctrl+K` | Search |
| `Tab` | Navigate form fields |
| `Enter` | Submit form |
| `Delete` | Delete selected item |

---

## 🆘 Common Issues

| Problem | Solution |
|---------|----------|
| Login fails | Clear cache, check credentials, verify Firebase |
| 2FA code invalid | Sync device time, check app settings |
| Changes not saving | Check internet, verify permissions, refresh |
| Message not received | Check spam folder, verify contact API |
| Images not uploading | Check file size, format, Firebase storage |

---

## 📞 API Endpoints

**Authentication:**
- `POST /api/admin/auth/login` - Login
- `POST /api/admin/auth/verify-2fa` - Verify 2FA
- `POST /api/admin/auth/generate-2fa` - Generate 2FA

**Projects:**
- `GET /api/admin/projects` - List
- `POST /api/admin/projects` - Create
- `PUT /api/admin/projects/[id]` - Update
- `DELETE /api/admin/projects/[id]` - Delete

**Skills:**
- `GET /api/admin/skills` - List
- `POST /api/admin/skills` - Create
- `PUT /api/admin/skills/[id]` - Update
- `DELETE /api/admin/skills/[id]` - Delete

**Content:**
- `GET /api/admin/content` - Get portfolio content
- `PUT /api/admin/content` - Update portfolio content

**Messages:**
- `GET /api/admin/messages` - List messages
- `PUT /api/admin/messages/[id]` - Mark read/reply

**Activity:**
- `GET /api/admin/activity` - Get activity logs

---

## 🌐 Environment Variables

Required for Vercel deployment:
```
NEXT_PUBLIC_FIREBASE_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
NEXT_PUBLIC_FIREBASE_PROJECT_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID
FIREBASE_PROJECT_ID
FIREBASE_PRIVATE_KEY
FIREBASE_CLIENT_EMAIL
ADMIN_JWT_SECRET
```

---

## 📚 Related Documentation

- [Full Admin Guide](ADMIN_GUIDE.md)
- [Admin Credentials](ADMIN_CREDENTIALS.md)
- [Deployment Guide](DEPLOYMENT.md)
- [API Reference](API_REFERENCE.md)

---

**Created:** April 15, 2026
**Last Updated:** April 15, 2026
