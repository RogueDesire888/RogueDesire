import { z } from "zod";

/** Unconfirmed facts are null and never render. */
const nullableText = z.string().trim().min(1).nullable();

export const accentSchema = z.enum(["violet", "silver", "green", "gold", "ice"]);

export const frequencyRole = z.enum(["threshold", "activation", "peak", "afterglow"]);

export const frequencySchema = z.object({
  name: z.string().min(1),
  /** Chapter slug this booking belongs to. */
  chapter: z.string().min(1),
  role: frequencyRole,
  bio: nullableText,
  links: z.array(z.object({ label: z.string().min(1), url: z.url() })),
  imageApproved: z.boolean(),
});

export const chapterSchema = z.object({
  code: z.string().regex(/^RD-Y\d+-CH\d{3}-[A-Z]+$/),
  number: z.string().regex(/^\d{3}$/),
  slug: z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/),
  title: z.string().min(1),
  line: z.string().min(1),
  status: z.enum(["concept", "upcoming", "past"]),
  /** Unrevealed chapters never output title, line, element, or theme. */
  revealed: z.boolean(),
  era: z.string().min(1),
  element: z.string().min(1),
  theme: z.string().min(1),
  accent: accentSchema,
  description: nullableText,
  // Operational fields: null until confirmed.
  city: nullableText,
  venue: nullableText,
  date: z.iso.date().nullable(),
  hours: nullableText,
  agePolicy: nullableText,
  capacity: z.number().int().positive().nullable(),
  ticketUrl: z.url().nullable(),
  accessibility: nullableText,
  frequencies: z.array(frequencySchema),
  /** Artifact codes belonging to this chapter. */
  artifacts: z.array(z.string()),
  // Chapter page content (revealed chapters only). Never times for the night arc.
  /** Opening paragraphs: the first is the hook. */
  opening: z.array(z.string().min(1)).optional(),
  closingLine: nullableText.optional(),
  meaning: z.array(z.string().min(1)).optional(),
  elements: z
    .array(z.object({ name: z.string().min(1), line: z.string().min(1), token: z.string().regex(/^--rd-[a-z-]+$/) }))
    .optional(),
  soundDirection: z.object({ line: z.string().min(1), genres: z.string().min(1) }).optional(),
  styleDirection: z.object({ lines: z.array(z.string().min(1)).min(1), words: z.array(z.string().min(1)) }).optional(),
  guestCodeIntro: nullableText.optional(),
  guestCode: z.array(z.string().min(1)).optional(),
  nightArc: z
    .array(z.object({ role: frequencyRole, name: z.string().min(1), mood: z.string().min(1), line: z.string().min(1) }))
    .optional(),
});

export const artifactSchema = z.object({
  code: z.string().regex(/^RD-Y\d+-CH\d{3}-[A-Z]+-[A-Z]+$/),
  name: z.string().min(1),
  subtitle: nullableText,
  /** Chapter slug. */
  chapter: z.string().min(1),
  format: z.string().min(1),
  edition: z.number().int().positive().nullable(),
  status: z.enum(["concept", "in-production", "available", "limited", "archived"]),
  line: nullableText,
  lore: nullableText,
  image: nullableText,
});

export type Accent = z.infer<typeof accentSchema>;
export type Frequency = z.infer<typeof frequencySchema>;
export type Chapter = z.infer<typeof chapterSchema>;
export type Artifact = z.infer<typeof artifactSchema>;
