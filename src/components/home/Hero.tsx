import Image, { getImageProps } from "next/image";
import { preload } from "react-dom";
import "./hero.css";
import { site } from "@/config/site";
import heroScene from "../../../public/brand/hero-scene.webp";
import wordmark from "../../../public/brand/wordmark.webp";

const MOBILE = "(max-width: 767px)";
const DESKTOP = "(min-width: 768px)";
const mobileScene = (ext: string) => `/brand/hero-scene-mobile.${ext} 900w, /brand/hero-scene-mobile-1350.${ext} 1350w`;

/*
 * Phones get the tall scene through <picture> sources and never download the
 * desktop scene; each is preloaded with high priority for its own media only.
 * The wordmark's mobile sizes are capped at 300px so a 3x phone gets the 900px variant.
 */
export function Hero() {
  const { props: scene } = getImageProps({ src: heroScene, alt: "", sizes: "100vw", fetchPriority: "high", loading: "eager" });
  preload(scene.src, { as: "image", imageSrcSet: scene.srcSet, imageSizes: "100vw", media: DESKTOP, fetchPriority: "high" });
  preload("/brand/hero-scene-mobile.avif", {
    as: "image",
    type: "image/avif",
    imageSrcSet: mobileScene("avif"),
    imageSizes: "100vw",
    media: MOBILE,
    fetchPriority: "high",
  });
  return (
    <section
      aria-labelledby="hero-title"
      data-cue="hero"
      className="relative flex flex-col items-center overflow-x-clip pt-16 text-center md:justify-start md:pt-0 md:pb-16"
    >
      <h1 id="hero-title" className="sr-only">
        Rogue Desire
      </h1>
      <div className="rd-hero">
        <picture>
          <source media={MOBILE} type="image/avif" srcSet={mobileScene("avif")} sizes="100vw" />
          <source media={MOBILE} type="image/webp" srcSet={mobileScene("webp")} sizes="100vw" />
          {/* Art-directed <picture>; desktop props come from getImageProps. */}
          <img {...scene} alt="" className="rd-hero-scene absolute inset-0 size-full object-cover md:object-bottom" />
        </picture>
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
      {/* Phones: the copy sits on the grid floor inside the full-height hero. */}
      <div className="rd-hero-copy absolute inset-x-0 bottom-0 flex flex-col items-center pb-10 md:static md:pb-0">
        <p data-fog-cap className="relative mt-6 px-4 font-display text-3xl leading-[1.08] font-semibold text-rd-white sm:text-4xl md:mt-3">
          {site.tagline}
        </p>
        <p data-fog-cap className="relative mt-3 max-w-[34ch] text-balance px-4 text-base leading-relaxed text-rd-chrome sm:text-lg md:max-w-[70ch]">
          {site.description}
        </p>
      </div>
    </section>
  );
}
