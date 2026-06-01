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
 * - Plays by DEFAULT, and keeps playing until the visitor turns it off (that
 *   off-choice is remembered for the tab session). Browsers still block audio
 *   until the first gesture, so when autoplay is blocked we show the on-state
 *   immediately and actually begin the sound on the first scroll/click/keypress.
 */
const STORAGE_KEY = "bg-music"; // "on" | "off"
const SECTION_IDS: Section[] = ["hero", "about", "skills", "experience", "projects", "education", "contact"];

/** Default ON: true unless the visitor explicitly turned it off this session. */
function readPref(): boolean {
  try {
    return sessionStorage.getItem(STORAGE_KEY) !== "off";
  } catch {
    return true;
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
  const runningRef = useRef(false); // whether audio is ACTUALLY playing (vs. just the visual)
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [playing, setPlaying] = useState(false); // visual / intended state
  const [beat, setBeat] = useState(0);

  // Create the engine once. Default-on: start immediately, and if the browser
  // blocks autoplay, begin on the first real user gesture anywhere on the page.
  useEffect(() => {
    const engine = createMusicEngine({ onBeat: () => setBeat((b) => b + 1) });
    engineRef.current = engine;

    let removeResume = () => {};

    if (readPref()) {
      setPlaying(true); // show the on-state right away (reads as playing by default)
      // Defer ALL audio to the first real gesture — building the AudioContext
      // inside the gesture is what makes browsers actually start the sound.
      // A single mobile tap fires touchstart → touchend → click in sequence, and
      // on iOS it's often touchend/click (not touchstart) that actually unlocks
      // audio. So we attempt on EVERY event (no cross-event lock) and only
      // throttle the high-frequency scroll/wheel — otherwise the tap that should
      // work gets eaten. Gestures on the button itself are left to its handler.
      let lastScrollAttempt = 0;
      const begin = (e: Event) => {
        const tgt = e.target;
        if (tgt instanceof Node && buttonRef.current?.contains(tgt)) return;
        if (e.type === "scroll" || e.type === "wheel") {
          const now = performance.now();
          if (now - lastScrollAttempt < 400) return;
          lastScrollAttempt = now;
        }
        engine.start().then((ok) => {
          runningRef.current = ok;
          if (ok) removeResume();
        });
      };
      // Discrete inputs (tap/click/key) reliably unlock audio; touchend/click
      // cover iOS. scroll/wheel are best-effort (work on touch / some browsers).
      const events = ["pointerdown", "touchstart", "touchend", "keydown", "click", "wheel", "scroll"];
      events.forEach((ev) => window.addEventListener(ev, begin, { passive: true }));
      removeResume = () => events.forEach((ev) => window.removeEventListener(ev, begin));
    }

    return () => {
      removeResume();
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
    // Base the decision on whether audio is ACTUALLY running, not the visual:
    // if it's showing "on" but was autoplay-blocked, one click starts it.
    if (runningRef.current) {
      engine.stop();
      runningRef.current = false;
      setPlaying(false);
      writePref(false);
    } else {
      const ok = await engine.start(); // this click is a user gesture → allowed
      runningRef.current = ok;
      setPlaying(true);
      writePref(true);
    }
  }

  return (
    <motion.button
      ref={buttonRef}
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
