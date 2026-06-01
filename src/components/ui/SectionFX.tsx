import { motion, useTransform } from "framer-motion";
import { usePointerParallax } from "./useParallax";
import SectionCanvas from "./SectionCanvas";
import type { CanvasMode } from "./SectionCanvas";

/**
 * Per-section animated background. Each section passes a `variant` that bundles
 * a distinct color theme + a distinct interactive canvas animation (mouse/touch
 * reactive) so every section reads as its own coloured, living space. Soft
 * colour orbs add depth (with cursor parallax); the canvas carries the
 * interactive motion. Sits behind content (z-0) and never intercepts clicks.
 * Honors prefers-reduced-motion (canvas renders a static frame).
 */

type Theme = {
  /** primary rgb triplet */
  a: string;
  /** secondary rgb triplet */
  b: string;
  mode: CanvasMode;
};

const THEMES: Record<string, Theme> = {
  about: { a: "109,139,255", b: "138,162,255", mode: "dotgrid" }, // blue — gravity dot lattice
  skills: { a: "63,217,200", b: "91,255,230", mode: "flow" }, // teal — flow field
  experience: { a: "179,136,255", b: "212,169,255", mode: "waves" }, // violet — rippling waves
  projects: { a: "76,201,255", b: "143,224,255", mode: "techgrid" }, // cyan — interactive tech grid
  education: { a: "255,184,107", b: "255,210,158", mode: "starfield" }, // amber — warp starfield
  contact: { a: "255,126,182", b: "255,169,210", mode: "ripple" }, // pink — pointer ripples
};

function Orbs({ a, b }: { a: string; b: string }) {
  return (
    <>
      <div
        className="fx-orb animate-fx-drift-a"
        style={{ background: `radial-gradient(circle, rgba(${a},0.14), transparent 70%)`, top: "-6rem", left: "-4rem" }}
      />
      <div
        className="fx-orb animate-fx-drift-b"
        style={{ background: `radial-gradient(circle, rgba(${b},0.11), transparent 70%)`, bottom: "-8rem", right: "-4rem" }}
      />
    </>
  );
}

export default function SectionFX({ variant }: { variant: keyof typeof THEMES }) {
  const t = THEMES[variant];
  const { ref, x, y } = usePointerParallax<HTMLDivElement>();
  const orbX = useTransform(x, (v) => v * 34);
  const orbY = useTransform(y, (v) => v * 34);

  return (
    <div ref={ref} aria-hidden className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
      {/* soft colour orbs (parallax depth) */}
      <motion.div className="absolute inset-0" style={{ x: orbX, y: orbY }}>
        <Orbs a={t.a} b={t.b} />
      </motion.div>
      {/* interactive animated canvas — reacts to mouse + touch */}
      <SectionCanvas mode={t.mode} color={t.a} color2={t.b} className="absolute inset-0 h-full w-full" />
      {/* fade the FX into the page background at the seams */}
      <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-ink-900 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-ink-900 to-transparent" />
    </div>
  );
}
