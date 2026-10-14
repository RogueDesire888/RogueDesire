"use client";

import { useRef, type ComponentPropsWithoutRef } from "react";
import { useMotion, ScrollTrigger } from "@/lib/motion";
import { setIntensity, triggerFogBurst } from "@/lib/pulse";

type SetZoneProps = ComponentPropsWithoutRef<"section"> & {
  /** Hold a value while in view, or ramp [from, to] as the section scrolls through. */
  intensity?: number | [number, number];
  /** One gentle fog burst the first time the section enters view. */
  burstOnEnter?: number;
};

/**
 * A section of the home "set". Drives the pulse engine's intensity from scroll.
 * Reduced motion: renders a plain section, no intensity or bursts.
 */
export function SetZone({ intensity, burstOnEnter, children, ...rest }: SetZoneProps) {
  const ref = useRef<HTMLElement>(null);
  useMotion(ref, ({ el }) => {
    if (Array.isArray(intensity)) {
      const [from, to] = intensity;
      ScrollTrigger.create({
        trigger: el,
        start: "top 80%",
        end: "bottom 40%",
        onUpdate: (self) => setIntensity(from + (to - from) * self.progress),
        onEnter: () => setIntensity(from),
        onLeaveBack: () => setIntensity(from),
      });
    } else if (typeof intensity === "number") {
      ScrollTrigger.create({
        trigger: el,
        start: "top 55%",
        end: "bottom 55%",
        onEnter: () => setIntensity(intensity),
        onEnterBack: () => setIntensity(intensity),
      });
    }
    if (burstOnEnter !== undefined) {
      ScrollTrigger.create({ trigger: el, start: "top 60%", once: true, onEnter: () => triggerFogBurst(burstOnEnter) });
    }
  });
  return (
    <section ref={ref} {...rest}>
      {children}
    </section>
  );
}
