"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ExternalLink, Code, Eye, Star, ArrowLeft } from "lucide-react";

const allProjects = [
  {
    id: "weather-x-gitam",
    title: "WEATHER_X_GITAM",
    description: "A low-cost weather monitoring station built for just ₹4,000 (vs ₹40,000 market cost). Designed for rural areas and farmers, providing pinpoint location weather data.",
    tech: ["IoT", "Hardware", "Sensors", "Embedded Systems"],
    github: "#",
    demo: "#",
    featured: true,
    category: "IoT/Hardware"
  },
  {
    id: "eeshan-protector",
    title: "EESHAN - THE PROTECTOR",
    description: "A zero-budget mythological sci-fi cinematic experiment. An AI-assisted film blending ancient mythology with futuristic science fiction.",
    tech: ["AI Tools", "Filmmaking", "Visual Effects", "Sound Design"],
    github: "#",
    demo: "#",
    featured: true,
    category: "Film/AI"
  },
  {
    id: "chakradhar-ott",
    title: "Chakradhar OTT Platform",
    description: "Full-stack OTT platform with live premiere events. Features movie streaming, ticket-based live events, admin-controlled ecosystem.",
    tech: ["Next.js", "Firebase", "Razorpay", "Real-time Chat"],
    github: "#",
    demo: "#",
    featured: true,
    category: "Web Development"
  },
  {
    id: "tepe-expo",
    title: "TEPE EXPO'25",
    description: "Led organization of Technology Exploration and Product Engineering Expo. Managed 600+ students, 100+ projects, and 20+ volunteers.",
    tech: ["Event Management", "Leadership", "Project Coordination"],
    github: "#",
    demo: "#",
    featured: false,
    category: "Leadership"
  },
  {
    id: "ai-content",
    title: "AI Content Creation",
    description: "Published article 'AI is the Future - But Humans are the core..' exploring the balance between AI advancement and human creativity.",
    tech: ["Content Writing", "AI Research", "Digital Marketing"],
    github: "#",
    demo: "https://www.linkedin.com/posts/perepogu-rahul-chakradhar-721017379_ai-is-the-future-but-humans-are-the-core-activity-7429930565904064512-F1Lo",
    featured: false,
    category: "Content"
  },
  {
    id: "tech-hub",
    title: "Tech Innovation Hub",
    description: "Building partnerships and entrepreneurial ventures focused on AI, IoT, and content creation. Creating revenue-generating solutions.",
    tech: ["Entrepreneurship", "Partnerships", "Innovation"],
    github: "#",
    demo: "#",
    featured: false,
    category: "Business"
  },
];

export default function AllProjects() {
  return (
    <div className="min-h-screen pt-32 pb-20 bg-gradient-to-br from-white via-green-50 to-violet-50">
      <div className="max-w-7xl mx-auto px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-16"
        >
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-violet-600 hover:text-violet-700 mb-8 font-semibold"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Home
          </Link>

          <div className="text-center mb-12">
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-gray-800 to-violet-700 bg-clip-text text-transparent mb-6">
              All Projects
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Explore my complete portfolio of innovative projects spanning AI, technology, content creation, and entrepreneurship
            </p>
            <div className="w-24 h-1 bg-gradient-to-r from-pink-400 to-violet-400 mx-auto mt-6"></div>
          </div>

          {/* Filter Buttons */}
          <div className="flex flex-wrap gap-3 justify-center mb-12">
            {["All", "Featured", "Web Development", "AI/ML", "IoT/Hardware", "Leadership"].map((filter) => (
              <motion.button
                key={filter}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`px-4 py-2 rounded-full font-semibold transition-all ${
                  filter === "All"
                    ? "bg-gradient-to-r from-violet-600 to-pink-600 text-white"
                    : "bg-white border border-gray-300 text-gray-700 hover:border-violet-600"
                }`}
              >
                {filter}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Projects Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {allProjects.map((project, index) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.1 }}
              whileHover={{ y: -10 }}
              className="group bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100"
            >
              {/* Project Image */}
              <div className="relative h-48 bg-gradient-to-br from-violet-100 to-pink-100 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-violet-500/20 to-pink-500/20"></div>
                <div className="absolute top-4 left-4">
                  {project.featured && (
                    <span className="px-3 py-1 bg-yellow-400 text-yellow-900 text-xs font-bold rounded-full flex items-center">
                      <Star className="w-3 h-3 mr-1" />
                      Featured
                    </span>
                  )}
                </div>
                <div className="absolute top-4 right-4">
                  <span className="px-3 py-1 bg-white/80 text-gray-700 text-xs font-medium rounded-full">
                    {project.category}
                  </span>
                </div>
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <Eye className="w-8 h-8 text-white" />
                </div>
              </div>

              {/* Project Content */}
              <div className="p-6">
                <Link href={`/projects/${project.id}`}>
                  <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-violet-600 transition-colors cursor-pointer">
                    {project.title}
                  </h3>
                </Link>
                <p className="text-gray-600 mb-4 leading-relaxed text-sm">
                  {project.description}
                </p>

                <div className="flex flex-wrap gap-2 mb-6">
                  {project.tech.slice(0, 2).map((tech) => (
                    <span key={tech} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                      {tech}
                    </span>
                  ))}
                  {project.tech.length > 2 && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                      +{project.tech.length - 2} more
                    </span>
                  )}
                </div>

                <div className="flex space-x-4">
                  <motion.a
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    href={project.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center text-gray-600 hover:text-violet-600 transition-colors font-medium text-sm"
                  >
                    <Code className="w-4 h-4 mr-1" />
                    Code
                  </motion.a>
                  <motion.a
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    href={project.demo}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center text-gray-600 hover:text-pink-600 transition-colors font-medium text-sm"
                  >
                    <ExternalLink className="w-4 h-4 mr-1" />
                    Demo
                  </motion.a>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="ml-auto"
                  >
                    <Link 
                      href={`/projects/${project.id}`}
                      className="flex items-center text-violet-600 hover:text-violet-700 transition-colors font-medium text-sm"
                    >
                      Details
                    </Link>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA Section */}
        <motion.section
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mt-20 pt-20 border-t border-gray-200"
        >
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Interested in Collaboration?</h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            I'm always open to discussing new opportunities and innovative projects. Let's create something amazing together!
          </p>
          <motion.a
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            href="/#contact"
            className="inline-block px-8 py-4 bg-gradient-to-r from-violet-600 to-pink-600 text-white font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
          >
            Get In Touch
          </motion.a>
        </motion.section>
      </div>
    </div>
  );
}
