import { Hero } from "@/components/home/Hero";
import { Marquee } from "@/components/motion/Marquee";
import { getNextChapter } from "@/lib/content";
import { ChapterDossier, Closing, FutureRealities, Intro, Rules } from "@/components/home/HomeSections";

export default function Home() {
  const next = getNextChapter();
  return (
    <>
      <Hero />
      <Intro />
      <Marquee text="Architects of Temporary Realities" direction={1} />
      <Rules />
      {next && <Marquee text={`Chapter ${next.number}: ${next.title}`} direction={-1} />}
      <ChapterDossier />
      <FutureRealities />
      <Closing />
    </>
  );
}
