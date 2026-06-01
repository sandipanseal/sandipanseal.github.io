import { useEffect, useRef } from "react";
import { beatEnergy, beatCount, pulseActive } from "../../lib/musicPulse";

export type CanvasMode = "dotgrid" | "flow" | "waves" | "techgrid" | "starfield" | "ripple";

type Props = {
  mode: CanvasMode;
  /** Primary color as an "r,g,b" triplet. */
  color: string;
  /** Secondary color as an "r,g,b" triplet. */
  color2: string;
  className?: string;
};

type Dot = { bx: number; by: number; x: number; y: number };
type Part = { x: number; y: number; vx: number; vy: number };
type Star = { x: number; y: number; z: number };
type Ripple = { x: number; y: number; r: number; max: number };

/**
 * A per-section interactive canvas background. Each `mode` is a visually
 * distinct animation that reacts to the pointer (mouse) and touch. Shared
 * infrastructure handles DPR scaling, resize, off-screen pausing (so only
 * on-screen sections animate), and prefers-reduced-motion (renders one static
 * frame). Sits behind section content and never intercepts clicks.
 */
export default function SectionCanvas({ mode, color, color2, className }: Props) {
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
    let raf = 0;
    let t = 0;
    let energy = 0; // 0–1 beat envelope from the music (0 when music is off)
    let lastBeat = -1; // last seen beat index, for discrete on-beat triggers
    let visible = true;
    let rect = canvas.getBoundingClientRect();

    const client = { x: 0, y: 0, has: false };
    const pointer = { x: -9999, y: -9999, active: false };
    const rand = (a: number, b: number) => a + Math.random() * (b - a);

    let dots: Dot[] = [];
    let parts: Part[] = [];
    let stars: Star[] = [];
    let ripples: Ripple[] = [];
    let ambient = 0;
    let lastSpawnX = -9999;
    let lastSpawnY = -9999;

    function init() {
      if (mode === "dotgrid") {
        const gap = 54;
        dots = [];
        for (let y = gap / 2; y < h; y += gap)
          for (let x = gap / 2; x < w; x += gap) dots.push({ bx: x, by: y, x, y });
      } else if (mode === "flow") {
        const n = Math.min(230, Math.max(70, Math.floor((w * h) / 8500)));
        parts = Array.from({ length: n }, () => ({
          x: rand(0, w),
          y: rand(0, h),
          vx: rand(-0.5, 0.5),
          vy: rand(-0.5, 0.5),
        }));
      } else if (mode === "starfield") {
        const n = Math.min(300, Math.max(80, Math.floor((w * h) / 9000)));
        stars = Array.from({ length: n }, () => ({
          x: rand(-w, w),
          y: rand(-h, h),
          z: rand(1, w || 800),
        }));
      } else if (mode === "ripple") {
        ripples = [];
        ambient = 0;
      }
    }

    function setup() {
      rect = canvas!.getBoundingClientRect();
      w = rect.width;
      h = rect.height;
      if (w === 0 || h === 0) return;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas!.width = Math.floor(w * dpr);
      canvas!.height = Math.floor(h * dpr);
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      init();
    }

    function syncPointer() {
      rect = canvas!.getBoundingClientRect();
      if (!client.has) return;
      pointer.x = client.x - rect.left;
      pointer.y = client.y - rect.top;
      pointer.active =
        pointer.x >= -120 && pointer.x <= w + 120 && pointer.y >= -120 && pointer.y <= h + 120;
    }

    function drawDotgrid() {
      const R = 150;
      const R2 = R * R;
      for (const d of dots) {
        let tx = d.bx;
        let ty = d.by;
        let prox = 0;
        if (pointer.active) {
          const dx = d.bx - pointer.x;
          const dy = d.by - pointer.y;
          const ds = dx * dx + dy * dy;
          if (ds < R2) {
            const dist = Math.sqrt(ds) || 1;
            prox = (R - dist) / R;
            tx = d.bx + (dx / dist) * prox * 28;
            ty = d.by + (dy / dist) * prox * 28;
          }
        }
        d.x += (tx - d.x) * 0.12;
        d.y += (ty - d.y) * 0.12;
        ctx!.fillStyle = `rgba(${color},${0.16 + prox * 0.7 + energy * 0.35})`;
        ctx!.beginPath();
        ctx!.arc(d.x, d.y, 1 + prox * 2.4 + energy * 1.8, 0, 6.283);
        ctx!.fill();
      }
    }

    function drawFlow() {
      ctx!.lineCap = "round";
      for (const p of parts) {
        const ox = p.x;
        const oy = p.y;
        // animated flow-field angle
        const a = Math.sin(p.x * 0.005 + t * 0.4) + Math.cos(p.y * 0.005 - t * 0.3);
        p.vx += Math.cos(a * 2) * 0.06;
        p.vy += Math.sin(a * 2) * 0.06;
        if (pointer.active) {
          const dx = p.x - pointer.x;
          const dy = p.y - pointer.y;
          const ds = dx * dx + dy * dy;
          if (ds < 210 * 210 && ds > 0.01) {
            const dist = Math.sqrt(ds);
            const f = (210 - dist) / 210;
            // tangential swirl (vortex) + gentle outward push
            p.vx += (-dy / dist) * f * 0.9 + (dx / dist) * f * 0.18;
            p.vy += (dx / dist) * f * 0.9 + (dy / dist) * f * 0.18;
          }
        }
        p.vx *= 0.95;
        p.vy *= 0.95;
        p.x += p.vx;
        p.y += p.vy;
        let wrapped = false;
        if (p.x < 0) { p.x += w; wrapped = true; }
        else if (p.x > w) { p.x -= w; wrapped = true; }
        if (p.y < 0) { p.y += h; wrapped = true; }
        else if (p.y > h) { p.y -= h; wrapped = true; }

        const speed = Math.hypot(p.vx, p.vy);
        const col = speed > 0.6 ? color2 : color;
        // motion streak (skip on wrap to avoid lines flying across the canvas)
        if (!wrapped) {
          ctx!.strokeStyle = `rgba(${col},${Math.min(0.65, 0.18 + speed * 0.5)})`;
          ctx!.lineWidth = 1.3;
          ctx!.beginPath();
          ctx!.moveTo(ox - p.vx * 3, oy - p.vy * 3);
          ctx!.lineTo(p.x, p.y);
          ctx!.stroke();
        }
        ctx!.fillStyle = `rgba(${color2},${0.3 + Math.min(0.5, speed * 0.5)})`;
        ctx!.beginPath();
        ctx!.arc(p.x, p.y, 1.4 + energy * 1.6, 0, 6.283);
        ctx!.fill();
      }
    }

    function drawWaves() {
      const lines = 6;
      for (let i = 0; i < lines; i++) {
        const baseY = (h / (lines + 1)) * (i + 1);
        const amp = (9 + i * 2.5) * (1 + energy * 0.9);
        const phase = t * 0.6 + i * 0.8;
        ctx!.beginPath();
        for (let x = 0; x <= w; x += 12) {
          let y = baseY + Math.sin(x * 0.012 + phase) * amp;
          if (pointer.active) {
            const dx = x - pointer.x;
            const bump = Math.exp(-(dx * dx) / (2 * 90 * 90));
            y += (pointer.y - baseY) * bump * 0.55;
          }
          if (x === 0) ctx!.moveTo(x, y);
          else ctx!.lineTo(x, y);
        }
        ctx!.strokeStyle = `rgba(${i % 2 ? color2 : color},${0.1 + i * 0.04})`;
        ctx!.lineWidth = 1.4;
        ctx!.stroke();
      }
    }

    function drawTechGrid() {
      const gap = 58;
      const R = 175;
      const R2 = R * R;

      // faint base grid lines
      ctx!.lineWidth = 1;
      ctx!.strokeStyle = `rgba(${color},0.06)`;
      ctx!.beginPath();
      for (let x = gap; x < w; x += gap) {
        ctx!.moveTo(x, 0);
        ctx!.lineTo(x, h);
      }
      for (let y = gap; y < h; y += gap) {
        ctx!.moveTo(0, y);
        ctx!.lineTo(w, y);
      }
      ctx!.stroke();

      // pulsing intersection nodes; near the cursor they brighten, grow, and
      // shoot a crisp link to the pointer
      for (let x = gap; x < w; x += gap) {
        for (let y = gap; y < h; y += gap) {
          let prox = 0;
          if (pointer.active) {
            const dx = x - pointer.x;
            const dy = y - pointer.y;
            const ds = dx * dx + dy * dy;
            if (ds < R2) prox = 1 - Math.sqrt(ds) / R;
          }
          const pulse = 0.16 + 0.1 * Math.sin(t * 1.6 + (x + y) * 0.012);
          const a = Math.max(pulse, prox) + energy * 0.4;
          ctx!.fillStyle = `rgba(${prox > 0.3 ? color2 : color},${0.1 + a * 0.7})`;
          ctx!.beginPath();
          ctx!.arc(x, y, 1.1 + prox * 3 + energy * 2, 0, 6.283);
          ctx!.fill();

          if (prox > 0.12) {
            ctx!.strokeStyle = `rgba(${color2},${prox * 0.55})`;
            ctx!.lineWidth = 1;
            ctx!.beginPath();
            ctx!.moveTo(x, y);
            ctx!.lineTo(pointer.x, pointer.y);
            ctx!.stroke();
          }
        }
      }

      if (pointer.active) {
        ctx!.fillStyle = `rgba(${color2},0.9)`;
        ctx!.beginPath();
        ctx!.arc(pointer.x, pointer.y, 3, 0, 6.283);
        ctx!.fill();
      }
    }

    function drawStarfield() {
      const cx = w / 2 + (pointer.active ? (pointer.x - w / 2) * 0.3 : 0);
      const cy = h / 2 + (pointer.active ? (pointer.y - h / 2) * 0.3 : 0);
      const far = w || 800;
      for (const s of stars) {
        const speed = 2.4 + energy * 7; // warp surge on each beat
        const pz = s.z;
        s.z -= speed;
        if (s.z < 1) {
          s.z = far;
          s.x = rand(-w, w);
          s.y = rand(-h, h);
          continue;
        }
        const k = 140 / s.z;
        const pk = 140 / pz;
        const sx = cx + s.x * k;
        const sy = cy + s.y * k;
        const px = cx + s.x * pk;
        const py = cy + s.y * pk;
        const depth = 1 - s.z / far;
        ctx!.strokeStyle = `rgba(${depth > 0.6 ? color2 : color},${depth})`;
        ctx!.lineWidth = depth * 2.2;
        ctx!.beginPath();
        ctx!.moveTo(px, py);
        ctx!.lineTo(sx, sy);
        ctx!.stroke();
      }
    }

    function drawRipple() {
      // ambient ripples keep the surface alive when idle
      ambient -= 0.016;
      if (ambient <= 0) {
        ambient = 1.8;
        ripples.push({ x: rand(w * 0.15, w * 0.85), y: rand(h * 0.2, h * 0.8), r: 0, max: 220 });
      }
      // moving the pointer / finger trails a stream of ripples
      if (pointer.active) {
        const dx = pointer.x - lastSpawnX;
        const dy = pointer.y - lastSpawnY;
        if (dx * dx + dy * dy > 55 * 55) {
          ripples.push({ x: pointer.x, y: pointer.y, r: 0, max: 170 });
          lastSpawnX = pointer.x;
          lastSpawnY = pointer.y;
        }
      }
      if (ripples.length > 48) ripples.splice(0, ripples.length - 48);

      for (let i = ripples.length - 1; i >= 0; i--) {
        const rp = ripples[i];
        rp.r += 1.8;
        const a = 1 - rp.r / rp.max;
        if (a <= 0) {
          ripples.splice(i, 1);
          continue;
        }
        ctx!.strokeStyle = `rgba(${a > 0.6 ? color2 : color},${a * 0.85})`;
        ctx!.lineWidth = 1.6;
        ctx!.beginPath();
        ctx!.arc(rp.x, rp.y, rp.r, 0, 6.283);
        ctx!.stroke();
      }

      if (pointer.active) {
        const g = ctx!.createRadialGradient(pointer.x, pointer.y, 0, pointer.x, pointer.y, 70);
        g.addColorStop(0, `rgba(${color2},0.5)`);
        g.addColorStop(1, `rgba(${color2},0)`);
        ctx!.fillStyle = g;
        ctx!.beginPath();
        ctx!.arc(pointer.x, pointer.y, 70, 0, 6.283);
        ctx!.fill();
        ctx!.fillStyle = `rgba(${color2},0.95)`;
        ctx!.beginPath();
        ctx!.arc(pointer.x, pointer.y, 3, 0, 6.283);
        ctx!.fill();
      }
    }

    function draw() {
      ctx!.clearRect(0, 0, w, h);
      switch (mode) {
        case "dotgrid":
          drawDotgrid();
          break;
        case "flow":
          drawFlow();
          break;
        case "waves":
          drawWaves();
          break;
        case "techgrid":
          drawTechGrid();
          break;
        case "starfield":
          drawStarfield();
          break;
        case "ripple":
          drawRipple();
          break;
      }
    }

    /** Discrete reactions on each beat (used by modes that "hit" rather than swell). */
    function onBeat() {
      if (mode === "ripple") {
        ripples.push({ x: rand(w * 0.2, w * 0.8), y: rand(h * 0.2, h * 0.8), r: 0, max: 230 });
      }
    }

    function frame() {
      energy = beatEnergy();
      const bc = beatCount();
      if (bc !== lastBeat) {
        lastBeat = bc;
        if (pulseActive()) onBeat();
      }
      // The animation clock surges on each beat so motion pulses with the music.
      t += 0.016 * (1 + energy * 1.6);
      syncPointer();
      draw();
      if (!reduced && visible) raf = requestAnimationFrame(frame);
    }

    function onMove(e: PointerEvent) {
      client.x = e.clientX;
      client.y = e.clientY;
      client.has = true;
    }
    function onTouch(e: TouchEvent) {
      const tch = e.touches[0];
      if (tch) {
        client.x = tch.clientX;
        client.y = tch.clientY;
        client.has = true;
      }
    }
    function spawnRipple() {
      if (mode !== "ripple") return;
      syncPointer();
      if (pointer.active) ripples.push({ x: pointer.x, y: pointer.y, r: 0, max: 240 });
    }

    setup();

    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        if (visible && !reduced) {
          cancelAnimationFrame(raf);
          raf = requestAnimationFrame(frame);
        }
      },
      { threshold: 0 }
    );
    io.observe(canvas);

    const ro = new ResizeObserver(() => setup());
    ro.observe(canvas);

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("touchmove", onTouch, { passive: true });
    window.addEventListener("touchstart", onTouch, { passive: true });
    window.addEventListener("pointerdown", spawnRipple, { passive: true });

    if (reduced) {
      syncPointer();
      draw();
    } else {
      raf = requestAnimationFrame(frame);
    }

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("touchmove", onTouch);
      window.removeEventListener("touchstart", onTouch);
      window.removeEventListener("pointerdown", spawnRipple);
    };
  }, [mode, color, color2]);

  return <canvas ref={ref} aria-hidden className={className} />;
}
