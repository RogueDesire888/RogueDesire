import { z } from "zod";

/** Frontmatter for content/transmissions/*.mdx. */
export const transmissionSchema = z.object({
  title: z.string().min(1),
  slug: z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/),
  // YAML may read 000 as a number: normalize to a 3-digit string.
  number: z.union([z.string(), z.number()]).transform((n) => String(n).padStart(3, "0")),
  type: z.string().min(1),
  // YAML may read dates as Date objects: normalize to YYYY-MM-DD.
  date: z.union([z.string(), z.date()]).transform((d) => (d instanceof Date ? d.toISOString().slice(0, 10) : d)),
  excerpt: z.string().min(1),
  chapter: z.string().min(1).nullable(),
  published: z.boolean(),
});

export type TransmissionMeta = z.infer<typeof transmissionSchema>;
