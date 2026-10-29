import { Briefcase, TrendingUp } from "lucide-react";
import SectionHeading from "../ui/SectionHeading";
import Reveal from "../ui/Reveal";
import SectionFX from "../ui/SectionFX";
import { experience } from "../../data/profile";

type Job = (typeof experience)[number];

// Consecutive roles at the same company share one card (newest role first), so a
// promotion reads as one career step instead of two separate jobs.
const groups = experience.reduce<Job[][]>((acc, job) => {
  const last = acc[acc.length - 1];
  if (last && last[0].company === job.company) last.push(job);
  else acc.push([job]);
  return acc;
}, []);

/** "Oct 2026 – Present" + "Jan 2025 – Sep 2026" -> "Jan 2025 – Present" */
function spanOf(roles: Job[]) {
  const [newest, oldest] = [roles[0], roles[roles.length - 1]];
  return `${oldest.period.split(" – ")[0]} – ${newest.period.split(" – ")[1]}`;
}

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
          {groups.map((roles, i) => {
            const promoted = roles.length > 1;
            return (
              <Reveal key={roles[0].company} variant="left" delay={i * 0.1}>
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
                          <span className="font-semibold text-white">{roles[0].company}</span>
                          {roles.some((r) => r.current) && (
                            <span className="rounded-full bg-teal/15 px-2 py-0.5 text-xs font-medium text-teal">
                              Current
                            </span>
                          )}
                        </div>
                        <p className="mt-1 text-sm text-white/50">{roles[0].location}</p>
                      </div>
                      <span className="shrink-0 font-mono text-sm text-white/50">
                        {promoted ? spanOf(roles) : roles[0].period}
                      </span>
                    </div>

                    <div className="mt-5 space-y-6">
                      {roles.map((job, idx) => (
                        <div key={job.role}>
                          {idx > 0 && (
                            <div className="mb-6 flex items-center gap-3 text-xs font-medium text-teal">
                              <span className="h-px flex-1 bg-gradient-to-r from-teal/40 to-transparent" />
                              <span className="inline-flex items-center gap-1.5 rounded-full border border-teal/30 bg-teal/10 px-3 py-1">
                                <TrendingUp size={12} /> Promoted to {roles[idx - 1].role}
                              </span>
                              <span className="h-px flex-1 bg-gradient-to-l from-teal/40 to-transparent" />
                            </div>
                          )}
                          <div className="flex flex-col justify-between gap-1 md:flex-row md:items-baseline">
                            <h3 className="text-xl font-medium text-white">{job.role}</h3>
                            {promoted && <span className="font-mono text-sm text-white/50">{job.period}</span>}
                          </div>

                          <ul className="mt-4 space-y-3">
                            {job.points.map((p, k) => (
                              <li key={k} className="flex gap-3 text-white/70">
                                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent/60" />
                                <span className="leading-relaxed">{p}</span>
                              </li>
                            ))}
                          </ul>

                          <div className="mt-4 flex flex-wrap gap-2">
                            {job.tags.map((t) => (
                              <span key={t} className="chip">
                                {t}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
      </div>
    </section>
  );
}
