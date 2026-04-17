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
  category: string;
  youtubeUrl?: string;
  youtubeTitle?: string;
  codeUrl?: string;
  codeName?: string;
  showCode?: boolean;
  showDetails?: boolean;
  details?: string;
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

export interface ContactMessage {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  subject: string;
  message: string;
  createdAt: string;
  read: boolean;
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
  siteCopy?: SiteCopy;
  radarConfig?: RadarConfig;
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
  created_at?: Date;
  updated_at?: Date;
}

