# Portfolio Admin - Image Upload & Projects Integration Guide

## Overview
Your portfolio frontend is now fully connected to the admin backend with image upload capabilities for projects and hero banner. Admin can manage all projects, skills, and content with images from the dashboard.

## Features Added

### 1. **Image Upload for Projects**
- Upload project thumbnail images in PNG, JPG, or other image formats
- Max file size: 5MB per image
- Images are converted to base64 data URLs and stored in Firestore
- Preview available before saving

### 2. **Hero Banner Image**
- Add a banner image for the hero section of your homepage
- Upload in Content tab → Hero Banner Image
- Fully customizable with text overlay

### 3. **Seed Data**
- Sample projects and skills ready to be seeded into database
- Includes 4 featured projects and 6 skills

## How to Use

### Step 1: Seed Initial Data (Optional)
If you want to populate the database with sample projects and skills:

```bash
curl -X POST http://localhost:3000/api/admin/seed \
  -H "Authorization: Bearer seed-admin-key" \
  -H "Content-Type: application/json" \
  -d '{"action": "seed"}'
```

Or in production:
```bash
curl -X POST https://your-portfolio.vercel.app/api/admin/seed \
  -H "Authorization: Bearer seed-admin-key" \
  -H "Content-Type: application/json" \
  -d '{"action": "seed"}'
```

### Step 2: Access Admin Dashboard
1. Go to `/admin/dashboard`
2. Login (currently no auth required - implement later)

### Step 3: Manage Projects
1. Click **Projects** tab in sidebar
2. Click **Add Project** button
3. Fill in project details:
   - **Title**: Project name
   - **Description**: Short description (visible on homepage)
   - **Tech Stack**: Comma-separated technologies (e.g., "React, Node.js, MongoDB")
   - **GitHub URL**: Link to GitHub repository
   - **Demo URL**: Link to live demo
   - **Category**: Project category (e.g., "AI", "Web", "Tools")
   - **Project Image**: Upload thumbnail image
   - **Featured**: Check to highlight on homepage
4. Click **Add Project** to save

### Step 4: Manage Skills
1. Click **Skills** tab in sidebar
2. Click **Add Skill** button
3. Fill in skill details:
   - **Skill Title**: Name of the skill
   - **Skill Description**: Description of what you can do
   - **Proficiency**: Drag slider to set proficiency (0-100%)
4. Click **Add Skill** to save

### Step 5: Update Hero Banner & Content
1. Click **Content** tab in sidebar
2. Click **Edit** button
3. Update:
   - **Hero Title**: Main heading (e.g., "PEREPOGU RAHUL CHAKRADHAR")
   - **Hero Subtitle**: Tagline/subtitle
   - **Hero Tagline**: Additional tagline
   - **Hero Banner Image**: Upload a banner image
   - **About Text**: Biography/about section
   - **Email**: Contact email
   - **Location**: Your location
4. Click **Save Changes**

## Database Structure

### Projects Collection
```
{
  id: string,
  title: string,
  description: string,
  longDescription: string,
  image: string (base64 data URL),
  tech: string[],
  github: string,
  demo: string,
  category: string,
  featured: boolean,
  created_at: timestamp,
  updated_at: timestamp
}
```

### Skills Collection
```
{
  id: string,
  title: string,
  description: string,
  proficiency: number (0-100),
  icon: string,
  color: string (hex),
  bgColor: string (hex),
  created_at: timestamp,
  updated_at: timestamp
}
```

### Portfolio Content
```
{
  id: string,
  heroTitle: string,
  heroSubtitle: string,
  heroTagline: string,
  bannerImage: string (base64 data URL),
  aboutText: string,
  email: string,
  location: string,
  created_at: timestamp,
  updated_at: timestamp
}
```

## API Endpoints

### Projects
- `GET /api/admin/projects` - List all projects
- `POST /api/admin/projects` - Create new project
- `PUT /api/admin/projects/[id]` - Update project
- `DELETE /api/admin/projects/[id]` - Delete project

### Skills
- `GET /api/admin/skills` - List all skills
- `POST /api/admin/skills` - Create new skill
- `PUT /api/admin/skills/[id]` - Update skill
- `DELETE /api/admin/skills/[id]` - Delete skill

### Content
- `GET /api/admin/content` - Get portfolio content
- `PUT /api/admin/content` - Update portfolio content

### Image Upload
- `POST /api/admin/upload/image` - Upload image (multipart form-data)

### Seed
- `POST /api/admin/seed` - Seed initial data (requires Bearer token)

## Tips

1. **Image Format**: Use PNG or JPG for best results
2. **File Size**: Keep project images under 500KB for faster loading
3. **SEO**: Use descriptive titles and descriptions for projects
4. **Featured**: Mark 2-3 best projects as featured for homepage display
5. **Tech Stack**: Keep tech list relevant and updated

## Next Steps

1. Add more projects and skills from your portfolio
2. Upload custom project images
3. Customize hero banner
4. Implement authentication for admin dashboard (if not done)
5. Add more features like project URLs, tags, etc.

## Support

For issues or questions, refer to:
- Admin API: `/app/api/admin/`
- Admin Dashboard: `/app/admin/dashboard/page.tsx`
- Components: `/app/components/Projects.tsx`, `/app/components/Skills.tsx`
