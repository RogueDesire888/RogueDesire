"use client";

import { useRef, type ReactNode } from "react";
import { gsap, useMotion } from "@/lib/motion";
import { StanzaLine, Words } from "./text";

const once = (trigger: Element, start = "top 75%") => ({ trigger, start, once: true });

/** Paragraphs: opacity and a 12px rise, once. */
export function FadeIn({
  children,
  delay = 0,
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useMotion(ref, ({ el }) => {
    gsap.from(el, { opacity: 0, y: 12, duration: 1, delay, ease: "power2.out", scrollTrigger: once(el, "top 85%") });
  });
  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}

/** Children fade in one after another (opacity and a 12px rise), once. */
export function FadeInStagger({
  children,
  stagger = 0.2,
  duration = 1,
  className = "",
}: {
  children: ReactNode;
  stagger?: number;
  duration?: number;
  className?: string;
}) {
  const ref = useRef<HTMLUListElement>(null);
  useMotion(ref, ({ el }) => {
    gsap.from(el.children, { opacity: 0, y: 12, duration, stagger, ease: "power1.out", scrollTrigger: once(el, "top 80%") });
  });
  return (
    <ul ref={ref} className={className}>
      {children}
    </ul>
  );
}

/** Stanza lines rise 16px from blur, staggered; optional glow words ignite after their line lands. */
export function RevealLines({
  lines,
  glowWords = [],
  stagger = 0.12,
  className = "",
}: {
  lines: string[];
  glowWords?: string[];
  stagger?: number;
  className?: string;
}) {
  const ref = useRef<HTMLParagraphElement>(null);
  useMotion(ref, ({ el }) => {
    const lineEls = el.querySelectorAll("[data-line]");
    const tl = gsap.timeline({ scrollTrigger: once(el) });
    tl.from(lineEls, { opacity: 0, y: 16, filter: "blur(6px)", duration: 0.9, stagger, ease: "power3.out" });
    lineEls.forEach((line, i) => {
      const glows = line.querySelectorAll("[data-glow]");
      if (glows.length === 0) return;
      gsap.set(glows, { opacity: 0 });
      tl.to(glows, { opacity: 1, duration: 0.6, ease: "power2.out" }, i * stagger + 0.8);
    });
  });
  return (
    <p ref={ref} className={className}>
      {lines.map((line) => (
        <span key={line} data-line className="block">
          <StanzaLine line={line} glowWords={glowWords} />
        </span>
      ))}
    </p>
  );
}

/** Words brighten from 20% to full as the block scrolls through the middle of the viewport. */
export function ScrubWords({ text, className = "" }: { text: string; className?: string }) {
  const ref = useRef<HTMLParagraphElement>(null);
  useMotion(ref, ({ el }) => {
    gsap.fromTo(
      el.querySelectorAll("[data-word]"),
      { opacity: 0.2 },
      {
        opacity: 1,
        stagger: 0.1,
        ease: "none",
        scrollTrigger: { trigger: el, start: "top 70%", end: "bottom 40%", scrub: 0.4 },
      },
    );
  });
  return (
    <p ref={ref} className={className}>
      <Words text={text} />
    </p>
  );
}

/** Each line enters with 300ms of slice offset, violet/ice split, and jitter, then resolves. */
export function GlitchResolve({ lines, className = "" }: { lines: string[]; className?: string }) {
  const ref = useRef<HTMLParagraphElement>(null);
  useMotion(ref, ({ el }) => {
    el.querySelectorAll<HTMLElement>("[data-line]").forEach((line, i) => {
      const base = line.querySelector("[data-base]");
      const [red, blue] = line.querySelectorAll("[data-rgb]");
      const [top, bottom] = line.querySelectorAll("[data-slice]");
      gsap.set(base, { opacity: 0 });
      const tl = gsap.timeline({ delay: i * 0.4, scrollTrigger: once(line, "top 80%") });
      tl.set(base, { opacity: 0.45 })
        .set([red, blue, top, bottom], { opacity: 0.75 })
        .set(red, { x: -6 })
        .set(blue, { x: 6 })
        .set(top, { x: 14 })
        .set(bottom, { x: -10 })
        .to(top, { x: -8, duration: 0.08, ease: "steps(1)" })
        .to(bottom, { x: 12, duration: 0.08, ease: "steps(1)" }, "<")
        .to([red, blue], { x: (j) => (j ? -3 : 3), duration: 0.08, ease: "steps(1)" }, "<")
        .to([top, bottom], { x: (j) => (j ? -4 : 5), duration: 0.07, ease: "steps(1)" })
        .to([red, blue, top, bottom], { opacity: 0, x: 0, duration: 0.07 })
        .to(base, { opacity: 1, duration: 0.07 }, "<");
    });
  });
  return (
    <p ref={ref} className={className}>
      {lines.map((line) => (
        <span key={line} data-line className="relative block">
          <span data-base className="block">
            <StanzaLine line={line} />
          </span>
          <span aria-hidden="true" data-rgb className="pointer-events-none absolute inset-0 text-rd-violet opacity-0 mix-blend-screen">
            {line}
          </span>
          <span aria-hidden="true" data-rgb className="pointer-events-none absolute inset-0 text-rd-ice opacity-0 mix-blend-screen">
            {line}
          </span>
          <span aria-hidden="true" data-slice className="pointer-events-none absolute inset-0 text-rd-white opacity-0 [clip-path:inset(0_0_58%_0)]">
            {line}
          </span>
          <span aria-hidden="true" data-slice className="pointer-events-none absolute inset-0 text-rd-chrome opacity-0 [clip-path:inset(52%_0_0_0)]">
            {line}
          </span>
        </span>
      ))}
    </p>
  );
}

/** A thin accent beam with bloom sweeps across the viewport once when the block enters. */
export function LightSweep({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useMotion(ref, ({ el }) => {
    const beam = el.querySelector("[data-beam]");
    gsap
      .timeline({ scrollTrigger: once(el, "top 80%") })
      .fromTo(beam, { x: "-45vw" }, { x: "105vw", duration: 1.5, ease: "power2.inOut" })
      .to(beam, { opacity: 1, duration: 0.35 }, 0)
      .to(beam, { opacity: 0, duration: 0.45 }, 1.05);
  });
  return (
    <div ref={ref} className="relative">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-16 left-1/2 flex h-24 w-screen -translate-x-1/2 items-center overflow-hidden"
      >
        <div
          data-beam
          className="h-px w-[40vw] bg-accent opacity-0"
          style={{
            boxShadow:
              "0 0 10px 1px var(--accent-glow), 0 0 36px 6px color-mix(in srgb, var(--accent) 45%, transparent)",
          }}
        />
      </div>
      {children}
    </div>
  );
}

/** Flickers its child on like a neon tube: four uneven steps (two flashes) over ~700ms, then steady. */
export function NeonIgnite({ children, className = "" }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useMotion(ref, ({ el }) => {
    gsap.set(el, { opacity: 0 });
    gsap
      .timeline({ scrollTrigger: once(el, "top 85%") })
      .to(el, { opacity: 0.55, duration: 0.15, ease: "none" })
      .to(el, { opacity: 0.15, duration: 0.13, ease: "none" })
      .to(el, { opacity: 0.9, duration: 0.24, ease: "none" })
      .to(el, { opacity: 1, duration: 0.18, ease: "none" });
  });
  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
