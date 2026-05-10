import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const news = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/news" }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    category: z
      .enum(["お知らせ", "メディア掲載", "実績", "リリース"])
      .default("お知らせ"),
    summary: z.string().optional(),
    draft: z.boolean().default(false),
  }),
});

export const collections = { news };
