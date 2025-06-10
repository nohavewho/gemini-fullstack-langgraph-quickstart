import path from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import tailwindcss from "@tailwindcss/vite";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: "/",
  resolve: {
    alias: {
      "@": path.resolve(new URL(".", import.meta.url).pathname, "./src"),
    },
  },
  server: {
    port: 3000,
    host: true,
    hmr: {
      port: 3000,
    },
    proxy: {
      // Proxy API requests to mock server in development
      "/api": {
        target: "http://localhost:3001",
        changeOrigin: true,
      },
    },
  },
});
