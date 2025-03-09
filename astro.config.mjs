import { defineConfig } from 'astro/config';

import tailwind from "@astrojs/tailwind";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";

import react from "@astrojs/react";

// https://astro.build/config
export default defineConfig({
  integrations: [tailwind(), mdx(), sitemap(), react()],
  site: 'https://bjoernf.com',
  output: "static",
  build: {
    assets: "static",
  },
  vite: {
    "assetsInclude": ["**/*.xml"]
  }
});