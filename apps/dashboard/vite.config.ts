import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";
import path from "node:path";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load env from the monorepo root
  const env = loadEnv(mode, path.resolve(process.cwd(), "../../"), "");
  
  return {
    envDir: "../../",
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
          target: env.VITE_API_TARGET || "https://atlas-1azo.onrender.com",
          changeOrigin: true,
        },
      },
    },
  };
});
