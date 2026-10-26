import { defineCollection, type ImageFunction } from 'astro:content';
import { glob, file } from 'astro/loaders';
import { z } from 'astro/zod';

const themePreset = z.enum(['paper', 'sage', 'terracotta', 'ink', 'stone', 'clay']);

const makeTheme = (image: ImageFunction) =>
  z.object({
    preset: themePreset.optional(),
    background: z
      .object({
        color: z
          .string()
          .regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, 'Цвет в формате #RRGGBB')
          .optional(),
        image: image().optional(),
      })
      .optional(),
    overlay: z.number().min(0).max(90).default(0),
    text: z.enum(['auto', 'light', 'dark']).default('auto'),
    accent: z
      .string()
      .regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, 'Цвет в формате #RRGGBB')
      .optional(),
    decor: z
      .object({
        image: image().optional(),
        position: z
          .enum(['top-left', 'top-right', 'bottom-left', 'bottom-right'])
          .default('bottom-right'),
        size: z.number().min(6).max(70).default(28),
        opacity: z.number().min(5).max(100).default(30),
      })
      .optional(),
  });

const details = z
  .object({
    object: z.string().optional(),
    city: z.string().optional(),
    materials: z.string().optional(),
    dimensions: z.string().optional(),
    client: z.string().optional(),
    status: z.enum(['completed', 'in-progress']).optional(),
    credit: z.string().optional(),
  })
  .optional();

const sections = defineCollection({
  loader: glob({
    pattern: '**/index.md',
    base: './src/content/sections',
    generateId: ({ entry }) => entry.split('/')[0] ?? entry,
  }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      lead: z.string(),
      order: z.number().default(0),
      cover: image().optional(),
      coverAlt: z.string().optional(),
      coverPosition: z.enum(['center', 'top', 'bottom']).default('center'),
      theme: makeTheme(image).optional(),

      seoDescription: z.string().optional(),
    }),
});

const projects = defineCollection({
  loader: glob({
    pattern: '**/index.md',
    base: './src/content/projects',
    generateId: ({ entry }) => entry.split('/')[0] ?? entry,
  }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      section: z.enum(['drawing', 'illustration', 'restoration']),
      summary: z.string(),
      year: z.string().optional(),
      featured: z.boolean().default(false),
      order: z.number().default(0),
      draft: z.boolean().default(false),

      cover: image().optional(),
      coverAlt: z.string().optional(),
      coverPosition: z.enum(['center', 'top', 'bottom']).default('center'),

      gallery: z
        .array(
          z.object({
            image: image(),
            alt: z.string(),
            caption: z.string().optional(),
          }),
        )
        .default([]),

      files: z
        .array(
          z.object({
            title: z.string(),
            file: z.string().optional(),
            externalUrl: z.string().optional(),
            note: z.string().optional(),
          }),
        )
        .default([]),

      details,
      tags: z.array(z.string()).default([]),

      beforeAfter: z
        .object({
          before: image(),
          after: image(),
          caption: z.string().optional(),
        })
        .optional(),

      theme: makeTheme(image).optional(),
      seoDescription: z.string().optional(),
    }),
});

const pages = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/pages' }),
  schema: z.object({
    title: z.string(),
    lead: z.string(),
    intro: z.string().optional(),
    portrait: z.string().optional(),
    experience: z
      .array(
        z.object({
          period: z.string(),
          role: z.string(),
          place: z.string().optional(),
          description: z.string().optional(),
        }),
      )
      .default([]),
    education: z
      .array(
        z.object({
          period: z.string(),
          title: z.string(),
          place: z.string().optional(),
        }),
      )
      .default([]),
    services: z
      .array(
        z.object({
          title: z.string(),
          description: z.string().optional(),
        }),
      )
      .default([]),
    exhibitions: z
      .array(
        z.object({
          year: z.string(),
          title: z.string(),
          place: z.string().optional(),
        }),
      )
      .default([]),
    seoDescription: z.string().optional(),
  }),
});

const settings = defineCollection({
  loader: file('./src/content/settings/site.yaml'),
  schema: z.object({
    name: z.string(),
    alias: z.string(),
    role: z.string(),
    city: z.string().optional(),
    email: z.string().optional(),
    telegram: z.string().optional(),
    instagram: z.string().optional(),
    behance: z.string().optional(),
    vk: z.string().optional(),
    available: z.boolean().default(true),
    availabilityNote: z.string().optional(),
    homeTitle: z.string(),
    homeLead: z.string(),
    homeIntro: z.string().optional(),
    portrait: z.string().optional(),
    portraitAlt: z.string().optional(),
    footerNote: z.string().optional(),
    seoDescription: z.string(),
    ogImage: z.string().optional(),
  }),
});

export const collections = { sections, projects, pages, settings };
