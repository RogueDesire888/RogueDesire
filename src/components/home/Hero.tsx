import Image from "next/image";
import "./hero.css";
import { site } from "@/config/site";
import heroScene from "../../../public/brand/hero-scene.webp";
import wordmark from "../../../public/brand/wordmark.webp";

/* Mobile sizes are capped at 300px so a 3x phone picks the 900px variant at most. */
export function Hero() {
  return (
    <section
      aria-labelledby="hero-title"
      data-cue="hero"
      className="relative flex min-h-svh flex-col items-center justify-center overflow-x-clip pb-16 text-center md:min-h-0 md:justify-start"
    >
      <h1 id="hero-title" className="sr-only">
        Rogue Desire
      </h1>
      <div className="rd-hero">
        <Image
          src={heroScene}
          alt=""
          preload
          fetchPriority="high"
          sizes="(min-width: 768px) 100vw, 300px"
          className="rd-hero-scene absolute bottom-0 left-0 h-auto w-full md:top-0 md:h-full md:object-cover md:object-bottom"
        />
        <div className="rd-hero-reflection" aria-hidden="true">
          <div className="rd-hero-flip">
            <div className="rd-spin-stage">
              <div className="rd-spin">
                <Image src={wordmark} alt="" loading="eager" fetchPriority="high" sizes="(min-width: 768px) 55vw, 300px" />
              </div>
            </div>
          </div>
        </div>
        <div className="rd-hero-wordmark rd-spin-stage">
          <div className="rd-spin">
            <Image
              src={wordmark}
              alt="Rogue Desire"
              preload
              fetchPriority="high"
              sizes="(min-width: 768px) 55vw, 300px"
              className="rd-glow-pulse"
            />
          </div>
        </div>
      </div>
      <p data-fog-cap className="relative mt-6 px-4 font-display text-3xl leading-[1.08] font-semibold text-rd-white sm:text-4xl md:mt-3">
        {site.tagline}
      </p>
      <p data-fog-cap className="relative mt-3 max-w-[34ch] text-balance px-4 text-base leading-relaxed text-rd-chrome sm:text-lg md:max-w-[70ch]">
        {site.description}
      </p>
    </section>
  );
}
