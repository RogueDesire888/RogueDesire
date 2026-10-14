import { Hero } from "@/components/home/Hero";
import { Closing, FutureRealities, Intro, NextChapter, Pillars } from "@/components/home/HomeSections";

export default function Home() {
  return (
    <>
      <Hero />
      <Intro />
      <Pillars />
      <NextChapter />
      <FutureRealities />
      <Closing />
    </>
  );
}
