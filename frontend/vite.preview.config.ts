import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { viteSingleFile } from "vite-plugin-singlefile";
import path from "node:path";
export default defineConfig({
  plugins: [react(), viteSingleFile()],
  resolve: { alias: { "@": path.resolve(__dirname, "src") } },
  define: { "import.meta.env.VITE_PREVIEW": JSON.stringify("1") },
  build: { outDir: "dist-preview", emptyOutDir: true, rollupOptions: { output: { inlineDynamicImports: true } } },
});
