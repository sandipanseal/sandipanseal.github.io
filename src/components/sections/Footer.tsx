import { Github, Linkedin, Mail } from "lucide-react";
import { contact, profile, navItems } from "../../data/profile";

export default function Footer() {
  return (
    <footer className="border-t border-white/10 px-6 py-12 md:px-8">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 md:flex-row">
        <div className="flex items-center gap-2 text-white/60">
          <img
            src="/profile.png"
            alt={profile.name}
            className="h-8 w-8 rounded-lg object-cover ring-1 ring-white/15"
          />
          <span>{profile.name}</span>
        </div>

        <nav className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm text-white/50">
          {navItems.map((n) => (
            <a key={n.href} href={n.href} className="transition-colors hover:text-white">
              {n.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
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
              className="text-white/50 transition-colors hover:text-white"
            >
              <Icon size={18} />
            </a>
          ))}
        </div>
      </div>

      <p className="mt-8 text-center text-xs text-white/30">
        © {new Date().getFullYear()} {profile.name}. Built with React, Framer Motion & Tailwind.
      </p>
    </footer>
  );
}
