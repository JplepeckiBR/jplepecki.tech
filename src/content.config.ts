import { defineCollection, reference, z } from 'astro:content';
import { glob } from 'astro/loaders';

// Shared image-with-alt shape. Using image() from the schema context so Astro
// processes the file through its pipeline (dimensions, optimization). Alt is
// REQUIRED everywhere an image is accepted (accessibility hard rule).
const imageWithAlt = (image: () => z.ZodType) =>
  z.object({
    src: image(),
    alt: z.string().min(1, 'alt text is required'),
  });

const projects = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/projects' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      hook: z.string(), // one-line hook
      status: z.enum(['active', 'shipped', 'paused', 'archived']),
      startDate: z.coerce.date(),
      endDate: z.coerce.date().optional(),
      tags: z.array(z.string()).default([]),
      stack: z.array(z.string()).default([]),
      // Spec table fields — all optional, guarded in the template.
      mcu: z.string().optional(),
      sensors: z.array(z.string()).optional(),
      cover: imageWithAlt(image).optional(),
      gallery: z.array(imageWithAlt(image)).optional(),
      links: z
        .object({
          repo: z.string().url().optional(),
          demo: z.string().url().optional(),
          video: z.string().url().optional(),
        })
        .partial()
        .nullish()
        .transform((v) => v ?? undefined),
      featured: z.boolean().default(false),
      order: z.number().default(0),
      draft: z.boolean().default(false),
    }),
});

const blog = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/blog' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string(),
      pubDate: z.coerce.date(),
      updatedDate: z.coerce.date().optional(),
      tags: z.array(z.string()).default([]),
      // Optional link to a project by slug; project page lists these posts.
      project: reference('projects').optional(),
      hero: imageWithAlt(image).optional(),
      draft: z.boolean().default(false),
    }),
});

const videos = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/videos' }),
  schema: z.object({
    title: z.string(),
    provider: z.enum(['youtube', 'vimeo']),
    // The provider video id (preferred) OR a full url. At least one required.
    videoId: z.string().optional(),
    url: z.string().url().optional(),
    pubDate: z.coerce.date(),
    description: z.string().optional(),
    tags: z.array(z.string()).default([]),
    project: reference('projects').optional(),
    draft: z.boolean().default(false),
  }),
});

export const collections = { projects, blog, videos };
