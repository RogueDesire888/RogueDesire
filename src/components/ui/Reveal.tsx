"use client";

import { useEffect, useRef, type CSSProperties, type ReactNode, type Ref } from "react";
import "./reveal.css";

type RevealProps = {
  children: ReactNode;
  className?: string;
  /** "rise": fade and slight lift. "fade": opacity only. */
  variant?: "rise" | "fade";
  /** Delay in ms after entering view. */
  delay?: number;
  /** Use "span" inside headings and other phrasing content. */
  as?: "div" | "span";
};

/** Reveals its content once, the first time it scrolls into view. */
export function Reveal({ children, className = "", variant = "rise", delay = 0, as: Tag = "div" }: RevealProps) {
  const ref = useRef<HTMLElement>(null);

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
    <Tag
      ref={ref as Ref<HTMLDivElement & HTMLSpanElement>}
      data-variant={variant}
      className={`rd-reveal ${className}`}
      style={{ "--reveal-delay": `${delay}ms` } as CSSProperties}
    >
      {children}
    </Tag>
  );
}
