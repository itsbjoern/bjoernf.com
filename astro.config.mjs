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
  output: "static", // In new astro there is no "hybrid" mode anymore

  build: {
    assets: "static",
    client: "client",
    server: "server",
    inlineStylesheets: "never",
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

  adapter: node({
    mode: "standalone",
  }),
});
