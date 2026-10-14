"use client";

import { useEffect, useRef } from "react";
import { LaserGrid } from "@/components/atmosphere/LaserGrid";
import { LaserRig } from "@/components/atmosphere/LaserRig";
import { fontsReady, gsap, MOTION_OK, scheduleRefresh, ScrollTrigger } from "@/lib/motion";
import "./motion.css";

export type Cue = "void" | "fog" | "grid" | "lasers" | "flare";

/**
 * Fixed layer behind page content. Blocks declare data-cue; the active cue
 * crossfades as each block passes the middle of the viewport.
 * Reduced motion: static "void".
 */
export function Atmosphere({ initial = "void" }: { initial?: Cue }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const layer = ref.current;
    if (!layer) return;
    const setCue = (cue?: string) => {
      if (cue) layer.dataset.activeCue = cue;
    };
    let cancelled = false;
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: reduce)", () => setCue("void"));
    // Created after fonts load and after the primitives (mounted earlier), so
    // cue positions include pin spacers and final line wraps.
    fontsReady().then(() => {
      if (cancelled) return;
      mm.add(MOTION_OK, () => {
        setCue(initial);
        document.querySelectorAll<HTMLElement>("[data-cue]").forEach((block) => {
          ScrollTrigger.create({
            trigger: block,
            start: "top 55%",
            end: "bottom 55%",
            onEnter: () => setCue(block.dataset.cue),
            onEnterBack: () => setCue(block.dataset.cue),
          });
        });
        scheduleRefresh();
      });
    });
    return () => {
      cancelled = true;
      mm.revert();
    };
  }, [initial]);

  return (
    <div ref={ref} aria-hidden="true" data-active-cue={initial} className="rd-atmo pointer-events-none fixed inset-0 -z-10">
      <div className="rd-cue rd-cue-fog" />
      <div className="rd-cue rd-cue-grid">
        <LaserGrid />
      </div>
      <div className="rd-cue rd-cue-lasers">
        <LaserRig className="absolute inset-0" />
      </div>
      <div className="rd-cue rd-cue-flare" />
    </div>
  );
}
