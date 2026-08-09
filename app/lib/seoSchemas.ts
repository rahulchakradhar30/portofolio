import type { Project, Certification, PortfolioContent } from "@/app/lib/types";

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL && !process.env.NEXT_PUBLIC_SITE_URL.includes('portofolio-one-dun-27') && !process.env.NEXT_PUBLIC_SITE_URL.includes('rahulchakradhar.com')
  ? process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, '')
  : "https://rahulchakradhar.vercel.app";
export const SITE_NAME = "Rahul Chakradhar Portfolio";

export const NAME_VARIATIONS = [
  "Rahul Chakradhar Perepogu",
  "P Rahul Chakradhar",
  "Rahul Chakradhar",
  "Perepogu Rahul Chakradhar",
  "Rahul P Chakradhar",
];

export const PRIMARY_NAME = "Rahul Chakradhar";

export const JOB_TITLES = [
  "AI Engineer",
  "Full Stack Developer",
  "AI/ML Engineer",
  "Software Developer",
  "Student Researcher",
];

export function getPersonEntity(content?: PortfolioContent | null) {
  const profileImage = content?.profileImage || content?.seoOgImage || `${SITE_URL}/icon.svg`;
  const github = content?.github || "https://github.com/rahulchakradhar";
  const linkedin = content?.linkedin || "https://linkedin.com/in/rahulchakradhar";
  const instagram = content?.instagram || "https://instagram.com/rahulchakradhar";

  return {
    "@type": "Person",
    "@id": `${SITE_URL}/#person`,
    "name": PRIMARY_NAME,
    "legalName": "Rahul Chakradhar Perepogu",
    "givenName": "Rahul Chakradhar",
    "familyName": "Perepogu",
    "alternateName": NAME_VARIATIONS.filter((name) => name !== PRIMARY_NAME),
    "jobTitle": JOB_TITLES,
    "description":
      content?.seoDescription ||
      content?.aboutText ||
      "AI Engineer, Full-Stack Developer, and Student Researcher specializing in AI-powered systems, product engineering, scalable web architectures, and high-trust digital experiences.",
    "url": SITE_URL,
    "image": profileImage,
    "email": content?.email ? `mailto:${content.email}` : undefined,
    "sameAs": [github, linkedin, instagram].filter(Boolean),
    "knowsAbout": [
      "Artificial Intelligence",
      "Machine Learning",
      "Full-Stack Web Development",
      "Next.js",
      "React",
      "TypeScript",
      "Python",
      "Firebase",
      "Cloud Computing",
      "System Architecture",
      "Software Engineering",
    ],
    "hasOccupation": JOB_TITLES.map((title) => ({
      "@type": "Occupation",
      "name": title,
      "description": `Professional work as an ${title} developing intelligent software and digital systems.`,
    })),
    "knowsLanguage": ["English", "Telugu"],
  };
}

export function getWebSiteEntity() {
  return {
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    "url": SITE_URL,
    "name": SITE_NAME,
    "alternateName": NAME_VARIATIONS.map((name) => `${name} Portfolio`),
    "description":
      "Official personal portfolio, AI engineering projects, research, credentials, and interactive hub of Rahul Chakradhar.",
    "publisher": { "@id": `${SITE_URL}/#person` },
    "author": { "@id": `${SITE_URL}/#person` },
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": `${SITE_URL}/projects?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export function getProfilePageEntity() {
  return {
    "@type": "ProfilePage",
    "@id": `${SITE_URL}/#profilepage`,
    "name": `${PRIMARY_NAME} - ${SITE_NAME}`,
    "url": SITE_URL,
    "mainEntity": { "@id": `${SITE_URL}/#person` },
    "isPartOf": { "@id": `${SITE_URL}/#website` },
  };
}

export function getOrganizationEntity() {
  return {
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
    "name": SITE_NAME,
    "alternateName": `${PRIMARY_NAME} Personal Brand`,
    "url": SITE_URL,
    "logo": `${SITE_URL}/icon.svg`,
    "founder": { "@id": `${SITE_URL}/#person` },
    "sameAs": [
      "https://github.com/rahulchakradhar",
      "https://linkedin.com/in/rahulchakradhar",
    ],
  };
}

export function getBreadcrumbListEntity(
  items: Array<{ name: string; item: string }>
) {
  return {
    "@type": "BreadcrumbList",
    "@id": `${SITE_URL}/#breadcrumb`,
    "itemListElement": items.map((crumb, idx) => ({
      "@type": "ListItem",
      "position": idx + 1,
      "name": crumb.name,
      "item": crumb.item.startsWith("http") ? crumb.item : `${SITE_URL}${crumb.item}`,
    })),
  };
}

export function getProjectJsonLd(project: Project) {
  const projectUrl = `${SITE_URL}/projects/${project.id}`;
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": project.codeUrl ? ["CreativeWork", "SoftwareSourceCode"] : "CreativeWork",
        "@id": `${projectUrl}/#creativework`,
        "name": project.title,
        "headline": project.title,
        "description": project.description || project.longDescription,
        "image": project.image,
        "url": projectUrl,
        "codeRepository": project.github || project.codeUrl || undefined,
        "programmingLanguage": project.tech || [],
        "author": { "@id": `${SITE_URL}/#person` },
        "creator": { "@id": `${SITE_URL}/#person` },
        "publisher": { "@id": `${SITE_URL}/#organization` },
        "dateCreated": project.created_at || undefined,
        "dateModified": project.updated_at || project.created_at || undefined,
      },
      getPersonEntity(),
      getBreadcrumbListEntity([
        { name: "Home", item: "/" },
        { name: "Projects", item: "/projects" },
        { name: project.title, item: `/projects/${project.id}` },
      ]),
    ],
  };
}

export function getCertificationJsonLd(cert: Certification) {
  const certUrl = `${SITE_URL}/certifications/${cert.id}`;
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "EducationalOccupationalCredential",
        "@id": `${certUrl}/#credential`,
        "name": cert.title,
        "description": cert.description,
        "image": cert.image,
        "credentialCategory": "Certification",
        "url": certUrl,
        "validIn": cert.issuedDate ? { "@type": "AdministrativeArea", "name": "Global" } : undefined,
        "recognizedBy": {
          "@type": "Organization",
          "name": cert.issuer,
        },
        "author": { "@id": `${SITE_URL}/#person` },
        "credentialSubject": { "@id": `${SITE_URL}/#person` },
      },
      getPersonEntity(),
      getBreadcrumbListEntity([
        { name: "Home", item: "/" },
        { name: "Certifications", item: "/certifications" },
        { name: cert.title, item: `/certifications/${cert.id}` },
      ]),
    ],
  };
}

export function getGlobalJsonLdGraph(content?: PortfolioContent | null) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      getPersonEntity(content),
      getWebSiteEntity(),
      getProfilePageEntity(),
      getOrganizationEntity(),
    ],
  };
}
