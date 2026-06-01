/**
 * Generative, section-reactive music — synthesised entirely in the browser
 * (Web Audio API). No audio files, no licensing, tiny payload.
 *
 * It runs a 16-step sequencer (kick / hi-hat / bass / arpeggio voices) using
 * the standard look-ahead scheduling pattern. Each page section has its own
 * THEME — tempo (BPM), musical root, and rhythm patterns — so as the visitor
 * scrolls, calling `setSection()` morphs the beat and melody to match the mood
 * of that section. An optional `onBeat` callback fires on each quarter note so
 * the UI can pulse in time with the music.
 *
 * All notes use a minor-pentatonic scale, which stays consonant no matter how
 * the patterns combine.
 */

export type Section =
  | "hero"
  | "about"
  | "skills"
  | "experience"
  | "projects"
  | "education"
  | "contact";

type Theme = {
  bpm: number;
  /** Root frequency (Hz) for the arp register; bass plays an octave below. */
  root: number;
  /** 16-step on/off patterns. */
  kick: number[];
  hat: number[];
  bass: number[];
  /** 16-step arpeggio as scale-degree indices (-1 = rest). */
  arp: number[];
  /** Overall loudness for the section (0–1). */
  intensity: number;
};

// Minor pentatonic (+ octave) — semitone offsets from the root.
const SCALE = [0, 3, 5, 7, 10, 12];

// Reusable rhythm fragments (16 steps = one bar of 16th notes).
const K_FOUR = [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0];
const K_DRIVE = [1, 0, 0, 0, 1, 0, 0, 1, 1, 0, 0, 0, 1, 0, 1, 0];
const K_SOFT = [1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0];
const H_OFF = [0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0];
const H_16 = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1];
const H_8 = [0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0];
const B_BASIC = [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0];
const B_SYNC = [1, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 0, 1, 0];

const ARP_LIVELY = [0, -1, 2, -1, 4, -1, 2, 3, 0, -1, 2, -1, 4, 3, 2, -1];
const ARP_CALM = [0, -1, -1, -1, 2, -1, -1, -1, 4, -1, -1, -1, 2, -1, -1, -1];
const ARP_BUSY = [0, 2, 4, 5, 4, 2, 0, 2, 4, 5, 4, 2, 0, 2, 4, 5];
const ARP_MID = [0, -1, 2, -1, 4, -1, 5, -1, 4, -1, 2, -1, 0, -1, 2, -1];
const ARP_WARM = [0, -1, -1, 2, -1, -1, 4, -1, -1, 2, -1, -1, 0, -1, -1, -1];

const THEMES: Record<Section, Theme> = {
  // Energetic, welcoming.
  hero: { bpm: 112, root: 220.0, kick: K_DRIVE, hat: H_OFF, bass: B_BASIC, arp: ARP_LIVELY, intensity: 0.8 },
  // Calm, reflective.
  about: { bpm: 86, root: 196.0, kick: K_SOFT, hat: H_8, bass: B_BASIC, arp: ARP_CALM, intensity: 0.55 },
  // Bright and busy.
  skills: { bpm: 126, root: 246.94, kick: K_FOUR, hat: H_16, bass: B_SYNC, arp: ARP_BUSY, intensity: 0.85 },
  // Steady, grounded.
  experience: { bpm: 104, root: 174.61, kick: K_FOUR, hat: H_OFF, bass: B_BASIC, arp: ARP_MID, intensity: 0.7 },
  // The drop — most driving.
  projects: { bpm: 130, root: 261.63, kick: K_DRIVE, hat: H_16, bass: B_SYNC, arp: ARP_BUSY, intensity: 0.95 },
  // Mellow.
  education: { bpm: 92, root: 164.81, kick: K_SOFT, hat: H_8, bass: B_BASIC, arp: ARP_MID, intensity: 0.6 },
  // Warm, resolving.
  contact: { bpm: 78, root: 146.83, kick: K_SOFT, hat: H_OFF, bass: B_BASIC, arp: ARP_WARM, intensity: 0.55 },
};

export type MusicEngine = {
  start: () => Promise<boolean>;
  stop: () => void;
  setSection: (s: Section) => void;
  dispose: () => void;
};

const BASE_GAIN = 0.5; // global ceiling — this is background music

export function createMusicEngine(opts: { onBeat?: () => void } = {}): MusicEngine {
  const Ctor =
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) {
    return { start: async () => false, stop: () => {}, setSection: () => {}, dispose: () => {} };
  }

  let ctx: AudioContext | null = null;
  let master: GainNode | null = null;
  let noise: AudioBuffer | null = null;
  let timer: ReturnType<typeof setInterval> | null = null;

  let theme: Theme = THEMES.hero;
  let section: Section = "hero";
  let playing = false;
  let step = 0;
  let nextStepTime = 0;

  const LOOKAHEAD = 0.1; // seconds scheduled ahead
  const TICK = 25; // scheduler poll (ms)
  const secondsPerStep = () => 60 / theme.bpm / 4; // 16th note

  function build() {
    ctx = new Ctor();
    master = ctx.createGain();
    master.gain.value = 0;
    master.connect(ctx.destination);

    // Pre-render a short white-noise buffer for the hi-hat.
    const len = Math.floor(ctx.sampleRate * 0.2);
    noise = ctx.createBuffer(1, len, ctx.sampleRate);
    const data = noise.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
  }

  const noteFreq = (base: number, semis: number) => base * Math.pow(2, semis / 12);

  function kick(time: number) {
    const o = ctx!.createOscillator();
    const g = ctx!.createGain();
    o.frequency.setValueAtTime(160, time);
    o.frequency.exponentialRampToValueAtTime(50, time + 0.12);
    g.gain.setValueAtTime(0.9, time);
    g.gain.exponentialRampToValueAtTime(0.001, time + 0.18);
    o.connect(g);
    g.connect(master!);
    o.start(time);
    o.stop(time + 0.2);
  }

  function hat(time: number) {
    const src = ctx!.createBufferSource();
    src.buffer = noise;
    const hp = ctx!.createBiquadFilter();
    hp.type = "highpass";
    hp.frequency.value = 7000;
    const g = ctx!.createGain();
    g.gain.setValueAtTime(0.16, time);
    g.gain.exponentialRampToValueAtTime(0.001, time + 0.05);
    src.connect(hp);
    hp.connect(g);
    g.connect(master!);
    src.start(time);
    src.stop(time + 0.06);
  }

  function bass(time: number, freq: number) {
    const o = ctx!.createOscillator();
    const lp = ctx!.createBiquadFilter();
    const g = ctx!.createGain();
    o.type = "sawtooth";
    o.frequency.value = freq;
    lp.type = "lowpass";
    lp.frequency.value = 420;
    g.gain.setValueAtTime(0.0, time);
    g.gain.linearRampToValueAtTime(0.32, time + 0.02);
    g.gain.exponentialRampToValueAtTime(0.001, time + 0.22);
    o.connect(lp);
    lp.connect(g);
    g.connect(master!);
    o.start(time);
    o.stop(time + 0.26);
  }

  function arp(time: number, freq: number) {
    const o = ctx!.createOscillator();
    const lp = ctx!.createBiquadFilter();
    const g = ctx!.createGain();
    o.type = "triangle";
    o.frequency.value = freq;
    lp.type = "lowpass";
    lp.frequency.value = 1800;
    g.gain.setValueAtTime(0.0, time);
    g.gain.linearRampToValueAtTime(0.14, time + 0.01);
    g.gain.exponentialRampToValueAtTime(0.001, time + 0.18);
    o.connect(lp);
    lp.connect(g);
    g.connect(master!);
    o.start(time);
    o.stop(time + 0.2);
  }

  function scheduleStep(s: number, time: number) {
    const t = theme;
    if (t.kick[s]) kick(time);
    if (t.hat[s]) hat(time);
    if (t.bass[s]) bass(time, t.root / 2);
    const deg = t.arp[s];
    if (deg >= 0) arp(time, noteFreq(t.root, SCALE[deg % SCALE.length]) * 2);

    // Quarter-note pulse for the UI, fired at the moment it actually sounds.
    if (s % 4 === 0 && opts.onBeat) {
      const delay = Math.max(0, (time - ctx!.currentTime) * 1000);
      setTimeout(() => opts.onBeat?.(), delay);
    }
  }

  function scheduler() {
    if (!ctx) return;
    while (nextStepTime < ctx.currentTime + LOOKAHEAD) {
      scheduleStep(step, nextStepTime);
      nextStepTime += secondsPerStep();
      step = (step + 1) % 16;
    }
  }

  function fadeMaster(target: number, seconds: number) {
    if (!ctx || !master) return;
    const now = ctx.currentTime;
    master.gain.cancelScheduledValues(now);
    master.gain.setValueAtTime(master.gain.value, now);
    master.gain.linearRampToValueAtTime(target, now + seconds);
  }

  async function start(): Promise<boolean> {
    if (!ctx) build();
    if (ctx!.state !== "running") {
      try {
        await ctx!.resume();
      } catch {
        /* blocked until a user gesture */
      }
    }
    playing = true;
    if (!timer) {
      nextStepTime = ctx!.currentTime + 0.05;
      timer = setInterval(scheduler, TICK);
    }
    fadeMaster(BASE_GAIN * theme.intensity, 1.5);
    return ctx!.state === "running";
  }

  function stop() {
    playing = false;
    fadeMaster(0, 1.0);
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
    // Suspend after the fade to free the CPU.
    setTimeout(() => {
      if (!playing) ctx?.suspend().catch(() => {});
    }, 1200);
  }

  function setSection(s: Section) {
    if (s === section) return;
    section = s;
    theme = THEMES[s];
    if (playing) fadeMaster(BASE_GAIN * theme.intensity, 1.5);
  }

  function dispose() {
    if (timer) clearInterval(timer);
    timer = null;
    playing = false;
    ctx?.close().catch(() => {});
    ctx = null;
    master = null;
    noise = null;
  }

  return { start, stop, setSection, dispose };
}
