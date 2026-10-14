"use client";

import { useRef, type ReactNode } from "react";
import { gsap, ScrollTrigger, useMotion } from "@/lib/motion";
import { setAtmosphereCue, setIntensity, triggerFogBurst } from "@/lib/pulse";
import "./night-arc.css";

/** Intensity and cue per phase: threshold, activation, peak, afterglow. */
const ARC = [
  { intensity: 0.2, cue: "fog" },
  { intensity: 0.5, cue: "lasers" },
  { intensity: 1, cue: "lasers" },
  { intensity: 0.3, cue: "fog" },
];
const PEAK = 2;

/**
 * The night arc. Children are the four phases (each marked data-phase).
 * As each phase comes into focus the atmosphere plays it: intensity and cue
 * follow ARC, and the peak fires one fog burst. Desktop: the phases sit in a
 * row and the section pins (~200vh) while focus moves across them. Mobile:
 * phases are stacked; each takes focus as it crosses the middle of the screen.
 * Reduced motion: static, every phase fully visible, atmosphere untouched.
 */
export function NightArc({ children, className = "" }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useMotion(ref, ({ el, desktop }) => {
    const phases = [...el.querySelectorAll<HTMLElement>("[data-phase]")];
    let current = -1;
    let peakBurstAt = -Infinity;
    const focus = (i: number) => {
      if (i === current || !phases[i]) return;
      current = i;
      phases.forEach((p, j) => (p.dataset.active = String(j === i)));
      setIntensity(ARC[i].intensity);
      setAtmosphereCue(ARC[i].cue);
      if (i === PEAK && performance.now() - peakBurstAt > 8000) {
        peakBurstAt = performance.now();
        triggerFogBurst(0.7);
      }
    };
    const release = () => {
      current = -1;
      setIntensity(1);
    };
    el.dataset.live = "true";

    if (desktop) {
      gsap.timeline({
        scrollTrigger: {
          trigger: el,
          start: "top top",
          end: "+=200%",
          pin: true,
          anticipatePin: 1,
          onUpdate: (self) => focus(Math.min(phases.length - 1, Math.floor(self.progress * phases.length))),
          onLeave: release,
          onLeaveBack: release,
        },
      });
    } else {
      phases.forEach((phase, i) =>
        ScrollTrigger.create({
          trigger: phase,
          start: "top 60%",
          end: "bottom 40%",
          onEnter: () => focus(i),
          onEnterBack: () => focus(i),
        }),
      );
      ScrollTrigger.create({ trigger: el, start: "top bottom", end: "bottom top", onLeave: release, onLeaveBack: release });
    }
    return () => {
      delete el.dataset.live;
      phases.forEach((p) => delete p.dataset.active);
    };
  });
  return (
    <div ref={ref} className={`rd-arc ${className}`}>
      {children}
    </div>
  );
}
