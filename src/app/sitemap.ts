import type { MetadataRoute } from "next";
import { routes } from "@/config/nav";
import { site } from "@/config/site";
import { getTransmissions } from "@/lib/transmissions";

/** All live routes (from nav.ts, including unlisted ones) plus every transmission. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const pages = routes.filter((r) => r.live).map((r) => ({ url: `${site.url}${r.href === "/" ? "" : r.href}` }));
  const transmissions = (await getTransmissions()).map((t) => ({
    url: `${site.url}/transmissions/${t.slug}`,
    lastModified: t.date,
  }));
  return [...pages, ...transmissions];
}
