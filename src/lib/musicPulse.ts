/**
 * A tiny shared "beat bus" between the music engine and the visual backgrounds.
 *
 * The music engine pushes a pulse on every quarter note (with the current
 * tempo + section intensity); the section canvases read `beatEnergy()` each
 * animation frame to make their motion breathe in time with the music, and use
 * `beatCount()` for discrete on-beat triggers. When the music is off, energy is
 * 0 and the visuals animate exactly as before.
 *
 * Deliberately framework-free module state so any component can read it cheaply
 * inside a requestAnimationFrame loop without React re-renders.
 */
let lastBeatAt = 0; // performance.now() of the last beat
let beatMs = 500; // ms between beats (derived from BPM)
let level = 0; // current section intensity (0–1) while active
let active = false;
let count = 0; // monotonic beat counter, for discrete triggers

export function pulseBeat(bpm: number, intensity: number) {
  lastBeatAt = performance.now();
  beatMs = bpm > 0 ? 60000 / bpm : 500;
  level = intensity;
  active = true;
  count++;
}

export function stopPulse() {
  active = false;
  level = 0;
}

/** 0–1 envelope that spikes on each beat and decays before the next one. */
export function beatEnergy(now: number = performance.now()): number {
  if (!active) return 0;
  const phase = Math.min(1, (now - lastBeatAt) / beatMs);
  return (1 - phase) * (1 - phase) * level; // quadratic decay
}

/** Monotonic beat counter — changes once per beat (for discrete effects). */
export function beatCount(): number {
  return count;
}

export function pulseActive(): boolean {
  return active;
}
