import Reveal from "./Reveal";

type Props = {
  index: string;
  title: string;
  kicker?: string;
};

export default function SectionHeading({ index, title, kicker }: Props) {
  return (
    <Reveal className="mb-14 md:mb-20">
      <div className="flex items-center gap-3 text-sm font-medium tracking-widest text-accent-soft/70">
        <span className="font-mono">{index}</span>
        <span className="h-px w-10 bg-gradient-to-r from-accent/60 to-transparent" />
        {kicker && <span className="uppercase">{kicker}</span>}
      </div>
      <h2 className="mt-4 text-4xl font-semibold tracking-tightest text-white md:text-6xl">
        {title}
      </h2>
    </Reveal>
  );
}
