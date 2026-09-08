import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";
import path from "node:path";

// https://vite.dev/config/
export default defineConfig(() => {
  return {
    plugins: [TanStackRouterVite(), react()],
    resolve: {
      alias: {
        "@": path.resolve(import.meta.dirname, "./src"),
      },
    },
    server: {
      port: 5173,
      proxy: {
        "/api": {
          target: "https://atlas-1azo.onrender.com",
          changeOrigin: true,
          cookieDomainRewrite: "localhost",
          secure: false,
        },
      },
    },
  };
});
