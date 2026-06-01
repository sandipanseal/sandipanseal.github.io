import { useEffect, useRef } from "react";
import { useMotionValue, useSpring } from "framer-motion";

/**
 * Tracks the pointer position relative to an element's center and returns
 * spring-smoothed motion values in the range [-1, 1] on each axis. Used to give
 * section backdrops (and anything else) a subtle, interactive parallax/tilt.
 * Skips work while the element is off-screen; honors prefers-reduced-motion.
 */
export function usePointerParallax<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 60, damping: 18, mass: 0.6 });
  const sy = useSpring(y, { stiffness: 60, damping: 18, mass: 0.6 });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduced =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    let raf = 0;
    const clamp = (v: number) => Math.max(-1, Math.min(1, v));

    function onMove(e: PointerEvent) {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const r = el!.getBoundingClientRect();
        if (r.bottom < 0 || r.top > window.innerHeight) return; // off-screen
        const cx = r.left + r.width / 2;
        const cy = r.top + r.height / 2;
        x.set(clamp((e.clientX - cx) / (r.width / 2)));
        y.set(clamp((e.clientY - cy) / (r.height / 2)));
      });
    }

    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(raf);
    };
  }, [x, y]);

  return { ref, x: sx, y: sy };
}
