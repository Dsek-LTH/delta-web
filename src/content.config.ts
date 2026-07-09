import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

const sv = defineCollection({
  loader: glob({ pattern: "*.md", base: "./src/content/sv" }),
  schema: z.object({
    title: z.string().optional(),
  }),
});

const en = defineCollection({
  loader: glob({ pattern: "*.md", base: "./src/content/en" }),
  schema: z.object({
    title: z.string().optional(),
  }),
});

export const collections = {
  sv,
  en,
};
