"use client";

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { LaserGrid } from "@/components/atmosphere/LaserGrid";
import { afterFirstPaint } from "@/lib/motion";
import { setIntensity } from "@/lib/pulse";
import "@/components/atmosphere/laser-rig.css";
import "./motion.css";

/** The rig's static state, identical to what LaserRig renders before WebGL starts. */
function StaticFog() {
  return (
    <div data-state="static" className="rd-rig pointer-events-none absolute inset-0">
      <div className="rd-rig-fallback absolute inset-0">
        <div className="rd-rig-fog absolute inset-0" />
      </div>
    </div>
  );
}

// Rig code is its own chunk, loaded only after first paint.
const LaserRig = dynamic(() => import("@/components/atmosphere/LaserRig").then((m) => m.LaserRig), {
  ssr: false,
  loading: StaticFog,
});

export type Cue = "void" | "fog" | "grid" | "lasers" | "flare" | "hero";

/**
 * One continuous fog room behind every page (mounted once in the root layout,
 * one WebGL canvas). The rig is always on; cues only shift its beam strength
 * and fog density (plus the grid and flare overlays), easing over ~1.2s.
 * Sections declare data-cue; the first one on the page is the starting cue.
 * Cue changes come from an IntersectionObserver line at 55% of the viewport
 * (no ScrollTrigger), rebuilt on every route change. The rig starts after
 * first paint and fades in. Reduced motion: static "void".
 */
export function Atmosphere() {
  const ref = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  const [live, setLive] = useState(false);

  useEffect(() => {
    let cancelled = false;
    afterFirstPaint().then(() => !cancelled && setLive(true));
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const layer = ref.current;
    if (!layer || !live) return;
    const setCue = (cue?: string) => {
      if (cue) layer.dataset.activeCue = cue;
    };
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setCue("void");
      return;
    }
    setIntensity(1);
    const blocks = [...document.querySelectorAll<HTMLElement>("main [data-cue]")];
    setCue(blocks[0]?.dataset.cue ?? "void");
    // A 1px band at 55% from the top: whichever block crosses it sets the cue.
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setCue((entry.target as HTMLElement).dataset.cue);
        }
      },
      { rootMargin: "-55% 0px -45% 0px", threshold: 0 },
    );
    blocks.forEach((block) => io.observe(block));
    return () => io.disconnect();
  }, [pathname, live]);

  return (
    <div ref={ref} aria-hidden="true" data-active-cue="void" className="rd-atmo pointer-events-none fixed inset-0 -z-10">
      <div className="rd-cue rd-cue-grid">
        <LaserGrid />
      </div>
      <div className="rd-cue-rig absolute inset-0">
        {live ? <LaserRig fallback="fog" className="absolute inset-0" /> : <StaticFog />}
      </div>
      <div className="rd-cue rd-cue-flare" />
    </div>
  );
}
