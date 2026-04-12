// Data types and interfaces for the portfolio

export interface Project {
  id: string;
  title: string;
  description: string;
  image: string;
  tech: string[];
  github: string;
  demo: string;
  featured: boolean;
  category: string;
  details?: string;
  longDescription?: string;
}

export interface Skill {
  id: string;
  title: string;
  description: string;
  color: string;
  bgColor: string;
  icon: string; // icon name from lucide-react
  proficiency: number; // 0-100
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

export interface PortfolioContent {
  id: string;
  heroTitle: string;
  heroSubtitle: string;
  heroTagline: string;
  aboutText: string;
  aboutStats: {
    label: string;
    value: string;
  }[];
  email: string;
  phone?: string;
  location: string;
  instagram: string;
  linkedin: string;
  github: string;
}
