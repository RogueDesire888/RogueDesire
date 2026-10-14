"use client";

import type { gsap as GsapType } from "gsap";
import type { ScrollTrigger as ScrollTriggerType } from "gsap/ScrollTrigger";
import { useEffect, useSyncExternalStore, type RefObject } from "react";

/**
 * Motion kit setup. gsap and ScrollTrigger are not in the initial bundle: they
 * load by dynamic import after first paint (`loadMotion()`), and these live
 * bindings are filled in then. Only touch them inside `useMotion` setups or
 * after `loadMotion()` / `loadGsap()` resolves.
 *
 * Guardrails: components render their final, readable state on the server and
 * only set hidden starting states inside effects, under MOTION_OK. Animate only
 * transform, opacity, and filter. No pinning under 768px.
 */
export let gsap: typeof GsapType;
export let ScrollTrigger: typeof ScrollTriggerType;

let started: Promise<void> | null = null;
/**
 * Resolves once, after web fonts are ready, the first frame has painted, and
 * the browser is idle (requestIdleCallback, 1.2s timeout; plain 1.2s timer
 * where it is missing). Every loop and trigger on the site starts from here.
 */
export function afterFirstPaint(): Promise<void> {
  started ??= fontsReady().then(
    () =>
      new Promise<void>((resolve) => {
        requestAnimationFrame(() =>
          requestAnimationFrame(() => {
            if ("requestIdleCallback" in window) window.requestIdleCallback(() => resolve(), { timeout: 1200 });
            else setTimeout(resolve, 1200);
          }),
        );
      }),
  );
  return started;
}

let gsapLoad: Promise<void> | null = null;
/** gsap core only (no ScrollTrigger), after first paint. */
export function loadGsap(): Promise<void> {
  gsapLoad ??= afterFirstPaint()
    .then(() => import("gsap"))
    .then((m) => {
      gsap = m.gsap;
    });
  return gsapLoad;
}

let motionLoad: Promise<void> | null = null;
/** gsap + ScrollTrigger, after first paint. Only pages with scroll motion call this. */
export function loadMotion(): Promise<void> {
  motionLoad ??= Promise.all([loadGsap(), import("gsap/ScrollTrigger")]).then(([, m]) => {
    ScrollTrigger = m.ScrollTrigger;
    gsap.registerPlugin(ScrollTrigger);
    // Dev-only handle for inspecting triggers from the console.
    if (process.env.NODE_ENV !== "production") {
      (window as unknown as { __rdScrollTrigger: typeof ScrollTrigger }).__rdScrollTrigger = ScrollTrigger;
    }
  });
  return motionLoad;
}

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
type MotionOptions = {
  /**
   * One-shot entrance (fade, reveal) on gsap core only, never ScrollTrigger:
   * the setup's tweens are paused and play once when the element reaches 85%
   * of the viewport (IntersectionObserver). Skipped when the element is already
   * on screen as motion starts, so the static first frame never flashes out.
   */
  entrance?: boolean;
};

let refreshQueued = false;
/** One ScrollTrigger.refresh per frame, however many components ask for it. */
export function scheduleRefresh() {
  if (refreshQueued) return;
  refreshQueued = true;
  requestAnimationFrame(() => {
    refreshQueued = false;
    // Triggers can be created out of page order (the layout's Atmosphere may
    // hydrate before the page's pins). Sorting by position before refreshing
    // makes every trigger below a pin include that pin's spacing.
    ScrollTrigger.sort();
    ScrollTrigger.refresh();
  });
}

/** Resolves once web fonts are loaded, so triggers measure final line wraps. */
export function fontsReady(): Promise<unknown> {
  return document.fonts?.ready ?? Promise.resolve();
}

/**
 * Runs `setup` scoped to `ref` only when motion is allowed, after first paint
 * and web fonts (so pins and line wraps are measured with the final face). Desktop and
 * mobile get separate runs so pinning can be desktop-only. Everything created
 * inside (tweens, ScrollTriggers, inline styles) is reverted on unmount or when
 * the media conditions change.
 */
export function useMotion(ref: RefObject<HTMLElement | null>, setup: MotionSetup, { entrance = false }: MotionOptions = {}) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let cancelled = false;
    let mm: ReturnType<typeof gsap.matchMedia> | undefined;
    (entrance ? loadGsap() : loadMotion()).then(() => {
      if (cancelled) return;
      if (entrance) {
        const r = el.getBoundingClientRect();
        if (r.top < window.innerHeight && r.bottom > 0) return;
      }
      mm = gsap.matchMedia(el);
      mm.add({ desktop: DESKTOP_MOTION, mobile: MOBILE_MOTION }, (context) => {
        const { desktop } = context.conditions as { desktop: boolean; mobile: boolean };
        const cleanup = setup({ el, desktop });
        if (!entrance) return cleanup;
        const anims = (context as unknown as { getTweens(): GSAPAnimation[] }).getTweens();
        anims.forEach((a) => a.pause());
        const io = new IntersectionObserver(
          ([entry]) => {
            if (!entry.isIntersecting) return;
            io.disconnect();
            anims.forEach((a) => a.restart(true));
          },
          { rootMargin: "0px 0px -15% 0px" },
        );
        io.observe(el);
        return () => {
          io.disconnect();
          cleanup?.();
        };
      });
      if (!entrance) scheduleRefresh();
    });
    return () => {
      cancelled = true;
      mm?.revert();
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
