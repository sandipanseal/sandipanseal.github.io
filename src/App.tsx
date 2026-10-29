import { useEffect, useRef, useState } from "react";
import ProjectPage from "./components/pages/ProjectPage";
import Navbar from "./components/sections/Navbar";
import Hero from "./components/sections/Hero";
import About from "./components/sections/About";
import Skills from "./components/sections/Skills";
import Experience from "./components/sections/Experience";
import Projects from "./components/sections/Projects";
import Education from "./components/sections/Education";
import Contact from "./components/sections/Contact";
import Footer from "./components/sections/Footer";
import ScrollProgress from "./components/ui/ScrollProgress";
import CustomCursor from "./components/ui/CustomCursor";
import ChatWidget from "./components/chat/ChatWidget";
import MusicToggle from "./components/ui/MusicToggle";

const PROJECT_PREFIX = "#/project/";

export default function App() {
  const [hash, setHash] = useState(window.location.hash);
  const prevSlug = useRef<string | null>(null);
  const slug = hash.startsWith(PROJECT_PREFIX) ? hash.slice(PROJECT_PREFIX.length) : null;

  useEffect(() => {
    const onHash = () => setHash(window.location.hash);
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  // Hash routing has no page loads: open project pages at the top, and when
  // coming back, jump to the section the link pointed at (e.g. #projects).
  useEffect(() => {
    if (slug) window.scrollTo(0, 0);
    else if (prevSlug.current && hash.length > 1) {
      const t = window.setTimeout(() => document.getElementById(hash.slice(1))?.scrollIntoView(), 50);
      prevSlug.current = slug;
      return () => window.clearTimeout(t);
    }
    prevSlug.current = slug;
  }, [slug, hash]);

  return (
    <>
      <ScrollProgress />
      <CustomCursor />
      {slug ? (
        <ProjectPage slug={slug} />
      ) : (
        <>
          <Navbar />
          <main className="relative">
            <Hero />
            {/* Each section below renders its own coloured SectionFX backdrop. */}
            <About />
            <Skills />
            <Experience />
            <Projects />
            <Education />
            <Contact />
          </main>
          <Footer />
        </>
      )}
      {/* Floating "Ask about Sandipan" AI chat assistant (bottom-right). */}
      <ChatWidget />
      {/* Background-music toggle (bottom-left). */}
      <MusicToggle route={slug ? "project" : "home"} />
    </>
  );
}
