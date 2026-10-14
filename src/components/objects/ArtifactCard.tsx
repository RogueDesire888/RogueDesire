"use client";

import { useEffect, useRef } from "react";
import { Wordmark } from "@/components/brand/Wordmark";
import { Redaction } from "@/components/ui/Redaction";
import "./artifact-card.css";

const MAX_TILT = 12;

type Props = { title: string; line: string | null; code: string };

/**
 * Artifact card (5x7) built in code. Tilts toward the pointer (max 12deg) with
 * a holographic foil that shifts with the tilt. Touch: device orientation when
 * no permission prompt is needed, otherwise a slow automatic sway. Flat and
 * static under reduced motion; paused offscreen.
 */
export function ArtifactCard({ title, line, code }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const card = ref.current;
    if (!card || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let tx = 0, ty = 0, rx = 0, ry = 0, raf = 0, visible = false, swayFrom = 0;
    const fine = window.matchMedia("(pointer: fine)").matches;
    type OrientationCtor = { requestPermission?: () => Promise<string> };
    const orientationFree =
      !fine && typeof DeviceOrientationEvent !== "undefined" &&
      typeof (DeviceOrientationEvent as unknown as OrientationCtor).requestPermission !== "function";
    let gotOrientation = false;

    const onPointer = (e: PointerEvent) => {
      const r = card.getBoundingClientRect();
      const px = Math.max(-1, Math.min(1, ((e.clientX - r.left) / r.width) * 2 - 1));
      const py = Math.max(-1, Math.min(1, ((e.clientY - r.top) / r.height) * 2 - 1));
      tx = px * MAX_TILT;
      ty = -py * MAX_TILT;
    };
    const onLeave = () => {
      tx = 0;
      ty = 0;
    };
    const onOrientation = (e: DeviceOrientationEvent) => {
      if (e.gamma === null || e.beta === null) return;
      gotOrientation = true;
      tx = Math.max(-MAX_TILT, Math.min(MAX_TILT, e.gamma / 3));
      ty = Math.max(-MAX_TILT, Math.min(MAX_TILT, -(e.beta - 45) / 3));
    };

    const frame = (now: number) => {
      if (!fine && !gotOrientation) {
        // Slow automatic sway on touch devices without orientation data.
        const t = (now - swayFrom) / 1000;
        tx = Math.sin(t * 0.6) * 7;
        ty = Math.sin(t * 0.45 + 1) * 4;
      }
      rx += (ty - rx) * 0.12;
      ry += (tx - ry) * 0.12;
      card.style.setProperty("--rx", `${rx.toFixed(2)}deg`);
      card.style.setProperty("--ry", `${ry.toFixed(2)}deg`);
      card.style.setProperty("--mx", `${(50 + (ry / MAX_TILT) * 40).toFixed(1)}%`);
      card.style.setProperty("--my", `${(50 - (rx / MAX_TILT) * 40).toFixed(1)}%`);
      raf = visible ? requestAnimationFrame(frame) : 0;
    };
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible && !raf) {
        swayFrom = swayFrom || performance.now();
        raf = requestAnimationFrame(frame);
      }
    });
    io.observe(card);

    if (fine) {
      window.addEventListener("pointermove", onPointer, { passive: true });
      card.addEventListener("pointerleave", onLeave);
    } else if (orientationFree) {
      window.addEventListener("deviceorientation", onOrientation);
    }
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      window.removeEventListener("pointermove", onPointer);
      card.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("deviceorientation", onOrientation);
    };
  }, []);

  return (
    <div className="[perspective:900px]">
      <div
        ref={ref}
        className="rd-card relative aspect-[5/7] w-full max-w-[340px] overflow-hidden border border-rd-chrome/30 bg-[linear-gradient(160deg,#121218,#050507_60%,#0b0b12)] shadow-[0_30px_80px_-20px_color-mix(in_srgb,var(--accent)_45%,transparent)]"
      >
        <div className="absolute inset-3 border border-rd-chrome/20" aria-hidden="true" />
        <div className="relative flex h-full flex-col items-center px-6 py-8 text-center">
          <div className="w-20">
            <Wordmark size="sm" />
          </div>
          <div className="flex flex-1 flex-col items-center justify-center gap-4">
            <p className="rd-text-glow font-display text-5xl leading-[1.08] font-semibold text-rd-white">{title}</p>
            {line && <p className="max-w-[22ch] text-xs leading-relaxed text-rd-chrome">{line}</p>}
          </div>
          <p className="flex items-center gap-2 text-xs text-rd-chrome">
            <span>No.</span>
            <Redaction seed={`${code}-edition`} className="!w-14" />
          </p>
          <p className="mt-3 text-[10px] tracking-[0.3em] text-rd-chrome">{code}</p>
        </div>
        <div aria-hidden="true" className="rd-card-foil pointer-events-none absolute inset-0" />
      </div>
    </div>
  );
}
