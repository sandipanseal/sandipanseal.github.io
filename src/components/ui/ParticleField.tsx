import { useEffect, useRef } from "react";

type Props = {
  className?: string;
  /** Particle / link colors (rgb triplets, no alpha — alpha is applied per draw). */
  colors?: [number, number, number][];
  /** Roughly one particle per this many square px. Lower = denser. */
  area?: number;
  /** Max particles regardless of viewport size. */
  max?: number;
  /** Distance under which two particles get a connecting line. */
  linkDist?: number;
};

type P = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  c: [number, number, number];
};

/**
 * Lightweight, dependency-free interactive particle network ("particles.js"
 * style) rendered on a <canvas>. Nodes drift, link to nearby neighbours, and
 * react to the cursor (gently pushed away + linked to). DPR-aware, resize-aware,
 * and fully disabled under prefers-reduced-motion (renders a single static frame).
 */
export default function ParticleField({
  className,
  colors = [
    [109, 139, 255], // accent
    [63, 217, 200], // teal
    [179, 136, 255], // violet
  ],
  area = 11000,
  max = 120,
  linkDist = 130,
}: Props) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let w = 0;
    let h = 0;
    let dpr = 1;
    let particles: P[] = [];
    let raf = 0;
    const mouse = { x: -9999, y: -9999, active: false };

    const rand = (a: number, b: number) => a + Math.random() * (b - a);
    const pick = () => colors[Math.floor(Math.random() * colors.length)];

    function build() {
      const count = Math.min(max, Math.max(24, Math.floor((w * h) / area)));
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: rand(-0.35, 0.35),
        vy: rand(-0.35, 0.35),
        r: rand(0.7, 2.2),
        c: pick(),
      }));
    }

    function resize() {
      const rect = canvas!.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = rect.width;
      h = rect.height;
      canvas!.width = Math.floor(w * dpr);
      canvas!.height = Math.floor(h * dpr);
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      build();
    }

    function draw() {
      ctx!.clearRect(0, 0, w, h);
      const linkSq = linkDist * linkDist;
      const mouseRange = 160;
      const mouseSq = mouseRange * mouseRange;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // motion
        p.x += p.vx;
        p.y += p.vy;

        // wrap around edges for a seamless field
        if (p.x < -20) p.x = w + 20;
        else if (p.x > w + 20) p.x = -20;
        if (p.y < -20) p.y = h + 20;
        else if (p.y > h + 20) p.y = -20;

        // cursor repulsion
        if (mouse.active) {
          const dx = p.x - mouse.x;
          const dy = p.y - mouse.y;
          const dsq = dx * dx + dy * dy;
          if (dsq < mouseSq && dsq > 0.01) {
            const d = Math.sqrt(dsq);
            const force = (mouseRange - d) / mouseRange;
            p.x += (dx / d) * force * 1.6;
            p.y += (dy / d) * force * 1.6;
          }
        }

        // links to neighbours
        for (let j = i + 1; j < particles.length; j++) {
          const q = particles[j];
          const dx = p.x - q.x;
          const dy = p.y - q.y;
          const dsq = dx * dx + dy * dy;
          if (dsq < linkSq) {
            const a = (1 - dsq / linkSq) * 0.5;
            ctx!.strokeStyle = `rgba(${p.c[0]},${p.c[1]},${p.c[2]},${a})`;
            ctx!.lineWidth = 1;
            ctx!.beginPath();
            ctx!.moveTo(p.x, p.y);
            ctx!.lineTo(q.x, q.y);
            ctx!.stroke();
          }
        }

        // link to cursor
        if (mouse.active) {
          const dx = p.x - mouse.x;
          const dy = p.y - mouse.y;
          const dsq = dx * dx + dy * dy;
          if (dsq < mouseSq) {
            const a = (1 - dsq / mouseSq) * 0.6;
            ctx!.strokeStyle = `rgba(${p.c[0]},${p.c[1]},${p.c[2]},${a})`;
            ctx!.lineWidth = 1;
            ctx!.beginPath();
            ctx!.moveTo(p.x, p.y);
            ctx!.lineTo(mouse.x, mouse.y);
            ctx!.stroke();
          }
        }

        // node
        ctx!.fillStyle = `rgba(${p.c[0]},${p.c[1]},${p.c[2]},0.85)`;
        ctx!.beginPath();
        ctx!.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx!.fill();
      }

      if (!reduced) raf = requestAnimationFrame(draw);
    }

    function onMove(e: PointerEvent) {
      const rect = canvas!.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
      mouse.active = true;
    }
    function onLeave() {
      mouse.active = false;
      mouse.x = -9999;
      mouse.y = -9999;
    }

    resize();
    draw(); // one frame (and the rAF loop if motion is allowed)

    window.addEventListener("resize", resize);
    // listen on window so the cursor still drives particles through overlaid content
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerleave", onLeave);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerleave", onLeave);
    };
  }, [colors, area, max, linkDist]);

  return <canvas ref={ref} aria-hidden className={className} />;
}
