import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const settings = defineCollection({
  loader: glob({ pattern: '**/*.yml', base: './src/content/settings' }),
  schema: z.object({
    name: z.string().min(1, 'name is required'),
    email: z.string().email('email must be a valid email address'),
    tagline: z.string().optional().default(''),
    about: z.string().optional().default(''),
  }),
});

const workItemSchema = z.object({
  type: z.enum(['image', 'video'], {
    errorMap: () => ({ message: 'type must be "image" or "video"' }),
  }),
  src: z.string().min(1, 'src is required'),
  alt: z.string().min(1, 'alt text is required'),
  caption: z.string().optional().default(''),
});

const videoWorkSchema = workItemSchema.extend({
  type: z.literal('video'),
  poster: z.string().min(1, 'poster is required when type is "video"'),
});

const imageWorkSchema = workItemSchema.extend({
  type: z.literal('image'),
  poster: z.string().optional(),
});

const workSchema = z.discriminatedUnion('type', [
  imageWorkSchema,
  videoWorkSchema,
]);

const sectionSchema = z.object({
  title: z.string().min(1, 'section title is required'),
  works: z.array(workSchema).min(1, 'each section must have at least one work'),
});

const portfolio = defineCollection({
  loader: glob({ pattern: '**/*.yml', base: './src/content/portfolio' }),
  schema: z.object({
    sections: z
      .array(sectionSchema)
      .min(1, 'at least one section is required'),
  }),
});

export const collections = { settings, portfolio };
