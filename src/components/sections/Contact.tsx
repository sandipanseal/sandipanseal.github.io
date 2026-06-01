import { Mail, Github, Linkedin, MapPin, FileText, ArrowUpRight, Code2 } from "lucide-react";
import SectionHeading from "../ui/SectionHeading";
import Reveal from "../ui/Reveal";
import { contact, profile } from "../../data/profile";

const channels = [
  { icon: Mail, label: "Email", value: contact.email, href: `mailto:${contact.email}` },
  { icon: Github, label: "GitHub", value: contact.githubHandle, href: contact.github },
  { icon: Linkedin, label: "LinkedIn", value: contact.linkedinHandle, href: contact.linkedin },
  { icon: Code2, label: "HackerRank", value: contact.hackerrankHandle, href: contact.hackerrank },
];

export default function Contact() {
  return (
    <section id="contact" className="section-pad">
      <Reveal>
        <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-ink-700 to-ink-800 p-9 md:p-14">
          <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-accent/20 blur-[120px]" />
          <div className="pointer-events-none absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-teal/15 blur-[120px]" />

          <div className="relative">
            <SectionHeading index="06" kicker="Contact" title="Let's build something." />

            <p className="-mt-6 max-w-xl text-lg text-white/60">
              I'm {profile.status.toLowerCase()}. If you're taking a GenAI use case from prototype to
              production, I'd love to talk.
            </p>

            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {channels.map(({ icon: Icon, label, value, href }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  className="group flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition-all hover:-translate-y-1 hover:border-accent/50"
                >
                  <div className="flex items-center justify-between">
                    <Icon size={20} className="text-accent-soft" />
                    <ArrowUpRight size={16} className="text-white/30 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-widest text-white/40">{label}</p>
                    <p className="truncate font-medium text-white">{value}</p>
                  </div>
                </a>
              ))}
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <a
                href={`mailto:${contact.email}`}
                className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 font-medium text-ink-900 transition-transform hover:scale-105"
              >
                <Mail size={16} /> Say hello
              </a>
              <a
                href={profile.cvUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-6 py-3 font-medium text-white transition-colors hover:border-accent/50"
              >
                <FileText size={16} /> Download CV
              </a>
              <span className="ml-auto flex items-center gap-2 text-sm text-white/40">
                <MapPin size={14} /> {profile.location}
              </span>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
