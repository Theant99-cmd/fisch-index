// Builds the offline single-file version: bunx vite build -c vite.standalone.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { viteSingleFile } from "vite-plugin-singlefile";
import path from "node:path";

export default defineConfig({
  root: path.resolve(__dirname, "src/standalone"),
  plugins: [react(), tailwindcss(), viteSingleFile()],
  resolve: { alias: { "@": path.resolve(__dirname, "src") } },
  build: { outDir: "/tmp/standalone-dist", emptyOutDir: true },
});
