import type { Metadata } from "next";
import { Hero } from "@/components/home/Hero";
import { Marquee } from "@/components/motion/Marquee";
import { instagramUrl, site } from "@/config/site";
import { getNextChapter } from "@/lib/content";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({ description: site.description, path: "/" });

/** Organization only. No legalName, address, city, or Event until confirmed (see CLAUDE.md). */
const organization = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: site.name,
  url: site.url,
  logo: `${site.url}/brand/wordmark.webp`,
  sameAs: [instagramUrl],
};
import { ChapterDossier, Closing, FutureRealities, Intro, Rules } from "@/components/home/HomeSections";

export default function Home() {
  const next = getNextChapter();
  return (
    <>
      <script
        type="application/ld+json"
        // Static, server-built JSON (no user input).
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organization) }}
      />
      <Hero />
      <Intro />
      <Marquee text="Architects of Temporary Realities" direction={1} cue="lasers" />
      <Rules />
      {next && <Marquee text={`Chapter ${next.number}: ${next.title}`} direction={-1} cue="lasers" />}
      <ChapterDossier />
      <FutureRealities />
      <Closing />
    </>
  );
}
