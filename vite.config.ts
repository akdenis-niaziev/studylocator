import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import basicSsl from "@vitejs/plugin-basic-ssl";

export default defineConfig({
  base: "./studylocator",
  server: {
    host: true,
    port: 5173,
    https: true,
  },
  plugins: [
    basicSsl() as any,
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.svg", "robots.txt", "apple-touch-icon.png"],
      manifest: {
        name: "Study Locator - Find Silent Study Spaces",
        short_name: "Study Locator",
        description:
          "Discover peaceful locations where you can study in silence",
        theme_color: "#ffffff",
        background_color: "#ffffff",
        display: "standalone",
        scope: ".",
        start_url: ".",
        icons: [
          { src: "pwa-64x64.png", sizes: "64x64", type: "image/png" },
          { src: "pwa-192x192.png", sizes: "192x192", type: "image/png" },
          {
            src: "pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable",
          },
        ],
      },
    }),
  ],
});
