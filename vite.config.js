import { readFileSync } from "node:fs";
import { fileURLToPath, URL } from "node:url";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { nitro } from "nitro/vite"; // Import Nitro

const NOT_PREBUNDLED = new Set([
  "react", "react-dom",
  "@tanstack/react-start", "@tanstack/react-router", "@tanstack/react-router-ssr-query",
  "tailwindcss-animate",
  "better-sqlite3", "express", "multer", "jsonwebtoken", "bcryptjs", "cookie-parser",
]);
const { dependencies } = JSON.parse(readFileSync(new URL("./package.json", import.meta.url), "utf8"));
const PREBUNDLE = Object.keys(dependencies).filter((n) => !NOT_PREBUNDLED.has(n));

const BROWSER_PREBUNDLE = [
  "@tanstack/react-router", "@tanstack/react-router/ssr/client", "@tanstack/router-core", "@tanstack/router-core/isServer",
  "@tanstack/router-core/ssr/client",
  "@tanstack/router-core/scroll-restoration-script", "@tanstack/history", "@tanstack/start-fn-stubs",
  "seroval", "seroval-plugins/web", "cookie-es",
];

export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  optimizeDeps: { include: [...PREBUNDLE, ...BROWSER_PREBUNDLE] },
  environments: { ssr: { optimizeDeps: { include: PREBUNDLE } } },
  server: {
    proxy: {
      "/api": "http://localhost:3001",
      "/uploads": "http://localhost:3001",
    },
  },
  plugins: [
        nitro({
      preset: "render-com",
      // 🔑 Tell the production frontend server to proxy API requests to the Express backend
      routeRules: {
        '/api/**': { proxy: 'http://127.0.0.1:3001/api/**' },
        '/uploads/**': { proxy: 'http://127.0.0.1:3001/uploads/**' },
      }
    }),
    tanstackStart({ srcDirectory: "src" }),
    react(),
  ],
  ssr: { external: ["better-sqlite3", "express", "bcryptjs", "jsonwebtoken", "multer", "cookie-parser"] },
});