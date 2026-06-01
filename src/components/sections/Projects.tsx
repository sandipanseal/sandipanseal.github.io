import { Github, ExternalLink, FlaskConical, ArrowUpRight, BookOpen } from "lucide-react";
import SectionHeading from "../ui/SectionHeading";
import Reveal from "../ui/Reveal";
import SectionFX from "../ui/SectionFX";
import TiltCard from "../ui/TiltCard";
import { projects, thesis, publications } from "../../data/profile";

export default function Projects() {
  const featured = projects.filter((p) => p.featured);
  const rest = projects.filter((p) => !p.featured);

  return (
    <section id="projects" className="relative overflow-hidden">
      <SectionFX variant="projects" />
      <div className="section-pad relative z-10">
      <SectionHeading index="04" kicker="Selected work" title="Things I've built." />

      {/* Featured */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {featured.map((p, i) => (
          <Reveal key={p.name} variant="scale" delay={i * 0.1}>
            <TiltCard
              max={10}
              className="group relative flex h-full flex-col overflow-hidden rounded-3xl glass p-7"
            >
              <div className="pointer-events-none absolute inset-x-0 -top-24 h-48 bg-gradient-to-b from-accent/15 to-transparent opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100" />
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-white">{p.name}</h3>
                  <p className="text-sm text-accent-soft">{p.title}</p>
                </div>
                <div className="flex gap-2">
                  {p.github && (
                    <a href={p.github} target="_blank" rel="noreferrer" aria-label={`${p.name} on GitHub`} className="text-white/50 transition-colors hover:text-white">
                      <Github size={18} />
                    </a>
                  )}
                  {p.demo && (
                    <a href={p.demo} target="_blank" rel="noreferrer" aria-label={`${p.name} live demo`} className="text-white/50 transition-colors hover:text-white">
                      <ExternalLink size={18} />
                    </a>
                  )}
                </div>
              </div>

              <p className="mt-4 text-sm leading-relaxed text-white/65">{p.summary}</p>

              <ul className="mt-4 space-y-2">
                {p.points.map((pt, idx) => (
                  <li key={idx} className="flex gap-2 text-sm text-white/55">
                    <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-accent/60" />
                    {pt}
                  </li>
                ))}
              </ul>

              <div className="mt-auto pt-5">
                <div className="flex flex-wrap gap-1.5">
                  {p.stack.slice(0, 6).map((s) => (
                    <span key={s} className="rounded-md border border-white/10 bg-white/[0.03] px-2 py-0.5 text-xs text-white/60">
                      {s}
                    </span>
                  ))}
                </div>
                {p.demo && (
                  <a
                    href={p.demo}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-teal transition-colors hover:text-white"
                  >
                    Live demo <ArrowUpRight size={14} />
                  </a>
                )}
              </div>
            </TiltCard>
          </Reveal>
        ))}
      </div>

      {/* Secondary projects */}
      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        {rest.map((p, i) => (
          <Reveal key={p.name} variant="flip" delay={i * 0.08}>
            <a
              href={p.github}
              target="_blank"
              rel="noreferrer"
              className="group flex h-full flex-col rounded-2xl glass p-5 transition-colors hover:border-accent/40"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-white">{p.name}</h3>
                <ArrowUpRight size={16} className="text-white/40 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </div>
              <p className="text-xs text-accent-soft">{p.title}</p>
              <p className="mt-3 text-sm text-white/55">{p.summary}</p>
              <div className="mt-auto flex flex-wrap gap-1.5 pt-4">
                {p.stack.slice(0, 4).map((s) => (
                  <span key={s} className="rounded-md border border-white/10 px-2 py-0.5 text-xs text-white/50">
                    {s}
                  </span>
                ))}
              </div>
            </a>
          </Reveal>
        ))}
      </div>

      {/* Research highlight */}
      <Reveal variant="blur" delay={0.1}>
        <div className="relative mt-6 overflow-hidden rounded-3xl border border-accent/20 bg-gradient-to-br from-accent/10 via-white/[0.02] to-teal/5 p-7 md:p-9">
          <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-accent/15 blur-3xl" />
          <div className="flex items-center gap-2 text-accent-soft">
            <FlaskConical size={18} />
            <span className="text-sm font-medium uppercase tracking-widest">Research</span>
          </div>
          <h3 className="mt-3 max-w-3xl text-2xl font-semibold text-white md:text-3xl">{thesis.title}</h3>
          <p className="mt-1 text-sm text-white/50">{thesis.org}</p>
          <ul className="mt-5 grid gap-3 md:grid-cols-2">
            {thesis.points.map((pt, idx) => (
              <li key={idx} className="flex gap-3 text-white/70">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-teal" />
                <span className="leading-relaxed">{pt}</span>
              </li>
            ))}
          </ul>
        </div>
      </Reveal>

      {/* Publications */}
      <Reveal variant="right" delay={0.1}>
        <div className="glass mt-6 rounded-3xl p-7 md:p-9">
          <div className="flex items-center gap-2 text-accent-soft">
            <BookOpen size={18} />
            <span className="text-sm font-medium uppercase tracking-widest">Publications</span>
          </div>

          <div className="mt-6 space-y-3">
            {publications.map((pub) => (
              <a
                key={pub.title}
                href={pub.url}
                target="_blank"
                rel="noreferrer"
                className="group flex flex-col gap-1 rounded-2xl border border-white/5 bg-white/[0.02] p-5 transition-colors hover:border-accent/40"
              >
                <div className="flex items-start justify-between gap-4">
                  <h4 className="font-medium leading-snug text-white">{pub.title}</h4>
                  <ArrowUpRight
                    size={16}
                    className="mt-0.5 shrink-0 text-white/40 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  />
                </div>
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-white/45">
                  <span className="text-accent-soft">{pub.venue}</span>
                  <span>•</span>
                  <span className="font-mono">{pub.date}</span>
                </div>
                {pub.description && (
                  <p className="mt-1.5 text-sm leading-relaxed text-white/60">{pub.description}</p>
                )}
              </a>
            ))}
          </div>
        </div>
      </Reveal>

      <Reveal delay={0.1}>
        <p className="mt-8 text-center text-sm text-white/40">
          More on{" "}
          <a href="https://github.com/sandipanseal" target="_blank" rel="noreferrer" className="text-accent-soft underline-offset-4 hover:underline">
            github.com/sandipanseal
          </a>
        </p>
      </Reveal>
      </div>
    </section>
  );
}
