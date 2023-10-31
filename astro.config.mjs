import { defineConfig } from 'astro/config';
import node from "@astrojs/node";

import tailwind from "@astrojs/tailwind";


// https://astro.build/config
export default defineConfig({
  integrations: [tailwind()],
  site: 'https://xn--bjrnf-kua.com',
  output: "server",
  adapter: node({
    mode: "standalone"
  }),
});
