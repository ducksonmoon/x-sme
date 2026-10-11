import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

/** Separate deliverable; never adds a design-system route to the company site. */
export default defineConfig({
  base: "./",
  publicDir: false,
  plugins: [react()],
  build: {
    outDir: "brand-kit",
    rollupOptions: { input: path.resolve("brand-guide.html") },
    assetsInlineLimit: 200000,
  },
});
