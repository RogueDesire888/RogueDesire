import type { Metadata } from "next";
import { site } from "@/config/site";

/**
 * Indexing guard: only the production deployment served at roguedesire.com
 * may be indexed. Every *.vercel.app URL (and local) is noindex.
 */
export const INDEXABLE_HOSTS = new Set(["roguedesire.com", "www.roguedesire.com"]);

export function isIndexable(host: string | null | undefined): boolean {
  const h = (host ?? "").toLowerCase().split(":")[0];
  return process.env.VERCEL_ENV === "production" && INDEXABLE_HOSTS.has(h);
}

/** Per-page metadata: title, a <=150 char description, canonical, OG and Twitter. */
export function pageMeta({ title, description, path }: { title?: string; description: string; path: string }): Metadata {
  if (description.length > 150) throw new Error(`Description over 150 characters for ${path}`);
  const ogTitle = title ? `${title} | ${site.name}` : site.name;
  return {
    ...(title ? { title } : {}),
    description,
    alternates: { canonical: path },
    openGraph: { title: ogTitle, description, url: path, siteName: site.name, type: "website", locale: "en_US" },
    twitter: { card: "summary_large_image", title: ogTitle, description },
  };
}
