"use client";

import { useEffect, useRef } from "react";

/** Thin vertical accent line on the left edge that fills with page scroll. Desktop only. */
export function ScrollProgress() {
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const el = document.documentElement;
      const max = el.scrollHeight - el.clientHeight;
      const progress = max > 0 ? Math.min(1, Math.max(0, el.scrollTop / max)) : 0;
      if (barRef.current) barRef.current.style.transform = `scaleY(${progress})`;
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed top-0 bottom-0 left-0 z-20 hidden w-px bg-rd-chrome/10 md:block motion-reduce:hidden"
    >
      <div
        ref={barRef}
        className="h-full w-full origin-top bg-accent shadow-[0_0_8px_var(--accent-glow)]"
        style={{ transform: "scaleY(0)" }}
      />
    </div>
  );
}
