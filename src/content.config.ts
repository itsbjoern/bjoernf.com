import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const blog = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/blog" }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      summary: z.string(),
      image: image().optional(),
      tags: z.array(z.string()),
      slugs: z.array(z.string()),
      createdAt: z.date(),
      published: z.boolean(),
    }),
});

export const collections = { blog };
