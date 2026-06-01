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

export default function App() {
  return (
    <>
      <ScrollProgress />
      <CustomCursor />
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
      {/* Floating "Ask about Sandipan" AI chat assistant (bottom-right). */}
      <ChatWidget />
      {/* Background-music toggle (bottom-left). */}
      <MusicToggle />
    </>
  );
}
