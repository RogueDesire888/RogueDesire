"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useSyncExternalStore, type RefObject } from "react";

/**
 * Motion kit setup. Plugins are registered once here; every motion component
 * imports gsap/ScrollTrigger from this module.
 *
 * Guardrails: components render their final, readable state on the server and
 * only set hidden starting states inside effects, under MOTION_OK. Animate only
 * transform, opacity, and filter. No pinning under 768px.
 */
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
  // Web fonts change line heights; re-measure triggers once they load.
  document.fonts?.ready.then(() => ScrollTrigger.refresh());
  // Dev-only handle for inspecting triggers from the console.
  if (process.env.NODE_ENV !== "production") {
    (window as unknown as { __rdScrollTrigger: typeof ScrollTrigger }).__rdScrollTrigger = ScrollTrigger;
  }
}

export { gsap, ScrollTrigger };

export const MOTION_OK = "(prefers-reduced-motion: no-preference)";
export const DESKTOP_MOTION = `(min-width: 768px) and ${MOTION_OK}`;
export const MOBILE_MOTION = `(max-width: 767px) and ${MOTION_OK}`;

const REDUCED = "(prefers-reduced-motion: reduce)";

function subscribe(onChange: () => void) {
  const query = window.matchMedia(REDUCED);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

export function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(REDUCED).matches,
    () => false,
  );
}

type MotionSetup = (opts: { el: HTMLElement; desktop: boolean }) => void | (() => void);

let refreshQueued = false;
/** One ScrollTrigger.refresh per frame, however many components ask for it. */
export function scheduleRefresh() {
  if (refreshQueued) return;
  refreshQueued = true;
  requestAnimationFrame(() => {
    refreshQueued = false;
    ScrollTrigger.refresh();
  });
}

/** Resolves once web fonts are loaded, so triggers measure final line wraps. */
export function fontsReady(): Promise<unknown> {
  return document.fonts?.ready ?? Promise.resolve();
}

/**
 * Runs `setup` scoped to `ref` only when motion is allowed, after web fonts
 * load (so pins and line wraps are measured with the final face). Desktop and
 * mobile get separate runs so pinning can be desktop-only. Everything created
 * inside (tweens, ScrollTriggers, inline styles) is reverted on unmount or when
 * the media conditions change.
 */
export function useMotion(ref: RefObject<HTMLElement | null>, setup: MotionSetup) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let cancelled = false;
    const mm = gsap.matchMedia(el);
    fontsReady().then(() => {
      if (cancelled) return;
      mm.add({ desktop: DESKTOP_MOTION, mobile: MOBILE_MOTION }, (context) => {
        const { desktop } = context.conditions as { desktop: boolean; mobile: boolean };
        return setup({ el, desktop });
      });
      scheduleRefresh();
    });
    return () => {
      cancelled = true;
      mm.revert();
    };
    // Setup runs once per mount; media changes are handled by gsap.matchMedia.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}

/** "#b879ff" (or a CSS variable value) to "rgba(r, g, b, a)" for filter tweens. */
export function toRgba(color: string, alpha: number): string {
  const hex = color.trim().replace("#", "");
  const full = hex.length === 3 ? hex.split("").map((c) => c + c).join("") : hex;
  const n = Number.parseInt(full, 16);
  if (Number.isNaN(n)) return `rgba(184, 121, 255, ${alpha})`;
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`;
}
