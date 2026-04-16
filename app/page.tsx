import Header from "./components/Header";
import Hero from "./components/Hero";
import About from "./components/About";
import Skills from "./components/Skills";
import Projects from "./components/Projects";
import Certifications from "./components/Certifications";
import Contact from "./components/Contact";
import Footer from "./components/Footer";
import SectionErrorBoundary from "./components/SectionErrorBoundary";

export default function Home() {
  return (
    <main>
      <Header />
      <section id="home">
        <SectionErrorBoundary sectionName="Hero">
          <Hero />
        </SectionErrorBoundary>
      </section>
      <section id="about">
        <SectionErrorBoundary sectionName="About">
          <About />
        </SectionErrorBoundary>
      </section>
      <section id="skills">
        <SectionErrorBoundary sectionName="Skills">
          <Skills />
        </SectionErrorBoundary>
      </section>
      <section id="projects">
        <SectionErrorBoundary sectionName="Projects">
          <Projects />
        </SectionErrorBoundary>
      </section>
      <section id="certifications">
        <SectionErrorBoundary sectionName="Certifications">
          <Certifications />
        </SectionErrorBoundary>
      </section>
      <section id="contact">
        <SectionErrorBoundary sectionName="Contact">
          <Contact />
        </SectionErrorBoundary>
      </section>
      <Footer />
    </main>
  );
}
