# Sandipan Seal — Portfolio

A motion-driven personal portfolio for **Sandipan Seal**, AI/ML Engineer (LLM & Agentic Systems).
Apple-style dark, glassmorphism aesthetic with an animated avatar video in the hero.

🔗 Live: https://sandipanseal.github.io

## Stack

- **React 18 + TypeScript + Vite**
- **Framer Motion** — scroll reveals, page motion, custom cursor, scroll-progress bar
- **Tailwind CSS** — design system & glassmorphism
- **lucide-react** — icons

## Develop

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build to dist/
npm run preview  # preview the build
```

## Editing content

All content lives in one file — [`src/data/profile.ts`](src/data/profile.ts):
summary, skills (by domain), experience, projects, thesis, education,
certifications, awards, languages, and contact links.

## Assets in `public/`

| File | Used for |
|------|----------|
| `avatar.mp4` | Animated avatar video in the hero |
| `profile.png` | Browser tab icon (favicon) + social card image |
| `Sandipan_Seal_CV.pdf` | "Download CV" buttons |


## "Ask about Sandipan" chat assistant

A floating chat widget (bottom-right) answers visitor questions about Sandipan.
It has two brains:

- **Built-in engine** (default) — a precise, key-free retrieval engine over the
  data in [`src/data/profile.ts`](src/data/profile.ts). Answers only what's
  asked (e.g. *"which company in India"* → just that role, with dates). Works on
  GitHub Pages with no cost and no secrets. Code in [`src/lib/agent/`](src/lib/agent/).
- **Optional LLM upgrade** — free-form, grounded answers, auto-falling back to
  the built-in engine on any error. Two ways to enable it (see
  [`.env.local.example`](.env.local.example)):
  - **Local dev:** a free `VITE_HF_TOKEN` (Hugging Face). ⚠️ Don't ship this on
    the public site — a `VITE_` token is baked into the client bundle. (For the
    same reason, GitHub Actions secrets can't hide it: build-time secrets end up
    in the static bundle too.)
  - **Production (secure):** deploy the tiny proxy in
    [`proxy/cloudflare-worker.js`](proxy/cloudflare-worker.js) (free tier), which
    holds the key server-side, and point `VITE_AGENT_PROXY_URL` at it. No key
    ever reaches the browser; the site can stay on GitHub Pages.

Chat state is in-memory only: it resets on refresh and is never shared between visitors.

## Deployment

Pushing to `main` triggers [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml),
which builds and deploys to GitHub Pages.

