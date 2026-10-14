"use client";

import { useRef } from "react";
import { display } from "@/components/ui/styles";
import { gsap, toRgba, useMotion } from "@/lib/motion";
import { Words } from "./text";

/**
 * Desktop: pinned and scrubbed over `distance` of the viewport.
 * Mobile: no pin; the same timeline plays once when the block comes into view.
 */
function pinnedTimeline(
  el: HTMLElement,
  desktop: boolean,
  distance: string,
  onUpdate?: (progress: number, direction: number) => void,
) {
  return gsap.timeline({
    defaults: { ease: desktop ? "none" : "power2.out" },
    scrollTrigger: desktop
      ? {
          trigger: el,
          start: "top top",
          end: `+=${distance}`,
          pin: true,
          scrub: 0.6,
          anticipatePin: 1,
          onUpdate: onUpdate ? (self) => onUpdate(self.progress, self.direction) : undefined,
        }
      : { trigger: el, start: "top 70%", once: true },
  });
}

const stage = "flex flex-col justify-center md:min-h-svh";

/** Line A dims (to 35%) and blurs while line B builds word by word with accent glow. Pins ~150vh. */
export function PinnedSwap({
  lineA,
  lineB,
  onProgress,
}: {
  lineA: string;
  lineB: string;
  onProgress?: (progress: number) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useMotion(ref, ({ el, desktop }) => {
    const tl = pinnedTimeline(el, desktop, "150%", (p) => onProgress?.(p));
    tl.to(el.querySelector("[data-a]"), { opacity: 0.35, filter: "blur(2px)", duration: 1 }).from(
      el.querySelectorAll("[data-b] [data-word]"),
      { opacity: 0, y: 10, filter: "blur(4px)", duration: 0.5, stagger: 0.22 },
      0.25,
    );
    if (!desktop) tl.duration(2.4);
  });
  return (
    <div ref={ref} className={stage}>
      <p data-a className={`${display} max-w-[18ch] text-rd-white`}>
        {lineA}
      </p>
      <p data-b className={`${display} mt-4 max-w-[18ch] text-rd-white`}>
        <Words text={lineB} glow />
      </p>
    </div>
  );
}

/** One line dissolves upward into blur while the other holds and gains glow. Pins ~120vh. */
export function PinnedDissolve({ fade, hold }: { fade: string; hold: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useMotion(ref, ({ el, desktop }) => {
    const glow = getComputedStyle(el).getPropertyValue("--accent-glow");
    const tl = pinnedTimeline(el, desktop, "120%");
    tl.to(el.querySelector("[data-fade]"), { opacity: 0.12, filter: "blur(8px)", y: -24, duration: 1 }).fromTo(
      el.querySelector("[data-hold]"),
      { filter: `drop-shadow(0 0 0px ${toRgba(glow, 0)})` },
      { filter: `drop-shadow(0 0 18px ${toRgba(glow, 0.55)})`, duration: 1 },
      0,
    );
    if (!desktop) tl.duration(2);
  });
  return (
    <div ref={ref} className={stage}>
      <p data-fade className={`${display} max-w-[18ch] text-rd-white`}>
        {fade}
      </p>
      <p data-hold className={`${display} mt-4 max-w-[18ch] text-rd-white`}>
        {hold}
      </p>
    </div>
  );
}

/**
 * Words appear one at a time at even scroll intervals with a 1.06 to 1 settle
 * and a soft accent pulse. Pulses are throttled so they never exceed ~3 per second.
 */
export function BeatWords({ text }: { text: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useMotion(ref, ({ el, desktop }) => {
    const words = el.querySelectorAll("[data-word]");
    const pulses = el.querySelectorAll("[data-pulse]");
    let last = -1;
    let lastPulseAt = 0;
    const pulse = (i: number) => {
      const now = performance.now();
      if (now - lastPulseAt < 340 || !pulses[i]) return;
      lastPulseAt = now;
      gsap.fromTo(
        pulses[i],
        { opacity: 0, scale: 0.6 },
        { opacity: 0.4, scale: 1, duration: 0.25, yoyo: true, repeat: 1, ease: "power1.out" },
      );
    };
    const tl = pinnedTimeline(el, desktop, "140%", (progress, direction) => {
      const idx = Math.min(words.length - 1, Math.floor(progress * words.length));
      if (direction > 0 && idx > last) pulse(idx);
      last = idx;
    });
    words.forEach((word, i) => {
      tl.fromTo(word, { opacity: 0, scale: 1.06 }, { opacity: 1, scale: 1, duration: 0.4 }, i);
      if (!desktop) tl.call(() => pulse(i), undefined, i);
    });
    tl.to({}, { duration: 0.6 });
    if (!desktop) tl.duration(words.length * 0.45);
  });

  const words = text.split(" ");
  return (
    <div ref={ref} className={stage}>
      <p className={`${display} isolate max-w-[18ch] text-rd-white`}>
        <span className="sr-only">{text}</span>
        <span aria-hidden="true">
          {words.map((word, i) => (
            <span key={i}>
              <span className="relative inline-block">
                <span
                  data-pulse
                  className="pointer-events-none absolute top-1/2 left-1/2 -z-10 size-[2.2em] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-0"
                  style={{
                    background:
                      "radial-gradient(closest-side, color-mix(in srgb, var(--accent) 55%, transparent), transparent)",
                  }}
                />
                <span data-word className="inline-block">
                  {word}
                </span>
              </span>
              {i < words.length - 1 ? " " : null}
            </span>
          ))}
        </span>
      </p>
    </div>
  );
}
