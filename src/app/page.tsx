import Image from "next/image";
import "@/components/home/hero.css";
import { site } from "@/config/site";
import heroScene from "../../public/brand/hero-scene.webp";
import wordmark from "../../public/brand/wordmark.webp";

export default function Home() {
  return (
    <section
      aria-labelledby="hero-title"
      className="relative isolate flex min-h-svh flex-col items-center justify-center overflow-x-clip pb-20 pt-12 text-center"
    >
      <h1 id="hero-title" className="sr-only">
        Rogue Desire
      </h1>
      <div className="relative w-full">
        <Image
          src={heroScene}
          alt=""
          priority
          sizes="100vw"
          className="rd-hero-scene h-auto max-h-[85vh] w-full object-contain object-center md:object-cover md:object-[50%_68%]"
        />
        <div className="rd-hero-reflection" aria-hidden="true">
          <div className="rd-hero-flip">
            <div className="rd-spin-stage">
              <div className="rd-spin">
                <Image src={wordmark} alt="" sizes="(min-width: 768px) 55vw, 85vw" />
              </div>
            </div>
          </div>
        </div>
        <div className="rd-hero-wordmark rd-spin-stage">
          <div className="rd-spin">
            <Image
              src={wordmark}
              alt="Rogue Desire"
              priority
              sizes="(min-width: 768px) 55vw, 85vw"
              className="rd-glow-pulse"
            />
          </div>
        </div>
      </div>
      <p className="relative mt-[24vw] px-4 text-lg font-medium tracking-wide text-rd-white sm:text-xl md:mt-[6vw]">
        {site.tagline}
      </p>
      <p className="relative mt-4 max-w-[34ch] text-balance px-4 text-base leading-relaxed text-rd-chrome sm:text-lg">
        {site.description}
      </p>
    </section>
  );
}
