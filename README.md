# Sandipan Seal — Portfolio

A motion-driven personal portfolio for **Sandipan Seal**, AI/ML Engineer (LLM & Agentic Systems).
Apple-style dark, glassmorphism aesthetic with an animated hero avatar, per-section
interactive backgrounds, an "Ask about Sandipan" AI chat assistant, and generative,
section-reactive background music — all running client-side on a static GitHub Pages deploy.

🔗 Live: https://sandipanseal.github.io

---

## Tech stack

| Layer | Choice |
|-------|--------|
| Framework | **React 18 + TypeScript** |
| Build tool | **Vite 5** |
| Styling | **Tailwind CSS 3** — design system + glassmorphism utilities |
| Animation | **Framer Motion 11** — scroll reveals, page motion, custom cursor, scroll-progress, 3D tilt, the chat widget & music button |
| Graphics | **HTML5 Canvas 2D** — per-section interactive backgrounds (hand-written, no library) |
| Audio | **Web Audio API** — fully synthesised generative music (no audio files) |
| Icons | **lucide-react** |
| AI  | **Hugging Face Inference** via a Cloudflare Worker proxy |
| Hosting / CI | **GitHub Pages** + **GitHub Actions** |

Zero runtime backend. Everything ships as static files; the only optional server-side
piece is a tiny LLM proxy (see [AI chat assistant](#ai-chat-assistant)).

---

## Features

### Portfolio
- **Animated hero** — looping avatar video keyed onto a black card, aurora + grid background, interactive particle field.
- **Sections** — About, Skills (by domain), Experience, Projects (+ publications), Education, Certifications, Awards, Languages, Contact.
- **Per-section interactive backgrounds** — each section has its own colour theme and a distinct cursor/touch-reactive Canvas animation: dot-grid lattice, flow field, rippling waves, tech-grid, warp starfield, pointer ripples.
- **Motion polish** — scroll-reveal, custom cursor, scroll-progress bar, 3D tilt cards, parallax orbs. Fully honours `prefers-reduced-motion`.

### AI chat assistant — "Ask about Sandipan"
- Floating animated **bot toggle** (bottom-right) that waves/blinks and cycles greeting bubbles; opens a **3D glass chat window**.
- Answers questions about Sandipan — work, projects, skills, education, certifications, **family** (by name + relationship), hobbies, and more.
- **Precise by design**: a specific question gets a specific answer (e.g. *"which company in India?"* → just that role with dates; *"his LLM skills"* → just that domain), while a general question lists everything.
- **Clickable links** in answers (e.g. family members' profiles), a typing indicator, suggestion chips, and per-browser in-memory history (resets on refresh, never shared between visitors).

### Background music — generative & section-reactive
- A **floating music toggle** (bottom-left) plays soft, generative music synthesised in the browser — **no audio files, no licensing**.
- The track **changes tempo, beat, and melody per section** as you scroll (calm in Contact, driving in Projects, etc.).
- The **section backgrounds pulse in time with the beat** — a shared "beat bus" drives Canvas animations from the music's actual scheduled beats.
- **Plays by default** (until turned off), remembers the choice for the tab session, and starts on the visitor's first interaction (browser autoplay policy).

---

## Architecture / system design

Three independent client-side systems, glued by small framework-free modules:

```
                          ┌─────────────────────────────────────────┐
                          │  src/data/profile.ts  (single source     │
                          │  of truth: bio, skills, jobs, projects,  │
                          │  education, certs, family, hobbies, …)   │
                          └───────────────┬─────────────────────────┘
                                          │
          ┌───────────────────────────────┼───────────────────────────────┐
          ▼                                ▼                               ▼
 ┌──────────────────┐          ┌──────────────────────────┐     ┌────────────────────┐
 │  UI sections     │          │  AI chat agent           │     │  (content rendered  │
 │  (components/)    │          │  (lib/agent/)            │     │   into sections)    │
 │  + SectionFX/     │          │  knowledgeBase ─┐        │     └────────────────────┘
 │    SectionCanvas  │          │  localEngine    ├─ askAgent() ─► LLM (proxy/HF) ┐
 └─────────┬────────┘          │  index.ts ──────┘                fallback ↺ local│
           │                    └──────────────────────────┘                       │
           │ reads each frame                                                       │
           ▼                                                                        │
 ┌──────────────────┐   beats   ┌──────────────────────────┐                        │
 │  musicPulse.ts   │ ◄──────── │  musicEngine.ts          │                        │
 │  (beat bus)      │           │  (Web Audio sequencer,   │                        │
 └──────────────────┘           │   section themes)        │                        │
           ▲                     └────────────┬─────────────┘                        │
           │ beatEnergy()                     │ setSection() on scroll               │
           └──────────────── MusicToggle ◄────┘ (IntersectionObserver) ──────────────┘
```

### 1. Content
[`src/data/profile.ts`](src/data/profile.ts) is the **single source of truth** — bio, skills
(by domain), experience, projects, thesis, publications, education, certifications, awards,
languages, contact, and personal/family details. Every section component and the chat agent's
knowledge base derive from it, so editing this one file updates the whole site **and** the
assistant's brain.

### 2. AI chat agent — [`src/lib/agent/`](src/lib/agent/)
A retrieval engine with an optional LLM upgrade and graceful fallback:

- **`knowledgeBase.ts`** — builds discrete Q&A entries *and* a compact "grounding context"
  fact sheet from `profile.ts`. Entries are keyword/phrase-scored; specific entries
  (a company, a degree, a country, a skill domain, a person by name) out-score generic ones
  so answers stay precise.
- **`localEngine.ts`** — normalises/stems the question, scores it against the knowledge base,
  handles small talk, and returns the best answer (or a friendly fallback). Pure client-side,
  **no key, no network**.
- **`index.ts`** — `askAgent()`. Runs the local engine always (guaranteed answer + suggestions),
  and if an LLM is configured, upgrades to a free-form **grounded** reply — silently falling
  back to the local answer on any error, timeout, or empty response.

**LLM options** (see [`.env.local.example`](.env.local.example)):
- **Local dev:** `VITE_HF_TOKEN` (free Hugging Face token). ⚠️ A `VITE_` value is baked into the
  public bundle — fine locally, **not** for the deployed site. (GitHub Actions secrets can't hide
  it either: build-time secrets still end up in the static bundle.)
- **Production (secure):** deploy [`proxy/cloudflare-worker.js`](proxy/cloudflare-worker.js)
  (free tier). It holds the API key **server-side**; the browser calls the Worker with no key.
  Point the site at it via the `VITE_AGENT_PROXY_URL` build variable. Both paths speak the
  OpenAI chat-completions shape, so the client code is identical — only the URL/auth differ.

Chat history is in-memory only — it resets on refresh and is never shared between visitors
(there is no backend and nothing is stored).

### 3. Generative music + beat-synced visuals
- **`src/lib/musicEngine.ts`** — a Web Audio **16-step sequencer** (kick / hi-hat / bass /
  arpeggio voices, minor-pentatonic). Each section has a **theme** (BPM, root note, drum/bass/
  melody patterns, intensity). Uses the standard look-ahead scheduler; fades in/out and suspends
  the audio context when stopped.
- **`src/components/ui/MusicToggle.tsx`** — the bottom-left button. Manages play/stop, session
  persistence, autoplay-policy handling (start on first gesture), and an `IntersectionObserver`
  that calls `engine.setSection()` so the music morphs to whatever section is in view.
- **`src/lib/musicPulse.ts`** — a tiny framework-free **beat bus**. The engine pushes a pulse on
  every quarter note *at the scheduled audio time*; [`SectionCanvas`](src/components/ui/SectionCanvas.tsx)
  reads `beatEnergy()` each animation frame to make its motion surge in time with the music
  (and `beatCount()` for discrete on-beat hits, e.g. ripple spawns). When music is off, energy is
  0 and the backgrounds animate exactly as before.

---

## Project structure

```
src/
  data/profile.ts            # single source of truth for all content
  components/
    sections/                # Hero, About, Skills, Experience, Projects, Education, Contact, Footer, Navbar
    chat/ChatWidget.tsx      # "Ask about Sandipan" toggle + 3D chat window
    ui/                      # CustomCursor, ScrollProgress, Reveal, TiltCard, ParticleField,
                             #   SectionFX, SectionCanvas (per-section bg), MusicToggle, …
  lib/
    agent/                   # knowledgeBase.ts, localEngine.ts, index.ts (the chat brain)
    musicEngine.ts           # generative Web Audio sequencer + per-section themes
    musicPulse.ts            # beat bus shared by engine ↔ canvases
  App.tsx                    # composes sections + ChatWidget + MusicToggle
  index.css                  # Tailwind layers + design-system helpers
proxy/
  cloudflare-worker.js       # optional secure LLM proxy (holds the API key server-side)
.github/workflows/deploy.yml # build + deploy to GitHub Pages
```

---

## Develop

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # type-check (tsc -b) + production build to dist/
npm run preview  # preview the production build (use this to test music/autoplay)
```

> Tip: test the music/audio with `npm run preview`, not `npm run dev` — React StrictMode
> double-mounts components in dev, which muddies Web Audio behaviour.

## Editing content

Edit [`src/data/profile.ts`](src/data/profile.ts) — every section **and** the chat assistant
update automatically.

## Assets in `public/`

| File | Used for |
|------|----------|
| `avatar-dark.mp4` | Animated avatar video in the hero |
| `profile.png` | Browser tab icon (favicon) + social card image |
| `Sandipan_Seal_CV.pdf` | "Download CV" buttons |

(Background music is fully synthesised — there is no audio file to add.)

---

## Enabling the LLM in production (optional)

1. Create a free **Read** token at https://huggingface.co/settings/tokens.
2. Deploy the proxy (free Cloudflare Workers tier) — see the header of
   [`proxy/cloudflare-worker.js`](proxy/cloudflare-worker.js):
   ```bash
   npm i -g wrangler && wrangler login
   cd proxy && wrangler deploy cloudflare-worker.js --name sandipan-agent
   wrangler secret put LLM_API_KEY        # paste the hf_… token
   ```
3. In the GitHub repo → **Settings → Secrets and variables → Actions → Variables**, add
   `VITE_AGENT_PROXY_URL` = your Worker URL.
4. Push to `main`. The chat now uses Hugging Face, with the built-in engine as automatic fallback.

If unset, the site ships with the safe, key-free built-in engine.

## Deployment

Pushing to `main` triggers [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml),
which builds and deploys to GitHub Pages. The build reads the optional
`VITE_AGENT_PROXY_URL` / `VITE_HF_MODEL` repository variables.
