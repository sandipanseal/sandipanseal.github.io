import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowDown, Github, Linkedin, Mail, MapPin, FileText } from "lucide-react";
import { profile, contact } from "../../data/profile";
import ParticleField from "../ui/ParticleField";

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
};
const item = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] as const } },
};

/**
 * The avatar clip (public/avatar-dark.mp4) already has an essentially pure-black
 * background, and the avatar lives inside the shared black hero card — so the
 * background blends in on its own with no separate box. Only a gentle, natural
 * polish is applied (a touch of contrast keeps the background deep; light
 * brightness/saturation keep the face lively without looking over-processed).
 *
 * Scaling: object-contain shows the WHOLE frame so the waving-hand gesture is
 * never cropped; the letterbox is invisible against the black card. A small
 * scale-up keeps it from looking too small while still keeping the hand in view.
 * If the video is missing, we fall back to the photo.
 */
const AVATAR_FILTER = "contrast(1.12) brightness(1.04) saturate(1.06)";

function AvatarVideo() {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div className="flex h-full w-full items-center justify-center p-8">
        <img
          src={profile.heroImageFallback}
          alt={profile.name}
          className="max-h-full rounded-2xl object-contain"
        />
      </div>
    );
  }

  return (
    <video
      src={profile.heroVideo}
      autoPlay
      loop
      muted
      playsInline
      aria-label={`${profile.name} animated avatar`}
      onError={() => setFailed(true)}
      className="h-full w-full scale-110 object-contain"
      style={{ filter: AVATAR_FILTER }}
    />
  );
}

export default function Hero() {
  return (
    <section id="hero" className="relative min-h-[100svh] w-full overflow-hidden">
      {/* Background layers */}
      <div className="absolute inset-0 aurora" />
      <div className="absolute inset-0 grid-fade" />
      {/* Interactive particle network — reacts to the cursor */}
      <ParticleField className="absolute inset-0 h-full w-full" />
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[480px] w-[480px] -translate-x-1/2 rounded-full bg-accent/20 blur-[140px]" />

      <div className="relative z-10 mx-auto flex min-h-[100svh] w-full max-w-6xl items-start px-4 pb-12 pt-24 md:items-center md:px-8 md:pt-28">
        {/* Unified hero panel: text (left) + avatar (right) share one black card,
            so the avatar's dark background melts into the card — no separate box. */}
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid w-full grid-cols-1 overflow-hidden rounded-[2rem] border border-white/10 bg-black shadow-2xl shadow-black/50 md:grid-cols-2"
        >
          {/* Left: copy */}
          <div className="relative order-2 p-8 sm:p-10 md:order-1 md:p-12 lg:p-14">
            {/* subtle accent glow for depth on the text side */}
            <div className="pointer-events-none absolute -left-10 -top-10 h-64 w-64 rounded-full bg-accent/15 blur-[120px]" />
            <div className="relative">
              <motion.div
                variants={item}
                className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-1.5 text-xs text-white/70 backdrop-blur-md sm:text-sm"
              >
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-teal opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-teal" />
                </span>
                {profile.status}
              </motion.div>

              <motion.h1
                variants={item}
                className="text-5xl font-bold leading-[1.02] tracking-tightest text-white md:text-6xl lg:text-7xl"
              >
                {profile.name}
              </motion.h1>

              <motion.p variants={item} className="mt-4 text-xl font-medium text-white/80 md:text-2xl">
                {profile.role} <span className="text-accent-soft">·</span> {profile.tagline}
              </motion.p>

              <motion.p variants={item} className="mt-6 max-w-xl text-lg leading-relaxed text-white/60">
                {profile.headline} Building production RAG, multi-agent, and safety-guarded LLM
                systems — from prototype to production.
              </motion.p>

              <motion.div variants={item} className="mt-5 flex items-center gap-2 text-sm text-white/50">
                <MapPin size={15} className="text-accent-soft" />
                {profile.location}
                <span className="mx-1 text-white/20">•</span>
                <span>from {profile.origin}</span>
              </motion.div>

              <motion.div variants={item} className="mt-9 flex flex-wrap items-center gap-3">
                <a
                  href="#projects"
                  className="group inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 font-medium text-ink-900 transition-transform hover:scale-[1.03]"
                >
                  View my work
                  <ArrowDown size={16} className="transition-transform group-hover:translate-y-0.5" />
                </a>
                <a
                  href={profile.cvUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-6 py-3 font-medium text-white backdrop-blur-md transition-colors hover:border-accent/50 hover:bg-white/10"
                >
                  <FileText size={16} /> Download CV
                </a>
              </motion.div>

              <motion.div variants={item} className="mt-8 flex items-center gap-4">
                {[
                  { icon: Github, href: contact.github, label: "GitHub" },
                  { icon: Linkedin, href: contact.linkedin, label: "LinkedIn" },
                  { icon: Mail, href: `mailto:${contact.email}`, label: "Email" },
                ].map(({ icon: Icon, href, label }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={label}
                    className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] text-white/70 transition-all hover:-translate-y-0.5 hover:border-accent/50 hover:text-white"
                  >
                    <Icon size={18} />
                  </a>
                ))}
              </motion.div>
            </div>
          </div>

          {/* Right: animated avatar — its dark background blends into the black card */}
          <div className="relative order-1 min-h-[300px] bg-black sm:min-h-[380px] md:order-2 md:min-h-[560px]">
            <AvatarVideo />
          </div>
        </motion.div>
      </div>

      {/* Scroll cue */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4 }}
        className="absolute bottom-7 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-2 text-white/40"
      >
        <span className="text-xs uppercase tracking-widest">Scroll</span>
        <motion.span
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
          className="h-8 w-px bg-gradient-to-b from-white/50 to-transparent"
        />
      </motion.div>
    </section>
  );
}
