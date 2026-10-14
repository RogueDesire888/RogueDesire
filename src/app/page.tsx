import { Hero } from "@/components/home/Hero";
import { ChapterDossier, Closing, FutureRealities, Intro, Rules } from "@/components/home/HomeSections";

export default function Home() {
  return (
    <>
      <Hero />
      <Intro />
      <Rules />
      <ChapterDossier />
      <FutureRealities />
      <Closing />
    </>
  );
}
