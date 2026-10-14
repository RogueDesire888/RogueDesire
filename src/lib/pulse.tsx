"use client";

import { useEffect, type ReactNode } from "react";
import { site } from "@/config/site";
import { afterFirstPaint } from "@/lib/motion";

/**
 * Pulse engine: one requestAnimationFrame loop that writes CSS variables on :root.
 *   --beat        0..1, instant attack then exponential decay, once per beat
 *   --bar         0..1 ramp across each 4-beat bar
 *   --energy      0..1 from scroll velocity (|v| / 3000), smoothed, decays to 0 over ~1.5s
 *   --scroll-dir  1 or -1
 * CSS vars are written at ~30Hz and only when their 2-decimal value changes.
 * Reduced motion: no loop, every var stays 0 (dir 1). Hidden tabs pause with rAF.
 */
export type PulseState = { beat: number; bar: number; energy: number; dir: 1 | -1; intensity: number };

const state: PulseState = { beat: 0, bar: 0, energy: 0, dir: 1, intensity: 1 };
const handle = { current: state } as const;

/** Live pulse values for canvas/JS consumers. Reading it never re-renders React. */
export function usePulse(): { readonly current: PulseState } {
  return handle;
}

/**
 * Fog machine bursts. A burst is a plume rising from a point on the bottom
 * edge (x in 0..1), living BURST_MS. At most 3 are active (the drop fires
 * three); the oldest drops. Routine bursts never overlap more than 2.
 * The pulse loop fires one on load and one every 16 bars.
 */
export type FogBurst = { x: number; start: number; intensity: number };
export const BURST_MS = 8000;
const MAX_ACTIVE_BURSTS = 3;
const bursts: FogBurst[] = [];

const prefersReduced = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Fire a fog burst (intensity 0 to 1.5). No-op under reduced motion. */
export function triggerFogBurst(intensity = 1) {
  if (prefersReduced()) return;
  const now = performance.now();
  for (let i = bursts.length - 1; i >= 0; i--) if (now - bursts[i].start > BURST_MS) bursts.splice(i, 1);
  if (bursts.length >= MAX_ACTIVE_BURSTS) bursts.shift();
  bursts.push({ x: 0.1 + Math.random() * 0.8, start: now, intensity: Math.min(1.5, Math.max(0, intensity)) });
}

/** Active bursts for the laser rig shader. */
export function getFogBursts(): readonly FogBurst[] {
  return bursts;
}

const BARS_PER_BURST = 16;

/**
 * Set intensity (0..1): a section-driven multiplier on beam strength, sweep
 * speed, fog density, and beat amplitude. Smoothed in the pulse loop. Pages
 * start at 1; the Atmosphere resets it on every route change.
 */
let intensityTarget = 1;
export function setIntensity(value: number) {
  intensityTarget = Math.min(1, Math.max(0, value));
}

let beatMsCurrent = 60000 / 128;
/** Milliseconds until the next downbeat (start of the next 4-beat bar). */
export function msToNextDownbeat(after = performance.now()): number {
  const bar = beatMsCurrent * 4;
  return bar - (after % bar);
}
export function barMs(): number {
  return beatMsCurrent * 4;
}

/** Point the atmosphere at a cue directly (used by the drop sequence). */
export function setAtmosphereCue(cue: string) {
  const layer = document.querySelector<HTMLElement>(".rd-atmo");
  if (layer) layer.dataset.activeCue = cue;
}

/**
 * The drop: three fog plumes across the bottom edge (~150ms apart), a radial
 * laser explosion (~1.5s), and a violet flood (to 35% over 300ms, decaying over
 * 1.2s), then intensity 1. Fires at most once per page load; the flood never
 * repeats within 10s. Reduced motion: no-op.
 */
export type DropState = { explosionAt: number | null; floodAt: number | null };
const drop: DropState = { explosionAt: null, floodAt: null };
let dropFired = false;
const FLOOD_COOLDOWN_MS = 10000;

export function getDropState(): Readonly<DropState> {
  return drop;
}

export function triggerDrop(): boolean {
  if (dropFired || prefersReduced()) return false;
  dropFired = true;
  const now = performance.now();
  [0, 150, 300].forEach((delay, i) =>
    window.setTimeout(() => {
      const before = bursts.length;
      triggerFogBurst(1);
      // Spread the three plumes across the bottom edge.
      if (bursts.length >= before) bursts[bursts.length - 1].x = 0.2 + i * 0.3;
    }, delay),
  );
  drop.explosionAt = now;
  if (drop.floodAt === null || now - drop.floodAt > FLOOD_COOLDOWN_MS) drop.floodAt = now;
  intensityTarget = 1;
  state.intensity = 1;
  return true;
}

/** Guardrail: never more than 3 pulses per second. */
const MAX_BPM = 180;
const VELOCITY_FULL = 3000;
const WRITE_INTERVAL_MS = 32;

export function PulseProvider({ children }: { children?: ReactNode }) {
  useEffect(() => {
    const root = document.documentElement;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const beatMs = 60000 / Math.min(site.bpm, MAX_BPM);
    beatMsCurrent = beatMs;
    let raf = 0;
    let last = 0;
    let velocity = 0;
    let lastScrollAt = 0;
    let lastWrite = 0;
    let lastBar = -1;
    let barsSinceBurst = 0;

    // Scroll velocity (px/s) and direction from native scroll events, so the
    // engine never needs ScrollTrigger.
    let lastY = window.scrollY;
    const onScroll = () => {
      const now = performance.now();
      const dy = window.scrollY - lastY;
      const dt = Math.max(1, now - lastScrollAt);
      velocity = dt < 200 ? Math.abs(dy) * (1000 / dt) : 0;
      if (dy) state.dir = dy < 0 ? -1 : 1;
      lastY = window.scrollY;
      lastScrollAt = now;
    };

    // Every write to :root invalidates style for the whole document, so values
    // are quantized to 2 decimals and only written when they change.
    const written: Record<string, string> = {};
    const set = (name: string, value: string) => {
      if (written[name] === value) return;
      written[name] = value;
      root.style.setProperty(name, value);
    };
    const write = () => {
      set("--beat", state.beat.toFixed(2));
      set("--bar", state.bar.toFixed(2));
      set("--energy", state.energy.toFixed(2));
      set("--scroll-dir", String(state.dir));
    };

    const tick = (now: number) => {
      const dt = Math.min(100, now - last);
      last = now;
      state.intensity += (intensityTarget - state.intensity) * (1 - Math.exp(-dt / 300));
      state.beat = Math.exp(-((now % beatMs) / beatMs) * 5) * state.intensity;
      state.bar = (now % (beatMs * 4)) / (beatMs * 4);
      const barIndex = Math.floor(now / (beatMs * 4));
      if (barIndex !== lastBar) {
        if (lastBar >= 0 && ++barsSinceBurst >= BARS_PER_BURST) {
          barsSinceBurst = 0;
          triggerFogBurst(1);
        }
        lastBar = barIndex;
      }
      const target = now - lastScrollAt < 120 ? Math.min(1, velocity / VELOCITY_FULL) : 0;
      state.energy =
        target > state.energy
          ? state.energy + (target - state.energy) * Math.min(1, dt / 120)
          : Math.max(target, state.energy * Math.exp(-dt / 450));
      if (state.energy < 0.002) state.energy = 0;
      // CSS consumers update at ~30Hz (enough for a soft envelope); JS consumers
      // read `state` every frame through usePulse().
      if (now - lastWrite >= WRITE_INTERVAL_MS) {
        lastWrite = now;
        write();
      }
      raf = requestAnimationFrame(tick);
    };

    const start = () => {
      cancelAnimationFrame(raf);
      if (reduced.matches) {
        Object.assign(state, { beat: 0, bar: 0, energy: 0, dir: 1 });
        write();
        return;
      }
      last = performance.now();
      raf = requestAnimationFrame(tick);
      if (lastBar < 0) triggerFogBurst(1); // one burst on load
    };

    // The loop starts after first paint; until then the vars keep their CSS defaults.
    let cancelled = false;
    afterFirstPaint().then(() => {
      if (cancelled) return;
      window.addEventListener("scroll", onScroll, { passive: true });
      start();
      reduced.addEventListener("change", start);
    });
    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      reduced.removeEventListener("change", start);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return <>{children}</>;
}
