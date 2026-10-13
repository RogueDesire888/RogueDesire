import Image from "next/image";
import "@/components/home/hero.css";
import { site } from "@/config/site";
import heroArt from "../../public/brand/hero-ascension.png";

export default function Home() {
  return (
    <section
      aria-labelledby="hero-title"
      className="relative isolate flex min-h-svh flex-col items-center justify-center overflow-hidden pb-24 pt-16 text-center"
    >
      <h1 id="hero-title" className="sr-only">
        Rogue Desire
      </h1>
      <Image
        src={heroArt}
        alt="Rogue Desire"
        priority
        sizes="100vw"
        className="rd-hero-art h-auto max-h-[85vh] w-full object-contain object-center md:object-cover md:object-[50%_45%]"
      />
      <p className="relative mt-6 px-4 text-lg font-medium tracking-wide text-rd-white sm:text-xl">
        {site.tagline}
      </p>
      <p className="relative mt-4 max-w-[34ch] text-balance px-4 text-base leading-relaxed text-rd-chrome sm:text-lg">
        {site.description}
      </p>
    </section>
  );
}
