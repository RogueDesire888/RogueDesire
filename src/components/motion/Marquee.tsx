"use client";

import { useEffect, useRef } from "react";
import { usePulse } from "@/lib/pulse";

const COPIES = 3;
const BASE_SPEED = 40; // px per second

function Group({ text }: { text: string }) {
  return (
    <div className="flex shrink-0 items-center" data-group>
      {Array.from({ length: COPIES }, (_, i) => (
        <span key={i} className="flex items-center">
          <span
            className="px-[0.35em] font-display text-[clamp(4.5rem,13vw,12rem)] leading-[1.1] font-semibold whitespace-nowrap text-transparent"
            style={{ WebkitTextStroke: "1px rgb(245 245 247 / 0.4)" }}
          >
            {text}
          </span>
          <span className="inline-block size-3 shrink-0 rotate-45 bg-rd-violet md:size-4" />
        </span>
      ))}
    </div>
  );
}

/**
 * Full-bleed band of outlined display text, repeating seamlessly.
 * Speed scales with --energy (x1 to x5), direction follows scroll direction,
 * and the band skews up to 6deg with energy, easing back to 0.
 * One accessible copy (sr-only); the moving copies are aria-hidden.
 * Static under reduced motion; paused offscreen and with the tab.
 */
export function Marquee({
  text,
  direction = 1,
  cue,
}: {
  text: string;
  direction?: 1 | -1;
  /** Atmosphere cue while the band is in view. */
  cue?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const pulse = usePulse();

  useEffect(() => {
    const band = ref.current;
    const track = trackRef.current;
    if (!band || !track) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let groupWidth = 0;
    const measure = () => {
      groupWidth = track.querySelector<HTMLElement>("[data-group]")?.offsetWidth ?? 0;
    };
    measure();
    const resizeObserver = new ResizeObserver(measure);
    resizeObserver.observe(track);

    let x = 0;
    let skew = 0;
    let raf = 0;
    let last = 0;
    const frame = (now: number) => {
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;
      const { energy, dir } = pulse.current;
      const sign = direction * dir;
      x -= BASE_SPEED * (1 + energy * 4) * sign * dt;
      if (groupWidth > 0) x = ((x % groupWidth) - groupWidth) % groupWidth;
      skew += (energy * 6 * -sign - skew) * Math.min(1, dt * 6);
      track.style.transform = `translate3d(${x.toFixed(2)}px, 0, 0) skewX(${skew.toFixed(2)}deg)`;
      raf = requestAnimationFrame(frame);
    };
    const io = new IntersectionObserver(([entry]) => {
      cancelAnimationFrame(raf);
      if (entry.isIntersecting) {
        last = performance.now();
        raf = requestAnimationFrame(frame);
      }
    });
    io.observe(band);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      resizeObserver.disconnect();
      track.style.transform = "";
    };
  }, [direction, pulse]);

  return (
    <div ref={ref} data-cue={cue} data-fog-cap className="relative w-full overflow-hidden py-6 md:py-10">
      <p className="sr-only">{text}</p>
      <div ref={trackRef} aria-hidden="true" className="flex w-max will-change-transform">
        <Group text={text} />
        <Group text={text} />
      </div>
    </div>
  );
}
