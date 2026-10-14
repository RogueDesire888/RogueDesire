"use client";

import { useEffect, useRef, useState } from "react";
import { usePrefersReducedMotion } from "@/lib/motion";
import "./charm.css";

const EDGES = 12;

function Rotor({
  withEdges,
  rotorRef,
  transform,
}: {
  withEdges: boolean;
  rotorRef?: React.Ref<HTMLDivElement>;
  transform?: string;
}) {
  return (
    <div ref={rotorRef} className="rd-charm-rotor" style={transform ? { transform } : undefined}>
      {withEdges &&
        Array.from({ length: EDGES }, (_, i) => (
          <div key={i} className="rd-charm-edge" style={{ "--i": i } as React.CSSProperties} />
        ))}
      <div className="rd-charm-face rd-charm-front" />
      <div className="rd-charm-face rd-charm-back" />
    </div>
  );
}

/**
 * Artifact 001 charm, spinning like a sign on a lazy susan (--spin-duration,
 * shared with the home wordmark). Drag to spin with momentum; it eases back
 * into the auto-spin within ~1.5s. Arrow keys rotate it when focused.
 * Reduced motion: no spin, front shown, with a "Show back" toggle.
 */
export function CharmSpinner() {
  const reduced = usePrefersReducedMotion();
  const [showBack, setShowBack] = useState(false);
  const stageRef = useRef<HTMLDivElement>(null);
  const rotorRef = useRef<HTMLDivElement>(null);
  const reflectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stage = stageRef.current;
    const rotor = rotorRef.current;
    const reflection = reflectionRef.current;
    if (reduced || !stage || !rotor || !reflection) return;

    const spinSeconds = parseFloat(getComputedStyle(stage).getPropertyValue("--spin-duration")) || 14;
    const autoSpeed = 360 / spinSeconds; // deg per second
    let angle = 0;
    let velocity = autoSpeed;
    let dragging = false;
    let lastX = 0;
    let lastT = 0;
    let raf = 0;
    let last = performance.now();
    let visible = false;

    const apply = () => {
      const t = `rotateY(${angle.toFixed(2)}deg)`;
      rotor.style.transform = t;
      reflection.style.transform = t;
    };
    const frame = (now: number) => {
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;
      if (!dragging) {
        // Momentum eases back into the auto-spin (~95% within 1.5s).
        velocity += (autoSpeed - velocity) * (1 - Math.exp(-dt / 0.3));
        angle += velocity * dt;
      }
      apply();
      raf = visible ? requestAnimationFrame(frame) : 0;
    };
    const start = () => {
      if (raf || !visible) return;
      last = performance.now();
      raf = requestAnimationFrame(frame);
    };

    const onDown = (e: PointerEvent) => {
      dragging = true;
      lastX = e.clientX;
      lastT = performance.now();
      velocity = 0;
      stage.setPointerCapture(e.pointerId);
    };
    const onMove = (e: PointerEvent) => {
      if (!dragging) return;
      const now = performance.now();
      const delta = (e.clientX - lastX) * 0.6;
      angle += delta;
      const dt = Math.max(0.008, (now - lastT) / 1000);
      velocity = velocity * 0.6 + (delta / dt) * 0.4;
      lastX = e.clientX;
      lastT = now;
    };
    const onUp = (e: PointerEvent) => {
      if (!dragging) return;
      dragging = false;
      velocity = Math.max(-900, Math.min(900, velocity));
      if (stage.hasPointerCapture(e.pointerId)) stage.releasePointerCapture(e.pointerId);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
      e.preventDefault();
      angle += e.key === "ArrowLeft" ? -20 : 20;
      velocity = 0; // pause, then ease back into the spin
      apply();
    };

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      start();
    });
    io.observe(stage);
    stage.addEventListener("pointerdown", onDown);
    stage.addEventListener("pointermove", onMove);
    stage.addEventListener("pointerup", onUp);
    stage.addEventListener("pointercancel", onUp);
    stage.addEventListener("keydown", onKey);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      stage.removeEventListener("pointerdown", onDown);
      stage.removeEventListener("pointermove", onMove);
      stage.removeEventListener("pointerup", onUp);
      stage.removeEventListener("pointercancel", onUp);
      stage.removeEventListener("keydown", onKey);
      rotor.style.transform = "";
      reflection.style.transform = "";
    };
  }, [reduced]);

  const staticTransform = reduced && showBack ? "rotateY(180deg)" : undefined;

  return (
    <div className="flex flex-col items-center">
      <div
        ref={stageRef}
        tabIndex={reduced ? undefined : 0}
        role="img"
        aria-label={reduced ? "Artifact 001" : "Artifact 001, rotate with arrow keys"}
        className="rd-charm flex cursor-grab touch-pan-y flex-col items-center rounded-sm outline-offset-8 select-none active:cursor-grabbing"
      >
        <Rotor withEdges rotorRef={rotorRef} transform={staticTransform} />
        {/* Floor reflection: only its top ~45% shows, so collapse the rest of its height. */}
        <div aria-hidden="true" className="rd-charm-reflection mb-[calc(var(--charm-h)*-0.55)]">
          <Rotor withEdges={false} rotorRef={reflectionRef} transform={staticTransform} />
        </div>
      </div>
      {reduced && (
        <button
          type="button"
          aria-pressed={showBack}
          onClick={() => setShowBack((v) => !v)}
          className="mt-2 min-h-11 border border-rd-chrome/40 px-5 text-sm text-rd-white hover:border-rd-chrome"
        >
          Show back
        </button>
      )}
    </div>
  );
}
