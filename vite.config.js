

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(),tailwindcss()],
  server: {
    proxy: {
      "/api": {
        target: "https://695bbe411d8041d5eeb8390d.mockapi.io",
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
});
