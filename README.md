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


## Deployment

Pushing to `main` triggers [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml),
which builds and deploys to GitHub Pages.

