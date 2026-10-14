"use client";

import { useEffect, useRef } from "react";
import { DESKTOP_MOTION, gsap, loadGsap } from "@/lib/motion";

/** Soft violet glow that eases after a fine pointer on desktop. Off under reduced motion. */
export function CursorGlow() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (
      !el ||
      !window.matchMedia(`(pointer: fine) and ${DESKTOP_MOTION}`).matches
    )
      return;
    let cancelled = false;
    let mm: ReturnType<typeof gsap.matchMedia> | undefined;
    // gsap core only, after first paint; touch and reduced motion never load it here.
    loadGsap().then(() => {
      if (cancelled) return;
      mm = gsap.matchMedia();
      mm.add(`(pointer: fine) and ${DESKTOP_MOTION}`, () => {
        const xTo = gsap.quickTo(el, "x", { duration: 0.7, ease: "power3" });
        const yTo = gsap.quickTo(el, "y", { duration: 0.7, ease: "power3" });
        let shown = false;
        const move = (e: PointerEvent) => {
          xTo(e.clientX);
          yTo(e.clientY);
          if (!shown) {
            shown = true;
            gsap.to(el, { opacity: 1, duration: 0.8 });
          }
        };
        window.addEventListener("pointermove", move);
        return () => window.removeEventListener("pointermove", move);
      });
    });
    return () => {
      cancelled = true;
      mm?.revert();
    };
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="pointer-events-none fixed top-0 left-0 -z-10 -mt-[250px] -ml-[250px] size-[500px] rounded-full opacity-0"
      style={{
        background:
          "radial-gradient(closest-side, color-mix(in srgb, var(--rd-violet) 13%, transparent), transparent)",
      }}
    />
  );
}
