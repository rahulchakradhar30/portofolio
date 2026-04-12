"use client";

import { motion } from "framer-motion";
import { ArrowLeft, ExternalLink, Code, GitBranch } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

// Sample project details data
const projectsData: Record<string, any> = {
  "weather-x-gitam": {
    title: "WEATHER_X_GITAM",
    description: "A low-cost weather monitoring station built for just ₹4,000 (vs ₹40,000 market cost). Designed for rural areas and farmers, providing pinpoint location weather data for agricultural decision-making.",
    image: "/projects/weather-station.jpg",
    category: "IoT/Hardware",
    featured: true,
    tech: ["IoT", "Hardware", "Sensors", "Embedded Systems"],
    longDescription: "WEATHER_X_GITAM is a revolutionary weather monitoring solution designed specifically for rural communities and farmers. Built with a focus on affordability and accuracy, this project demonstrates how technology can be made accessible to those who need it most.\n\nKey Features:\n• Cost significantly reduced from ₹40,000 to ₹4,000\n• Real-time pinpoint location weather data\n• Easy-to-use interface for farmers\n• Durable hardware built for harsh conditions\n• Integration with mobile apps for remote monitoring\n\nImpact:\nThis project has helped farmers make better agricultural decisions based on accurate local weather data, improving crop yields and reducing losses.",
    github: "#",
    demo: "#",
    images: ["/projects/weather-1.jpg", "/projects/weather-2.jpg", "/projects/weather-3.jpg"],
    timeline: "2023 - 2024",
    team: "Solo Project",
    status: "Active"
  },
  "eeshan-protector": {
    title: "EESHAN - THE PROTECTOR",
    description: "A zero-budget mythological sci-fi cinematic experiment. An AI-assisted film blending ancient mythology with futuristic science fiction, exploring themes of Dharma, Order, and cosmic balance.",
    image: "/projects/eeshan.jpg",
    category: "Film/AI",
    featured: true,
    tech: ["AI Tools", "Filmmaking", "Visual Effects", "Sound Design"],
    longDescription: "EESHAN - THE PROTECTOR is an ambitious cinematic project that explores the intersection of ancient mythology and futuristic technology. Created with zero budget, it showcases how modern AI tools can democratize filmmaking.\n\nProject Highlights:\n• AI-generated visuals and effects\n• Zero-budget production model\n• 100K+ organic views\n• Mythological storytelling meets sci-fi\n• Professional sound design and composition\n\nThis project received strong audience engagement and demonstrated the potential of AI-assisted filmmaking while maintaining artistic integrity.",
    github: "#",
    demo: "#",
    images: ["/projects/eeshan-1.jpg", "/projects/eeshan-2.jpg"],
    timeline: "2024",
    team: "Solo Project + Collaborators",
    status: "Active"
  },
  "chakradhar-ott": {
    title: "Chakradhar OTT Platform",
    description: "Full-stack OTT platform with live premiere events. Features movie streaming, ticket-based live events, admin-controlled ecosystem, and integrated payment system.",
    image: "/projects/ott-platform.jpg",
    category: "Web Development",
    featured: true,
    tech: ["Next.js", "Firebase", "Razorpay", "Real-time Chat"],
    longDescription: "Chakradhar OTT Platform is a comprehensive streaming solution that combines traditional movie streaming with live premiere events. Built with modern web technologies, it provides a complete digital cinema experience.\n\nKey Features:\n• Movie streaming catalog\n• Live premiere event system\n• Ticket-based payment integration\n• Real-time chat during premieres\n• Admin control panel\n• User authentication and profiles\n• Wishlist functionality\n\nTechnical Stack:\n• Frontend: Next.js + React\n• Backend: Firebase Firestore & Authentication\n• Payments: Razorpay integration\n• Hosting: Vercel\n\nThis platform demonstrates full-stack development expertise and product-level thinking.",
    github: "#",
    demo: "#",
    images: ["/projects/ott-1.jpg", "/projects/ott-2.jpg", "/projects/ott-3.jpg"],
    timeline: "2024 - Present",
    team: "Solo Developer",
    status: "Active"
  },
};

export default function ProjectDetail() {
  const params = useParams();
  const projectId = params.id as string;
  const project = projectsData[projectId];

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Project Not Found</h1>
          <Link
            href="/projects"
            className="text-violet-600 hover:text-violet-700 font-semibold"
          >
            ← Back to Projects
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16">
      {/* Header */}
      <div className="max-w-6xl mx-auto px-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-violet-600 hover:text-violet-700 mb-8 font-semibold"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Home
        </Link>
      </div>

      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="max-w-6xl mx-auto px-8 mb-20"
      >
        <div className="grid md:grid-cols-2 gap-12 items-start">
          {/* Image */}
          <div className="relative">
            <div className="bg-gradient-to-br from-violet-200 to-pink-200 rounded-3xl overflow-hidden aspect-video flex items-center justify-center">
              <div className="text-6xl font-bold text-white opacity-20">
                {project.category}
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="space-y-6">
            <div>
              <span className="px-4 py-2 bg-violet-100 text-violet-700 rounded-full text-sm font-semibold inline-block mb-4">
                {project.category}
              </span>
              <h1 className="text-5xl font-bold text-gray-900 mb-4">
                {project.title}
              </h1>
            </div>

            <p className="text-xl text-gray-600 leading-relaxed">
              {project.description}
            </p>

            <div className="grid grid-cols-2 gap-6 py-6">
              <div>
                <div className="text-sm text-gray-600 mb-1">Timeline</div>
                <div className="font-semibold text-gray-900">{project.timeline}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600 mb-1">Status</div>
                <div className="font-semibold text-green-600">{project.status}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600 mb-1">Team</div>
                <div className="font-semibold text-gray-900">{project.team}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600 mb-1">Category</div>
                <div className="font-semibold text-gray-900">{project.category}</div>
              </div>
            </div>

            {/* Tech Stack */}
            <div>
              <div className="text-sm text-gray-600 mb-3 font-semibold">Technologies</div>
              <div className="flex flex-wrap gap-2">
                {project.tech.map((tech: string) => (
                  <span
                    key={tech}
                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-6">
              <motion.a
                href={project.github}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-lg font-semibold hover:bg-gray-800 transition-colors"
              >
                <Code className="w-5 h-5" />
                View Code
              </motion.a>
              <motion.a
                href={project.demo}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 px-6 py-3 bg-violet-600 text-white rounded-lg font-semibold hover:bg-violet-700 transition-colors"
              >
                <ExternalLink className="w-5 h-5" />
                Live Demo
              </motion.a>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Detailed Description */}
      <motion.section
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="max-w-6xl mx-auto px-8 mb-20"
      >
        <div className="bg-white p-12 rounded-3xl shadow-lg border border-gray-100">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Project Overview</h2>
          <div className="prose prose-lg max-w-none text-gray-700 space-y-4">
            {project.longDescription.split("\n").map((paragraph: string, i: number) => (
              <p key={i} className="text-gray-600 leading-relaxed">
                {paragraph}
              </p>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Gallery */}
      <motion.section
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="max-w-6xl mx-auto px-8"
      >
        <h2 className="text-3xl font-bold text-gray-900 mb-8">Project Gallery</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {project.images?.map((image: string, i: number) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
              className="bg-gradient-to-br from-violet-100 to-pink-100 rounded-2xl aspect-video flex items-center justify-center overflow-hidden"
            >
              <div className="text-4xl font-bold text-white opacity-20">
                Image {i + 1}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.section>
    </div>
  );
}
