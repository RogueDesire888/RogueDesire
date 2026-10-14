"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { LaserGrid } from "@/components/atmosphere/LaserGrid";
import { LaserRig } from "@/components/atmosphere/LaserRig";
import { fontsReady, gsap, MOTION_OK, scheduleRefresh, ScrollTrigger } from "@/lib/motion";
import "./motion.css";

export type Cue = "void" | "fog" | "grid" | "lasers" | "flare" | "hero";

/**
 * One continuous fog room behind every page (mounted once in the root layout,
 * one WebGL canvas). The rig is always on; cues only shift its beam strength
 * and fog density (plus the grid and flare overlays), easing over ~1.2s.
 * Sections declare data-cue; the first one on the page is the starting cue.
 * Triggers are rebuilt on every route change. Reduced motion: static "void".
 */
export function Atmosphere() {
  const ref = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    const layer = ref.current;
    if (!layer) return;
    const setCue = (cue?: string) => {
      if (cue) layer.dataset.activeCue = cue;
    };
    let cancelled = false;
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: reduce)", () => setCue("void"));
    // Runs after the page's own motion setup (same fonts.ready queue, mounted
    // earlier), so cue positions include pin spacers and final line wraps.
    fontsReady().then(() => {
      if (cancelled) return;
      mm.add(MOTION_OK, () => {
        const blocks = [...document.querySelectorAll<HTMLElement>("main [data-cue]")];
        setCue(blocks[0]?.dataset.cue ?? "void");
        blocks.forEach((block) => {
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
  }, [pathname]);

  return (
    <div ref={ref} aria-hidden="true" data-active-cue="void" className="rd-atmo pointer-events-none fixed inset-0 -z-10">
      <div className="rd-cue rd-cue-grid">
        <LaserGrid />
      </div>
      <div className="rd-cue-rig absolute inset-0">
        <LaserRig fallback="fog" className="absolute inset-0" />
      </div>
      <div className="rd-cue rd-cue-flare" />
    </div>
  );
}
