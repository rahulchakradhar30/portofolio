import { NextRequest, NextResponse } from 'next/server';
import serverFirebaseHelpers from '@/app/lib/firebaseServer';
import { getAdminDb } from '@/app/lib/firebaseAdmin';

// Seed database with initial projects and skills
export async function POST(request: NextRequest) {
  try {
    // Get a token to verify this is an admin operation (basic check)
    const authHeader = request.headers.get('authorization');
    if (authHeader !== 'Bearer seed-admin-key') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { action } = await request.json();

    if (action === 'clear') {
      // Clear existing data
      const db = getAdminDb();
      const projectsSnap = await db.collection('projects').get();
      projectsSnap.forEach(doc => doc.ref.delete());

      const skillsSnap = await db.collection('skills').get();
      skillsSnap.forEach(doc => doc.ref.delete());

      return NextResponse.json(
        { success: true, message: 'Database cleared' },
        { status: 200 }
      );
    }

    // Seed projects
    const projects = [
      {
        title: "AI Content Generator",
        description: "Intelligent tool for generating creative content using advanced AI",
        longDescription: "A full-stack AI-powered platform that generates unique content using advanced language models",
        image: "https://via.placeholder.com/400x300?text=AI+Content+Generator",
        tech: ["Next.js", "TypeScript", "OpenAI", "TailwindCSS"],
        github: "https://github.com",
        demo: "https://demo.example.com",
        category: "AI",
        featured: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        title: "Portfolio Website",
        description: "Modern responsive portfolio with admin dashboard",
        longDescription: "Full-featured portfolio platform with real-time updates and admin controls",
        image: "https://via.placeholder.com/400x300?text=Portfolio+Website",
        tech: ["Next.js", "React", "Firebase", "Tailwind"],
        github: "https://github.com",
        demo: "https://portfolio.example.com",
        category: "Web",
        featured: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        title: "Video Editor App",
        description: "Professional video editing tool with real-time preview",
        longDescription: "Browser-based video editor with multiple tracks and effects",
        image: "https://via.placeholder.com/400x300?text=Video+Editor",
        tech: ["React", "FFmpeg", "Canvas API", "Electron"],
        github: "https://github.com",
        demo: "https://editor.example.com",
        category: "Tools",
        featured: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        title: "Mobile App Analytics",
        description: "Real-time analytics dashboard for mobile apps",
        longDescription: "Comprehensive analytics platform with custom dashboards and reports",
        image: "https://via.placeholder.com/400x300?text=Analytics+Dashboard",
        tech: ["React", "Node.js", "MongoDB", "D3.js"],
        github: "https://github.com",
        demo: "https://analytics.example.com",
        category: "Analytics",
        featured: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ];

    // Seed skills
    const skills = [
      {
        title: "Frontend Development",
        description: "Expert in React, Next.js, and modern web technologies",
        proficiency: 95,
        icon: "Code",
        color: "#7c3aed",
        bgColor: "#ede9fe",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        title: "Full Stack Development",
        description: "Building complete applications from frontend to backend",
        proficiency: 90,
        icon: "Layers",
        color: "#ec4899",
        bgColor: "#fce7f3",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        title: "AI & Machine Learning",
        description: "Experience with ML models and AI integration",
        proficiency: 75,
        icon: "Zap",
        color: "#f59e0b",
        bgColor: "#fef3c7",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        title: "Video Production",
        description: "Professional video editing and content creation",
        proficiency: 85,
        icon: "Film",
        color: "#06b6d4",
        bgColor: "#cffafe",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        title: "UI/UX Design",
        description: "Creating beautiful and intuitive user interfaces",
        proficiency: 80,
        icon: "Palette",
        color: "#14b8a6",
        bgColor: "#ccfbf1",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        title: "Cloud & DevOps",
        description: "Deployment and scaling applications on cloud platforms",
        proficiency: 75,
        icon: "Cloud",
        color: "#3b82f6",
        bgColor: "#dbeafe",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ];

    // Add projects
    for (const project of projects) {
      await serverFirebaseHelpers.createProject(project);
    }

    // Add skills
    for (const skill of skills) {
      await serverFirebaseHelpers.createSkill(skill);
    }

    return NextResponse.json(
      {
        success: true,
        message: `Seeded ${projects.length} projects and ${skills.length} skills`,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Seed error:', error);
    return NextResponse.json(
      { error: 'Failed to seed database', details: String(error) },
      { status: 500 }
    );
  }
}
