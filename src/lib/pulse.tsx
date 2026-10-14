"use client";

import { useEffect, type ReactNode } from "react";
import { site } from "@/config/site";
import { ScrollTrigger } from "@/lib/motion";

/**
 * Pulse engine: one requestAnimationFrame loop that writes CSS variables on :root.
 *   --beat        0..1, instant attack then exponential decay, once per beat
 *   --bar         0..1 ramp across each 4-beat bar
 *   --energy      0..1 from scroll velocity (|v| / 3000), smoothed, decays to 0 over ~1.5s
 *   --scroll-dir  1 or -1
 * CSS vars are written at ~30Hz and only when their 2-decimal value changes.
 * Reduced motion: no loop, every var stays 0 (dir 1). Hidden tabs pause with rAF.
 */
export type PulseState = { beat: number; bar: number; energy: number; dir: 1 | -1 };

const state: PulseState = { beat: 0, bar: 0, energy: 0, dir: 1 };
const handle = { current: state } as const;

/** Live pulse values for canvas/JS consumers. Reading it never re-renders React. */
export function usePulse(): { readonly current: PulseState } {
  return handle;
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
    let raf = 0;
    let last = 0;
    let velocity = 0;
    let lastScrollAt = 0;
    let lastWrite = 0;

    const scroll = ScrollTrigger.create({
      onUpdate: (self) => {
        velocity = Math.abs(self.getVelocity());
        state.dir = self.direction < 0 ? -1 : 1;
        lastScrollAt = performance.now();
      },
    });

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
      state.beat = Math.exp(-((now % beatMs) / beatMs) * 5);
      state.bar = (now % (beatMs * 4)) / (beatMs * 4);
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
    };

    start();
    reduced.addEventListener("change", start);
    return () => {
      cancelAnimationFrame(raf);
      reduced.removeEventListener("change", start);
      scroll.kill();
    };
  }, []);

  return <>{children}</>;
}
