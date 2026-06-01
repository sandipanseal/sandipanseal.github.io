import { GraduationCap, BadgeCheck, Award } from "lucide-react";
import SectionHeading from "../ui/SectionHeading";
import Reveal from "../ui/Reveal";
import { education, certificationGroups, awards } from "../../data/profile";

export default function Education() {
  return (
    <section id="education" className="section-pad">
      <SectionHeading index="05" kicker="Background" title="Education, credentials & honors." />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Education */}
        <Reveal>
          <div className="glass h-full rounded-2xl p-7">
            <div className="flex items-center gap-2 text-accent-soft">
              <GraduationCap size={18} />
              <h3 className="font-semibold uppercase tracking-widest text-white/80">Education</h3>
            </div>
            <div className="mt-6 space-y-6">
              {education.map((e) => (
                <div key={e.school} className="border-l-2 border-white/10 pl-4">
                  <h4 className="font-medium text-white">{e.degree}</h4>
                  <p className="text-sm text-white/60">{e.school}</p>
                  <div className="mt-1 flex items-center gap-2 text-xs text-white/40">
                    <span>{e.location}</span>
                    <span>•</span>
                    <span className="font-mono">{e.period}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Reveal>

        {/* Awards & patent */}
        <Reveal delay={0.1}>
          <div className="glass h-full rounded-2xl p-7">
            <div className="flex items-center gap-2 text-accent-soft">
              <Award size={18} />
              <h3 className="font-semibold uppercase tracking-widest text-white/80">Awards & Patent</h3>
            </div>
            <div className="mt-5 space-y-3">
              {awards.map((a) => (
                <div key={a} className="flex gap-3 text-white/70">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-violet" />
                  <span className="leading-relaxed">{a}</span>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </div>

      {/* Certifications & Credentials — categorized */}
      <Reveal delay={0.1}>
        <div className="glass mt-6 rounded-2xl p-7 md:p-9">
          <div className="flex items-center gap-2 text-accent-soft">
            <BadgeCheck size={18} />
            <h3 className="font-semibold uppercase tracking-widest text-white/80">
              Certifications & Credentials
            </h3>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-3">
            {certificationGroups.map((group) => (
              <div key={group.category}>
                <h4 className="mb-4 text-sm font-medium text-accent-soft">{group.category}</h4>
                <div className="space-y-2.5">
                  {group.items.map((c) => (
                    <div
                      key={c.name}
                      className="rounded-xl border border-white/5 bg-white/[0.02] px-4 py-2.5"
                    >
                      <p className="text-sm font-medium leading-snug text-white">{c.name}</p>
                      <div className="mt-0.5 flex items-center justify-between gap-2">
                        <span className="text-xs text-white/50">{c.issuer}</span>
                        {c.date && <span className="shrink-0 font-mono text-xs text-white/35">{c.date}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </Reveal>
    </section>
  );
}
