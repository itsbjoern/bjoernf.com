import { defineConfig } from 'astro/config';
import node from "@astrojs/node";

import tailwind from "@astrojs/tailwind";

const port = process.env.ASTRO_PORT || 4321;

// https://astro.build/config
export default defineConfig({
  integrations: [tailwind()],
  output: "server",
  adapter: node({
    mode: "standalone"
  }),
  server: {
    port: parseInt(port, 10)
  }
});
