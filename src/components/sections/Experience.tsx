import { Briefcase } from "lucide-react";
import SectionHeading from "../ui/SectionHeading";
import Reveal from "../ui/Reveal";
import SectionFX from "../ui/SectionFX";
import { experience } from "../../data/profile";

export default function Experience() {
  return (
    <section id="experience" className="relative overflow-hidden">
      <SectionFX variant="experience" />
      <div className="section-pad relative z-10">
      <SectionHeading index="03" kicker="Experience" title="Where I've shipped." />

      <div className="relative">
        {/* Timeline spine */}
        <div className="absolute left-[7px] top-2 hidden h-full w-px bg-gradient-to-b from-accent/50 via-white/10 to-transparent md:block" />

        <div className="space-y-10">
          {experience.map((job, i) => (
            <Reveal key={job.company} variant="left" delay={i * 0.1}>
              <div className="md:pl-12">
                {/* Node */}
                <span className="absolute left-0 hidden h-4 w-4 -translate-y-0.5 items-center justify-center rounded-full border border-accent/60 bg-ink-900 md:flex">
                  <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                </span>

                <div className="glass rounded-2xl p-6 md:p-8">
                  <div className="flex flex-col justify-between gap-2 md:flex-row md:items-start">
                    <div>
                      <div className="flex items-center gap-2 text-accent-soft">
                        <Briefcase size={16} />
                        <span className="font-semibold text-white">{job.company}</span>
                        {job.current && (
                          <span className="rounded-full bg-teal/15 px-2 py-0.5 text-xs font-medium text-teal">
                            Current
                          </span>
                        )}
                      </div>
                      <h3 className="mt-2 text-xl font-medium text-white">{job.role}</h3>
                      <p className="text-sm text-white/50">{job.location}</p>
                    </div>
                    <span className="shrink-0 font-mono text-sm text-white/50">{job.period}</span>
                  </div>

                  <ul className="mt-5 space-y-3">
                    {job.points.map((p, idx) => (
                      <li key={idx} className="flex gap-3 text-white/70">
                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent/60" />
                        <span className="leading-relaxed">{p}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-5 flex flex-wrap gap-2">
                    {job.tags.map((t) => (
                      <span key={t} className="chip">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
      </div>
    </section>
  );
}
