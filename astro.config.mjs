import { defineConfig } from 'astro/config';
import node from "@astrojs/node";
import tailwind from "@astrojs/tailwind";

import svelte from "@astrojs/svelte";

// https://astro.build/config
export default defineConfig({
  integrations: [tailwind(), svelte()],
  site: 'https://bjoernf.com',
  output: "server",
  adapter: node({
    mode: "standalone"
  }),
  server: {
    host: '127.0.0.1'
  }
});