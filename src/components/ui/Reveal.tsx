import { motion } from "framer-motion";
import type { ReactNode } from "react";
import type { Variants } from "framer-motion";

export type RevealVariant =
  | "up"
  | "down"
  | "left"
  | "right"
  | "fade"
  | "scale"
  | "zoom"
  | "blur"
  | "flip"
  | "tilt";

const VARIANTS: Record<RevealVariant, Variants> = {
  up: { hidden: { opacity: 0, y: 40 }, show: { opacity: 1, y: 0 } },
  down: { hidden: { opacity: 0, y: -40 }, show: { opacity: 1, y: 0 } },
  left: { hidden: { opacity: 0, x: -70 }, show: { opacity: 1, x: 0 } },
  right: { hidden: { opacity: 0, x: 70 }, show: { opacity: 1, x: 0 } },
  fade: { hidden: { opacity: 0 }, show: { opacity: 1 } },
  scale: { hidden: { opacity: 0, scale: 0.82 }, show: { opacity: 1, scale: 1 } },
  zoom: { hidden: { opacity: 0, scale: 1.12 }, show: { opacity: 1, scale: 1 } },
  blur: { hidden: { opacity: 0, filter: "blur(16px)" }, show: { opacity: 1, filter: "blur(0px)" } },
  flip: { hidden: { opacity: 0, rotateY: 70 }, show: { opacity: 1, rotateY: 0 } },
  tilt: { hidden: { opacity: 0, rotateZ: -7, y: 50 }, show: { opacity: 1, rotateZ: 0, y: 0 } },
};

type RevealProps = {
  children: ReactNode;
  /** Entrance direction / effect. */
  variant?: RevealVariant;
  delay?: number;
  /** Slightly longer for big/dramatic moves. */
  duration?: number;
  className?: string;
};

/**
 * Scroll-triggered entrance with selectable motion (slide, fade, scale, blur,
 * flip…). Respects prefers-reduced-motion via the global CSS reset in index.css.
 */
export default function Reveal({
  children,
  variant = "up",
  delay = 0,
  duration = 0.7,
  className,
}: RevealProps) {
  const needsPerspective = variant === "flip" || variant === "tilt";
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="show"
      // once: false → the entrance replays every time the element re-enters the
      // viewport (scroll down to it, scroll back up, or jump via the navbar).
      viewport={{ once: false, margin: "-80px" }}
      variants={VARIANTS[variant]}
      transition={{ duration, delay, ease: [0.16, 1, 0.3, 1] }}
      style={needsPerspective ? { transformPerspective: 1000 } : undefined}
    >
      {children}
    </motion.div>
  );
}
