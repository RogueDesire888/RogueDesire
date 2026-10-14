"use client";

import { useEffect, useRef, type ReactNode } from "react";
import "./reveal.css";

/** Fades and lifts its content once, the first time it scrolls into view. */
export function Reveal({ children, className = "" }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.dataset.revealed = "true";
          observer.disconnect();
        }
      },
      { threshold: 0.2 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className={`rd-reveal ${className}`}>
      {children}
    </div>
  );
}
