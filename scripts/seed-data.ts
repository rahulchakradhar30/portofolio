// Seed data for projects and skills
import { getAdminDb } from '../app/lib/firebaseAdmin';

const seedData = async () => {
  const db = getAdminDb();

  // Sample projects
  const projects = [
    {
      title: "AI Content Generator",
      description: "Intelligent tool for generating creative content",
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

  // Sample skills
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

  try {
    // Seed projects
    console.log('Seeding projects...');
    for (const project of projects) {
      await db.collection('projects').add(project);
    }
    console.log(`✓ Added ${projects.length} projects`);

    // Seed skills
    console.log('Seeding skills...');
    for (const skill of skills) {
      await db.collection('skills').add(skill);
    }
    console.log(`✓ Added ${skills.length} skills`);

    // Seed portfolio content
    console.log('Seeding portfolio content...');
    const contentRef = db.collection('portfolio_content').doc('main');
    await contentRef.set({
      heroTitle: "PEREPOGU RAHUL CHAKRADHAR",
      heroSubtitle: "AI ENTHUSIAST | TECH LEARNER | CONTENT CREATOR | DIRECTOR",
      heroTagline: "CREATE YOUR OWN",
      bannerImage: "https://via.placeholder.com/1920x1080?text=Banner",
      aboutText: "I'm a passionate developer and content creator focused on building amazing digital experiences.",
      email: "rahul@example.com",
      location: "India",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
    console.log('✓ Added portfolio content');

    console.log('\n✨ Database seeding complete!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

// Run the seeding
seedData();
