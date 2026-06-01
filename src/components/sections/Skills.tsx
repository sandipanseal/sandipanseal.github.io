import { motion } from "framer-motion";
import SectionHeading from "../ui/SectionHeading";
import Reveal from "../ui/Reveal";
import SectionFX from "../ui/SectionFX";
import { skillGroups } from "../../data/profile";

export default function Skills() {
  return (
    <section id="skills" className="relative overflow-hidden">
      <SectionFX variant="skills" />
      <div className="section-pad relative z-10">
      <SectionHeading index="02" kicker="Capabilities" title="Skills" />

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {skillGroups.map((group, i) => (
          <Reveal key={group.domain} variant={i % 2 === 0 ? "left" : "right"} delay={(i % 2) * 0.08}>
            <motion.div
              whileHover={{ y: -4 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="group relative h-full overflow-hidden rounded-2xl glass p-6"
            >
              <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-accent/10 blur-3xl transition-opacity duration-300 group-hover:opacity-100 md:opacity-0" />
              <div className="flex items-baseline justify-between">
                <h3 className="text-lg font-semibold text-white">{group.domain}</h3>
                <span className="font-mono text-xs text-white/30">{String(i + 1).padStart(2, "0")}</span>
              </div>
              <p className="mt-1 text-sm text-white/50">{group.blurb}</p>
              <div className="mt-5 flex flex-wrap gap-2">
                {group.skills.map((s) => (
                  <span key={s} className="chip">
                    {s}
                  </span>
                ))}
              </div>
            </motion.div>
          </Reveal>
        ))}
      </div>
      </div>
    </section>
  );
}
