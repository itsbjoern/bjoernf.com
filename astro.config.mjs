import { defineConfig } from "astro/config";

import tailwind from "@astrojs/tailwind";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";

import react from "@astrojs/react";

import node from "@astrojs/node";

// https://astro.build/config
export default defineConfig({
  integrations: [tailwind(), mdx(), sitemap(), react()],
  site: "https://bjoernf.com",
  output: "static",

  build: {
    assets: "static",
    client: "client",
    server: "server",
  },

  vite: {
    assetsInclude: ["**/*.xml"],
    optimizeDeps: {
      exclude: ["@ffmpeg/ffmpeg", "@ffmpeg/util"],
    },
    worker: {
      format: "es",
    },
  },

  experimental: {
    csp: {
      scriptDirective: {
        resources: ["https://unpkg.com", "https://a.bjoernf.com"],
      },
      directives: [
        "connect-src 'self' https://unpkg.com https://a.bjoernf.com",
        "img-src 'self' data: blob: https://upload.wikimedia.org",
      ],
    },
  },

  adapter: node({
    mode: "standalone",
  }),
});
