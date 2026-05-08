import { NextRequest, NextResponse } from 'next/server';
import serverFirebaseHelpers from '@/app/lib/firebaseServer';
import { assertAdminSession } from '@/app/lib/adminAuth';
import { logAdminAudit } from '@/app/lib/adminAudit';
import { enforceRateLimit } from '@/app/lib/rateLimit';
import { DEFAULT_SITE_COPY } from '@/app/lib/siteCopy';

const DEFAULT_RADAR_CONFIG = {
  enabledKinds: ['skill', 'project', 'certification'],
  skillIds: [],
  projectIds: [],
  certificationIds: [],
  maxSkills: 5,
  maxProjects: 3,
  maxCertifications: 3,
};

const DEFAULT_STUDY_ROADMAP = [
  {
    id: 'school',
    stage: 'School',
    institution: 'School Education',
    period: 'Foundation Years',
    description: 'Built academic fundamentals and consistent learning discipline.',
    tags: ['Basics', 'Discipline', 'Curiosity'],
    isHigherStudy: false,
  },
  {
    id: 'high-school',
    stage: 'High School',
    institution: 'Secondary Education',
    period: 'Higher Secondary',
    description: 'Strengthened core subjects and developed problem-solving ability.',
    tags: ['Science', 'Math', 'Problem Solving'],
    isHigherStudy: false,
  },
  {
    id: 'intermediate',
    stage: 'Intermediate',
    institution: 'Intermediate College',
    period: 'Pre-University',
    description: 'Prepared for advanced studies with structured technical focus.',
    tags: ['Pre-University', 'Focus', 'Preparation'],
    isHigherStudy: false,
  },
  {
    id: 'university',
    stage: 'Graduate / University',
    institution: 'GITAM University, Bengaluru',
    period: 'Current',
    description: 'Building practical AI and software systems through applied projects.',
    tags: ['AI', 'Engineering', 'Projects'],
    isHigherStudy: false,
  },
];

const DEFAULT_STUDY_ROADMAP_METRICS = () => {
  return [
    {
      roadmapItemId: 'school',
      enabled: false,
      metricType: 'percentage',
      label: 'Percentage',
      value: '',
    },
    {
      roadmapItemId: 'high-school',
      enabled: false,
      metricType: 'percentage',
      label: 'Percentage',
      value: '',
    },
    {
      roadmapItemId: 'intermediate',
      enabled: false,
      metricType: 'percentage',
      label: 'Percentage',
      value: '',
    },
    {
      roadmapItemId: 'university',
      enabled: false,
      metricType: 'cgpa',
      label: 'CGPA',
      value: '',
    },
  ];
};

const DEFAULT_SECTION_VISIBILITY = {
  hero: true,
  about: true,
  roadmap: true,
  radar: true,
  skills: true,
  projects: true,
  certifications: true,
  contact: true,
};

// GET - Get portfolio content
export async function GET() {
  try {
    const content = await serverFirebaseHelpers.getPortfolioContent();

    // Return default if not found
    if (!content) {
      return NextResponse.json(
        {
          content: {
            heroTitle: 'PEREPOGU RAHUL CHAKRADHAR',
            heroSubtitle: 'AI ENTHUSIAST | TECH LEARNER | CONTENT CREATOR | DIRECTOR',
            heroTagline: 'CREATE YOUR OWN',
            aboutText: 'Passionate about AI, technology, and content creation.',
            profileImage: '',
            resumeUrl: '',
            email: 'rahulchakradharperepogu@gmail.com',
            location: 'Bengaluru, Karnataka',
            instagram: 'https://www.instagram.com/rahul_chakradhar_30/?hl=en',
            linkedin: 'https://www.linkedin.com/in/perepogu-rahul-chakradhar-721017379/',
            github: 'https://github.com/rahulchakradhar30',
            studyRoadmapEnabled: true,
            allowRoadmapExtension: false,
            studyRoadmap: DEFAULT_STUDY_ROADMAP,
            studyRoadmapMetrics: DEFAULT_STUDY_ROADMAP_METRICS(),
            sectionVisibility: DEFAULT_SECTION_VISIBILITY,
            siteCopy: DEFAULT_SITE_COPY,
            radarConfig: DEFAULT_RADAR_CONFIG,
            aboutStats: [
              { label: 'Major Projects', value: '3+' },
              { label: 'Certifications', value: '5+' },
              { label: 'Websites Published', value: '2+' },
              { label: 'Success Rate', value: '90%' },
            ],
          },
        },
        { status: 200 }
      );
    }

    return NextResponse.json({ content }, { status: 200 });
  } catch (error) {
    console.error('Fetch content error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch portfolio content' },
      { status: 500 }
    );
  }
}

// PUT - Update portfolio content
export async function PUT(request: NextRequest) {
  try {
    const limit = enforceRateLimit({ request, scope: 'admin-content-update', max: 30, windowMs: 60_000 });
    if (!limit.ok) return limit.response;

    const auth = await assertAdminSession(request);
    if (!auth.ok) return auth.response;

    const {
      heroTitle,
      heroSubtitle,
      heroTagline,
      bannerImage,
      profileImage,
      resumeUrl,
      aboutText,
      email,
      location,
      instagram,
      linkedin,
      github,
      studyRoadmapEnabled,
      allowRoadmapExtension,
      studyRoadmap,
      studyRoadmapMetrics,
      sectionVisibility,
      aboutStats,
      siteCopy,
      radarConfig,
    } = await request.json();

    const updatedContent = await serverFirebaseHelpers.updatePortfolioContent({
      heroTitle,
      heroSubtitle,
      heroTagline,
      bannerImage,
      profileImage,
      resumeUrl,
      aboutText,
      email,
      location,
      instagram,
      linkedin,
      github,
      studyRoadmapEnabled,
      allowRoadmapExtension,
      studyRoadmap,
      studyRoadmapMetrics,
      sectionVisibility,
      aboutStats,
      siteCopy,
      radarConfig,
    });

    await logAdminAudit({
      request,
      email: auth.decoded.email || 'admin',
      action: 'content.update',
      details: { heroTitle, email, location },
    });

    return NextResponse.json(
      { success: true, content: updatedContent },
      { status: 200 }
    );
  } catch (error) {
    console.error('Update content error:', error);
    return NextResponse.json(
      { error: 'Failed to update portfolio content' },
      { status: 500 }
    );
  }
}
