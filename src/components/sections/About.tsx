import { Sparkles, Target, Globe2 } from "lucide-react";
import SectionHeading from "../ui/SectionHeading";
import Reveal from "../ui/Reveal";
import SectionFX from "../ui/SectionFX";
import { profile, languages } from "../../data/profile";

const stats = [
  { value: "4", label: "Years building" },
  { value: "99.4%", label: "Thesis accuracy" },
  { value: "6+", label: "Shipped AI systems" },
  { value: "1", label: "Patent" },
];

export default function About() {
  return (
    <section id="about" className="relative overflow-hidden">
      <SectionFX variant="about" />
      <div className="section-pad relative z-10">
      <SectionHeading index="01" kicker="About" title="From Kolkata to Magdeburg —
building AI that ships." />

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-5">
        <Reveal variant="left" className="lg:col-span-3">
          <p className="text-lg leading-relaxed text-white/70 md:text-xl">{profile.summary}</p>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {[
              { icon: Sparkles, title: "Frontier AI", text: "RAG, multi-agent & agentic systems in production." },
              { icon: Target, title: "Measurable", text: "Grounded, evaluated, guardrailed — not vibes." },
              { icon: Globe2, title: "Forward-deployed", text: "Partner with customers, prototype to production." },
            ].map(({ icon: Icon, title, text }, i) => (
              <Reveal key={title} variant="scale" delay={0.2 + i * 0.12}>
                <div className="glass h-full rounded-2xl p-5">
                  <Icon size={20} className="text-accent-soft" />
                  <h3 className="mt-3 font-semibold text-white">{title}</h3>
                  <p className="mt-1 text-sm text-white/55">{text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </Reveal>

        <Reveal variant="right" delay={0.15} className="lg:col-span-2">
          <div className="grid grid-cols-2 gap-4">
            {stats.map((s) => (
              <div key={s.label} className="glass rounded-2xl p-6 text-center">
                <div className="bg-gradient-to-r from-white to-accent-soft bg-clip-text text-4xl font-bold tracking-tight text-transparent">
                  {s.value}
                </div>
                <div className="mt-1 text-sm text-white/50">{s.label}</div>
              </div>
            ))}
          </div>

          <div className="glass mt-4 rounded-2xl p-6">
            <h3 className="text-sm font-medium uppercase tracking-widest text-white/50">Languages</h3>
            <div className="mt-4 space-y-3">
              {languages.map((l) => (
                <div key={l.name} className="flex items-center justify-between">
                  <span className="font-medium text-white">{l.name}</span>
                  <span className="text-sm text-white/50">{l.level}</span>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
      </div>
    </section>
  );
}
