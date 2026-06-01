import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// User page (sandipanseal.github.io) is served from the domain root,
// so the base path stays "/". If you ever move this to a *project*
// page (e.g. /portfolio), change base to "/portfolio/".
export default defineConfig({
  base: "/",
  plugins: [react()],
  build: {
    outDir: "dist",
    chunkSizeWarningLimit: 1200,
  },
});
