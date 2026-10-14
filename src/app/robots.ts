import type { MetadataRoute } from "next";
import { headers } from "next/headers";
import { site } from "@/config/site";
import { isIndexable } from "@/lib/seo";

/** Allow crawling only on production at roguedesire.com; disallow everywhere else. */
export default async function robots(): Promise<MetadataRoute.Robots> {
  const host = (await headers()).get("host");
  if (!isIndexable(host)) return { rules: { userAgent: "*", disallow: "/" } };
  return { rules: { userAgent: "*", allow: "/" }, sitemap: `${site.url}/sitemap.xml` };
}
