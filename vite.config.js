import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// IMPORTANT: "base" must be "/<your-repo-name>/" for GitHub Pages project sites
// (e.g. https://username.github.io/civicpulse-ai/ -> base: "/civicpulse-ai/").
// If you're deploying to a user/org page (username.github.io repo itself),
// set base to "/".
export default defineConfig({
  plugins: [react()],
  base: "/CIVICPULSE/",
});
