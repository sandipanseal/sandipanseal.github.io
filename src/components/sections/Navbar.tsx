import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, FileText } from "lucide-react";
import { navItems, profile } from "../../data/profile";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      className="fixed inset-x-0 top-0 z-50"
    >
      <nav
        className={`mx-auto flex max-w-6xl items-center justify-between px-6 transition-all duration-300 md:px-8 ${
          scrolled ? "my-3" : "my-5"
        }`}
      >
        <div
          className={`flex w-full items-center justify-between rounded-2xl px-4 py-3 transition-all duration-300 ${
            scrolled ? "glass-strong shadow-lg shadow-black/30" : ""
          }`}
        >
          <a href="#hero" className="flex items-center gap-2 font-semibold tracking-tight text-white">
            <img
              src="/profile.png"
              alt="Sandipan Seal"
              className="h-8 w-8 rounded-lg object-cover ring-1 ring-white/15"
            />
            <span className="hidden sm:inline">Sandipan Seal</span>
          </a>

          <div className="hidden items-center gap-1 md:flex">
            {navItems.map((n) => (
              <a
                key={n.href}
                href={n.href}
                className="rounded-lg px-3 py-2 text-sm text-white/70 transition-colors hover:bg-white/5 hover:text-white"
              >
                {n.label}
              </a>
            ))}
            <a
              href={profile.cvUrl}
              target="_blank"
              rel="noreferrer"
              className="ml-2 inline-flex items-center gap-1.5 rounded-lg bg-white px-4 py-2 text-sm font-medium text-ink-900 transition-transform hover:scale-105"
            >
              <FileText size={14} /> CV
            </a>
          </div>

          <button
            onClick={() => setOpen((v) => !v)}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-white md:hidden"
            aria-label="Toggle menu"
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mx-6 overflow-hidden rounded-2xl glass-strong p-2 md:hidden"
          >
            {navItems.map((n) => (
              <a
                key={n.href}
                href={n.href}
                onClick={() => setOpen(false)}
                className="block rounded-lg px-4 py-3 text-white/80 transition-colors hover:bg-white/5"
              >
                {n.label}
              </a>
            ))}
            <a
              href={profile.cvUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-1 block rounded-lg bg-white px-4 py-3 text-center font-medium text-ink-900"
            >
              Download CV
            </a>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
