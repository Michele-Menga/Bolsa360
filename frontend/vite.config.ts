import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

// Em desenvolvimento o proxy evita problemas de CORS/cookies:
// o browser fala com :5173 e o Vite reencaminha /api para o backend (:3000).
export default defineConfig({
  plugins: [react()],
  resolve: { alias: { "@": path.resolve(__dirname, "src") } },
  server: {
    port: 5173,
    proxy: { "/api": { target: process.env.VITE_PROXY_TARGET ?? "http://localhost:3000", changeOrigin: false } },
  },
});
