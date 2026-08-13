// Data types and interfaces for the portfolio

// Firestore Timestamp type
export interface FirestoreTimestamp {
  toDate(): Date;
  toMillis(): number;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  longDescription?: string;
  image: string;
  galleryImages?: string[];
  youtubeLinks?: string[];
  tech: string[];
  github: string;
  demo: string;
  featured: boolean;
  order?: number;
  category: string;
  youtubeUrl?: string;
  youtubeTitle?: string;
  codeUrl?: string;
  codeName?: string;
  showCode?: boolean;
  showDetails?: boolean;
  details?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Skill {
  id: string;
  title: string;
  description: string;
  color: string;
  bgColor: string;
  icon: string; // icon name from lucide-react
  proficiency: number; // 0-100
  featured?: boolean;
  order?: number;
  created_at?: string;
  updated_at?: string;
}

export interface AdminUser {
  id: string;
  email: string;
  name?: string;
  password_hash: string;
  otp_enabled?: boolean;
  otp_secret?: string;
  role?: 'admin' | 'editor' | 'viewer';
  status?: 'active' | 'inactive' | 'suspended';
  created_at?: Date;
  last_login?: Date;
}

export interface OTPSchema {
  id: string;
  email: string;
  otp: string;
  type: string;
  expires_at: Date | FirestoreTimestamp;
}

export interface EmailReplyItem {
  id: string;
  emailId: string;
  content: string;
  repliedBy: string;
  repliedAt: string;
  emailStatus: 'success' | 'failed';
  attachments?: { name: string; url: string }[];
}

export interface ContactMessage {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  subject: string;
  message: string;
  createdAt: string;
  read: boolean;
  replied?: boolean;
  messageStatus?: string;
  replies?: EmailReplyItem[];
}

export interface HireRequest {
  id: string;
  fullName: string;
  companyName?: string;
  email: string;
  phone?: string;
  website?: string;
  projectType: string;
  role?: string;
  budget?: string;
  timeline?: string;
  description: string;
  preferredContact?: string;
  createdAt: string;
  read: boolean;
  status?: 'new' | 'contacted' | 'quoted' | 'won' | 'archived';
  replied?: boolean;
  messageStatus?: string;
  replies?: EmailReplyItem[];
}

export interface PortfolioContent {
  id: string;
  heroTitle: string;
  heroSubtitle: string;
  heroTagline: string;
  bannerImage?: string;
  profileImage?: string;
  resumeUrl?: string;
  aboutText: string;
  aboutStats?: {
    label: string;
    value: string;
  }[];
  email: string;
  phone?: string;
  location: string;
  instagram?: string;
  linkedin?: string;
  github?: string;
  studyRoadmapEnabled?: boolean;
  allowRoadmapExtension?: boolean;
  studyRoadmap?: StudyRoadmapItem[];
  studyRoadmapMetrics?: StudyRoadmapStageMetric[];
  sectionVisibility?: SectionVisibility;
  siteCopy?: SiteCopy;
  radarConfig?: RadarConfig;
  // Advanced CMS Extensions
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
  seoCanonicalUrl?: string;
  seoOgImage?: string;
  seoTwitterCard?: string;
  seoFavicon?: string;
  seoThemeColor?: string;
  seoRobots?: string;
  animationsEnabled?: boolean;
  animationSpeed?: 'slow' | 'normal' | 'fast';
  animationType?: 'fade' | 'slide' | 'zoom';
  animationDelay?: number;
  scrollEffects?: boolean;
  
  // Dynamic Configuration Extensions
  animationConfig?: UnifiedAnimationConfig;
  themeConfig?: UnifiedThemeConfig;
  glassConfig?: UnifiedGlassConfig;
  
  // Cinematic Intro Experience
  introEnabled?: boolean;
  introBrandText?: string;
  introSubtitle?: string;
  introLogoUrl?: string;
  introDuration?: number;
  introFirstLoadOnly?: boolean;
  introAccentColor?: string;
  introEnableLogoAnimation?: boolean;
  // Branding & Favicon Configuration
  faviconConfig?: FaviconConfig;
  // Scroll & Component Layout Configurations
  scrollConfigs?: ScrollConfigRegistry;
}

export type GlassPreset = "subtle" | "balanced" | "strong" | "custom";

export interface GlassParams {
  intensity: number;      // 0.1 to 1.0
  blur: number;           // 4 to 24 (in px)
  transparency: number;   // 0.1 to 0.9 (surface alpha)
  borderStrength: number; // 0.1 to 0.8
  surfaceContrast: number;// 0.1 to 1.0
  shadowDepth: number;    // 0.1 to 1.0
}

export interface GlassComponentOverride {
  enabled?: boolean;
  preset?: GlassPreset;
  intensity?: number;
}

export interface UnifiedGlassConfig {
  enabled: boolean;
  preset: GlassPreset;
  global: GlassParams;
  sections?: Record<string, GlassComponentOverride>;
  components?: Record<string, GlassComponentOverride>;
}

export interface GlassTokens {
  glassEnabled: string;
  glassBg: string;
  glassBorder: string;
  glassBlur: string;
  glassSaturation: string;
  glassShadow: string;
  glassHighlight: string;
  glassPreset: string;
}

export interface FaviconConfig {
  enabled: boolean;
  url: string;
  publicId?: string;
  originalName?: string;
  mimeType?: string;
  size?: number;
  updatedAt?: string;
  version?: number;
}

export type ScrollDirection = 'vertical' | 'horizontal';

export interface ComponentScrollConfig {
  desktop: ScrollDirection;
  tablet: ScrollDirection;
  mobile: ScrollDirection;
}

export interface ScrollConfigRegistry {
  proofModeCards?: ComponentScrollConfig;
  skills?: ComponentScrollConfig;
  certifications?: ComponentScrollConfig;
  [key: string]: ComponentScrollConfig | undefined;
}

export type SupportedAnimationType = 'fade' | 'slide' | 'scale' | 'reveal' | 'stagger' | 'float' | 'rotate';
export type SupportedEasing = 'easeOut' | 'easeInOut' | 'linear' | 'anticipate';

export interface BaseAnimationParams {
  type: SupportedAnimationType;
  duration: number;
  delay: number;
  staggerStep?: number;
  easing?: SupportedEasing;
  scrollEffect?: boolean;
}

export interface SectionAnimationOverride extends Partial<BaseAnimationParams> {
  enabled?: boolean;
}

export interface ComponentAnimationOverride extends Partial<BaseAnimationParams> {
  enabled?: boolean;
}

export interface UnifiedAnimationConfig {
  enabled: boolean;
  global: BaseAnimationParams;
  sections?: Record<string, SectionAnimationOverride>;
  components?: Record<string, ComponentAnimationOverride>;
}

export interface ThemeTokens {
  background: string;
  foreground: string;
  surface: string;
  surfaceStrong: string;
  surfaceSoft: string;
  accent: string;
  accentStrong: string;
  dotPattern: string;
}

export interface ThemeConfigItem {
  id: string;
  name: string;
  isPermanent?: boolean;
  tokens: ThemeTokens;
  createdAt?: string;
  updatedAt?: string;
}

export interface UnifiedThemeConfig {
  activeThemeId: string;
  customThemes: ThemeConfigItem[];
}

export interface SectionVisibility {
  hero: boolean;
  about: boolean;
  roadmap: boolean;
  radar: boolean;
  skills: boolean;
  projects: boolean;
  certifications: boolean;
  contact: boolean;
}

export type StudyRoadmapMetricType = 'cgpa' | 'ccpa' | 'percentage' | 'marks' | 'custom';

export interface StudyRoadmapStageMetric {
  roadmapItemId: string;
  enabled: boolean;
  metricType: StudyRoadmapMetricType;
  label: string;
  value: string;
}

export interface StudyRoadmapItem {
  id: string;
  stage: string;
  institution: string;
  period: string;
  description: string;
  tags: string[];
  isHigherStudy: boolean;
}

export type RadarKind = 'skill' | 'project' | 'certification';

export interface RadarConfig {
  enabledKinds: RadarKind[];
  skillIds: string[];
  projectIds: string[];
  certificationIds: string[];
  maxSkills: number;
  maxProjects: number;
  maxCertifications: number;
}

export interface SiteCopy {
  headerBrand: string;
  navHome: string;
  navAbout: string;
  navAcademic: string;
  navRadar: string;
  navSkills: string;
  navProjects: string;
  navHire: string;
  navContact: string;
  headerHireCta: string;
  footerBrand: string;
  footerLead: string;
  footerQuickLinksTitle: string;
  footerServicesTitle: string;
  footerServices: string[];
  footerCopyright: string;
  footerMadeWith: string;
  heroBadge: string;
  heroEditorialBadge: string;
  heroCTA1: string;
  heroCTA2: string;
  heroCurrentFocusLabel: string;
  heroCurrentFocusText: string;
  heroSpotlights: { title: string; copy: string }[];
  aboutBadge: string;
  aboutHeading: string;
  aboutShortTitle: string;
  aboutShortCopy: string;
  aboutBody1: string;
  aboutBody2: string;
  aboutTags: string[];
  aboutFooter: string;
  skillsHeading: string;
  skillsSubtitle: string;
  skillsViewMore: string;
  skillsEmpty: string;
  projectsHeading: string;
  projectsSubtitle: string;
  projectsViewMore: string;
  projectsEmpty: string;
  certificationsHeading: string;
  certificationsSubtitle: string;
  certificationsViewMore: string;
  certificationsEmpty: string;
  contactHeading: string;
  contactSubtitle: string;
  contactIntroTitle: string;
  contactIntroBody: string;
  contactSocialPrompt: string;
  contactFormTitle: string;
  contactSuccess: string;
  contactError: string;
  radarBadge: string;
  radarHeading: string;
  radarSubtitle: string;
  radarFeatureTitle: string;
  radarFeatureCopy: string;
  radarCommandCopy: string;
  radarExploreSkills: string;
  radarSeeProjects: string;
  radarViewCredentials: string;
}

export interface Certification {
  id: string;
  title: string;
  issuer: string;
  issuedDate: string;
  expiryDate?: string;
  credentialId?: string;
  credentialUrl?: string;
  image: string;
  galleryImages?: string[];
  youtubeLinks?: string[];
  description: string;
  linkedinUrl?: string;
  featured: boolean;
  order?: number;
  created_at?: string;
  updated_at?: string;
}

export type DemonstrationType =
  | 'architecture_visualizer'
  | 'before_after'
  | 'decision_simulation'
  | 'system_flow'
  | 'interactive_demo';

export interface EvidenceLink {
  label: string;
  url: string;
  type?: 'github' | 'demo' | 'paper' | 'metrics';
}

export interface DemonstrationConfig {
  nodes?: { id: string; label: string; description?: string; status?: string }[];
  connections?: { from: string; to: string; label?: string }[];
  beforeLabel?: string;
  beforeMetrics?: { label: string; value: string }[];
  afterLabel?: string;
  afterMetrics?: { label: string; value: string }[];
  decisionSteps?: { question: string; options: { label: string; outcome: string; recommended?: boolean }[] }[];
  flowSteps?: { step: number; title: string; detail: string }[];
}

export interface ProofExperience {
  id: string;
  title: string;
  category: string;
  shortDescription: string;
  projectId?: string;
  problem: string;
  approach: string;
  technicalDetails: string;
  demonstrationType: DemonstrationType;
  demonstrationConfig?: DemonstrationConfig;
  result: string;
  evidenceLinks?: EvidenceLink[];
  images?: string[];
  published: boolean;
  order?: number;
  defaultSectionState?: 'expanded' | 'collapsed';
  mlMetadata?: {
    tags?: string[];
    similarityVector?: number[];
    capabilityMapping?: string[];
    targetAudience?: string;
  };
  created_at?: string;
  updated_at?: string;
}


