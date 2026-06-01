import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Music, VolumeX } from "lucide-react";
import { createMusicEngine, type MusicEngine, type Section } from "../../lib/musicEngine";

/**
 * Background-music toggle (bottom-left, clear of the chat widget bottom-right).
 *
 * The sound is generated in-browser by lib/musicEngine — a rhythmic, generative
 * track whose tempo / beat / melody change per page section. An Intersection
 * Observer tracks which section is in view and morphs the music to match, and
 * the button pulses in time with the beat.
 *
 * - Defaults to OFF (browsers block audio until a user gesture).
 * - Remembers the choice for the tab session (sessionStorage); resumes on
 *   reload, falling back to "start on first interaction" if autoplay is blocked.
 */
const STORAGE_KEY = "bg-music"; // "on" | "off"
const SECTION_IDS: Section[] = ["hero", "about", "skills", "experience", "projects", "education", "contact"];

function readPref(): boolean {
  try {
    return sessionStorage.getItem(STORAGE_KEY) === "on";
  } catch {
    return false;
  }
}
function writePref(on: boolean) {
  try {
    sessionStorage.setItem(STORAGE_KEY, on ? "on" : "off");
  } catch {
    /* storage blocked (private mode) — ignore */
  }
}

export default function MusicToggle() {
  const engineRef = useRef<MusicEngine | null>(null);
  const [playing, setPlaying] = useState(false);
  const [beat, setBeat] = useState(0);

  // Create the engine once, and resume if it was on last session.
  useEffect(() => {
    const engine = createMusicEngine({ onBeat: () => setBeat((b) => b + 1) });
    engineRef.current = engine;

    let cleanupResume = () => {};
    if (readPref()) {
      engine.start().then((running) => {
        if (running) {
          setPlaying(true);
        } else {
          const resume = () => {
            engine.start().then((ok) => ok && setPlaying(true));
            cleanupResume();
          };
          cleanupResume = () => {
            window.removeEventListener("pointerdown", resume);
            window.removeEventListener("keydown", resume);
          };
          window.addEventListener("pointerdown", resume, { once: true });
          window.addEventListener("keydown", resume, { once: true });
        }
      });
    }

    return () => {
      cleanupResume();
      engine.dispose();
      engineRef.current = null;
    };
  }, []);

  // Watch which section is most in view and morph the music to it.
  useEffect(() => {
    const ratios = new Map<Section, number>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          ratios.set(e.target.id as Section, e.isIntersecting ? e.intersectionRatio : 0);
        }
        let best: Section | null = null;
        let bestRatio = 0;
        for (const [id, r] of ratios) {
          if (r > bestRatio) {
            bestRatio = r;
            best = id;
          }
        }
        if (best) engineRef.current?.setSection(best);
      },
      { threshold: [0.15, 0.35, 0.55, 0.75] },
    );

    const els = SECTION_IDS.map((id) => document.getElementById(id)).filter(Boolean) as Element[];
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  async function toggle() {
    const engine = engineRef.current;
    if (!engine) return;
    if (playing) {
      engine.stop();
      setPlaying(false);
      writePref(false);
    } else {
      await engine.start(); // user gesture → allowed
      setPlaying(true);
      writePref(true);
    }
  }

  return (
    <motion.button
      onClick={toggle}
      aria-label={playing ? "Mute background music" : "Play background music"}
      aria-pressed={playing}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 260, damping: 18, delay: 0.8 }}
      whileTap={{ scale: 0.9 }}
      className="group fixed bottom-5 left-5 z-[60] flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-white/70 shadow-lg backdrop-blur-xl transition-colors hover:border-accent/50 hover:text-white md:bottom-7 md:left-7"
    >
      {/* soft glow + beat-synced pulse while playing */}
      <AnimatePresence>
        {playing && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute -inset-1 rounded-full bg-gradient-to-tr from-accent via-teal to-violet opacity-40 blur-md"
          />
        )}
      </AnimatePresence>
      {playing && (
        <motion.span
          key={beat}
          initial={{ scale: 0.7, opacity: 0.5 }}
          animate={{ scale: 1.6, opacity: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="pointer-events-none absolute inset-0 rounded-full border border-accent/60"
        />
      )}

      <span className="relative flex items-center justify-center">
        {playing ? (
          <span className="flex items-end gap-[3px]" aria-hidden="true">
            {[0, 1, 2, 3].map((i) => (
              <motion.span
                key={i}
                className="w-[3px] rounded-full bg-current"
                animate={{ height: [4, 14, 6, 12, 4] }}
                transition={{ duration: 1, repeat: Infinity, ease: "easeInOut", delay: i * 0.12 }}
              />
            ))}
          </span>
        ) : (
          <Music size={18} className="transition-transform group-hover:scale-110" />
        )}
      </span>

      {!playing && (
        <span className="absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full border border-ink-900 bg-ink-700 text-white/60">
          <VolumeX size={9} />
        </span>
      )}
    </motion.button>
  );
}
