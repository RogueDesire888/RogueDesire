"use client";

import { useRef } from "react";
import { Wordmark } from "@/components/brand/Wordmark";
import { gsap, useMotion } from "@/lib/motion";
import "./book.css";

const CONTENTS = ["The Chapters", "The Frequencies", "The Witnesses", "The Artifacts", "Behind The Realities"];
const NUMERALS = ["I", "II", "III", "IV", "V"];

/**
 * The Year One book. Desktop: pinned ~150vh, the cover scrubs open
 * (rotateY 0 to -160deg around the left edge). Mobile: opens once at 50% in
 * view. Reduced motion / no JS: shown open and static.
 */
export function YearbookBook() {
  const ref = useRef<HTMLDivElement>(null);
  useMotion(ref, ({ el, desktop }) => {
    const cover = el.querySelector("[data-cover]");
    const shade = el.querySelector("[data-shade]");
    gsap.set(cover, { rotateY: 0 });
    gsap.set(shade, { opacity: 1 });
    const tl = gsap.timeline({
      defaults: { ease: desktop ? "none" : "power2.inOut" },
      scrollTrigger: desktop
        ? { trigger: el, start: "top top", end: "+=150%", pin: true, scrub: 0.6, anticipatePin: 1 }
        : { trigger: el, start: "top 50%", once: true },
    });
    tl.to(cover, { rotateY: -160, duration: 1 }).to(shade, { opacity: 0, duration: 0.7 }, 0.3);
    if (!desktop) tl.duration(1.8);
  });

  return (
    <div ref={ref} className="flex min-h-[80svh] items-center justify-center py-16 md:min-h-svh">
      {/* Width of the open spread; the closed book sits in its right half. */}
      <div className="flex w-[min(88vw,760px)] justify-end [perspective:1800px]">
        <div className="relative aspect-[3/4] w-1/2">
          {/* Inside page */}
          <div className="absolute inset-0 border border-rd-chrome/20 bg-[#0d0d12] px-[8%] py-[10%]">
            <ol className="flex h-full flex-col justify-center gap-[6%]">
              {CONTENTS.map((title, i) => (
                <li key={title} className="flex items-baseline gap-3">
                  <span className="w-7 shrink-0 text-xs text-rd-chrome md:text-sm">{NUMERALS[i]}</span>
                  <span className="font-display text-[clamp(0.95rem,2.6vw,1.75rem)] leading-[1.15] font-semibold text-rd-white">
                    {title}
                  </span>
                </li>
              ))}
            </ol>
            <div
              data-shade
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgb(0_0_0/0.85),rgb(0_0_0/0.35))] opacity-0"
            />
          </div>
          {/* Cover */}
          <div data-cover className="rd-book-cover absolute inset-0 shadow-[0_30px_60px_-20px_rgb(0_0_0/0.8)]">
            <div className="rd-book-face rd-book-texture absolute inset-0 flex flex-col items-center justify-between border border-rd-chrome/25 px-[10%] py-[12%]">
              <div aria-hidden="true" className="pointer-events-none absolute inset-[5%] border border-rd-chrome/35" />
              <div className="w-16 md:w-20">
                <Wordmark size="sm" />
              </div>
              <div className="text-center">
                <p className="font-display text-[clamp(1.6rem,5vw,3.25rem)] leading-[1.08] font-semibold text-rd-white">Year One</p>
                <p className="rd-text-glow mt-1 font-display text-[clamp(1.2rem,3.6vw,2.25rem)] leading-[1.08] font-semibold text-rd-white">
                  Awakening
                </p>
              </div>
              <span aria-hidden="true" className="h-px w-1/3 bg-rd-chrome/40" />
            </div>
            <div aria-hidden="true" className="rd-book-face rd-book-back rd-book-texture absolute inset-0 border border-rd-chrome/15" />
          </div>
        </div>
      </div>
    </div>
  );
}
