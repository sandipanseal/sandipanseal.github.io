import { useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowUpRight, ChevronDown, Github, ExternalLink } from "lucide-react";
import { getProjectEntry } from "../../data/projectDetails";

export default function ProjectPage({ slug }: { slug: string }) {
  const project = getProjectEntry(slug);

  useEffect(() => {
    const prev = document.title;
    if (project) document.title = `${project.name} · Sandipan Seal`;
    return () => {
      document.title = prev;
    };
  }, [project]);

  const back = (
    <a
      href="#projects"
      className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-white/70 transition-colors hover:bg-white/5 hover:text-white"
    >
      <ArrowLeft size={16} /> Back to projects
    </a>
  );

  if (!project) {
    return (
      <main className="mx-auto max-w-4xl px-6 py-28">
        {back}
        <h1 className="mt-8 text-3xl font-semibold text-white">Project not found</h1>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-96 bg-gradient-to-b from-accent/10 to-transparent" />
      <div className="relative mx-auto max-w-5xl px-6 pb-24 pt-8 md:px-8">
        {back}

        <motion.header
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="mt-10"
        >
          <p className="text-sm font-medium uppercase tracking-widest text-accent-soft/80">Project</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tightest text-white md:text-6xl">{project.name}</h1>
          <p className="mt-3 max-w-3xl text-lg text-accent-soft">{project.title}</p>

          {(project.github || project.demo) && (
            <div className="mt-6 flex flex-wrap gap-3">
              {project.github && (
                <a
                  href={project.github}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-medium text-ink-900 transition-transform hover:scale-105"
                >
                  <Github size={16} /> View on GitHub <ArrowUpRight size={14} />
                </a>
              )}
              {project.demo && (
                <a
                  href={project.demo}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/15 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:border-accent/50"
                >
                  <ExternalLink size={16} /> Live demo
                </a>
              )}
            </div>
          )}
        </motion.header>

        <section className="mt-12 grid gap-8 md:grid-cols-[1.4fr_1fr]">
          <div>
            <h2 className="text-sm font-medium uppercase tracking-widest text-white/50">Overview</h2>
            <p className="mt-3 leading-relaxed text-white/75">{project.description}</p>
            <ul className="mt-5 space-y-2">
              {project.points.map((pt) => (
                <li key={pt} className="flex gap-2 text-sm text-white/60">
                  <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-accent/70" />
                  {pt}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="text-sm font-medium uppercase tracking-widest text-white/50">Stack</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {project.stack.map((s) => (
                <span key={s} className="rounded-md border border-white/10 bg-white/[0.03] px-2.5 py-1 text-xs text-white/70">
                  {s}
                </span>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-14">
          <h2 className="text-sm font-medium uppercase tracking-widest text-white/50">System architecture</h2>
          <div className="glass mt-4 rounded-3xl p-5 md:p-8">
            {project.architecture.map((layer, i) => (
              <div key={layer.label}>
                {i > 0 && (
                  <div className="flex justify-center py-2 text-accent/60">
                    <ChevronDown size={20} />
                  </div>
                )}
                <p className="mb-2 text-center text-xs font-medium uppercase tracking-widest text-accent-soft/70">{layer.label}</p>
                <div className="flex flex-wrap justify-center gap-2">
                  {layer.nodes.map((n) => (
                    <span
                      key={n}
                      className="rounded-xl border border-accent/25 bg-accent/[0.07] px-3.5 py-2 text-center text-sm text-white/85"
                    >
                      {n}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {project.screenshots.length > 0 && (
          <section className="mt-14">
            <h2 className="text-sm font-medium uppercase tracking-widest text-white/50">Screenshots</h2>
            <div className="mt-4 grid gap-5 md:grid-cols-2">
              {project.screenshots.map((s, i) => (
                <a
                  key={s.src}
                  href={s.src}
                  target="_blank"
                  rel="noreferrer"
                  className={`group block overflow-hidden rounded-2xl glass ${
                    i === 0 && project.screenshots.length % 2 === 1 ? "md:col-span-2" : ""
                  }`}
                >
                  <img
                    src={s.src}
                    alt={`${project.name}: ${s.caption}`}
                    loading="lazy"
                    className="aspect-[16/9] w-full object-cover object-top transition-transform duration-500 group-hover:scale-[1.02]"
                  />
                  <p className="px-4 py-3 text-sm text-white/60">{s.caption}</p>
                </a>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
