"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { LaserGrid } from "@/components/atmosphere/LaserGrid";
import { instagramUrl, site } from "@/config/site";
import { isActive, liveRoutes } from "@/config/nav";
import "./menu-overlay.css";

type MenuOverlayProps = {
  open: boolean;
  pathname: string;
  onClose: () => void;
};

const FOCUSABLE = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function MenuOverlay({ open, pathname, onClose }: MenuOverlayProps) {
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const dialog = dialogRef.current;
    if (!dialog) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialog.querySelector<HTMLElement>(FOCUSABLE)?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== "Tab" || !dialog) return;
      const items = Array.from(dialog.querySelectorAll<HTMLElement>(FOCUSABLE));
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      } else if (!dialog.contains(document.activeElement)) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  return (
    <div
      ref={dialogRef}
      id="site-menu"
      role="dialog"
      aria-modal="true"
      aria-label="Site menu"
      data-open={open}
      className="rd-overlay fixed inset-0 z-40 flex flex-col overflow-y-auto bg-rd-black"
    >
      <div className="pointer-events-none absolute inset-0 opacity-25" aria-hidden="true">
        <LaserGrid />
      </div>

      <div className="relative flex h-16 shrink-0 items-center justify-end px-4 md:h-20 md:px-8">
        <button
          type="button"
          onClick={onClose}
          className="min-h-11 px-3 text-sm font-medium tracking-[0.12em] text-rd-white uppercase"
        >
          Close
        </button>
      </div>

      <nav aria-label="Menu" className="relative flex flex-1 items-center px-6 py-10 md:px-16">
        <ul className="flex flex-col gap-6 md:gap-8">
          {liveRoutes.map((route) => {
            const current = isActive(pathname, route.href);
            return (
              <li key={route.href}>
                <Link
                  href={route.href}
                  onClick={onClose}
                  aria-current={current ? "page" : undefined}
                  className="rd-overlay-link font-display text-5xl leading-[1.08] font-semibold text-rd-chrome sm:text-6xl md:text-7xl"
                >
                  {route.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="relative flex flex-col gap-3 px-6 pb-10 text-rd-chrome md:flex-row md:items-end md:justify-between md:px-16 md:pb-12">
        <p className="max-w-[40ch]">Some moments are too powerful to disappear.</p>
        <a
          href={instagramUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="min-h-11 self-start py-2 text-rd-white underline-offset-[6px] hover:underline md:self-auto"
        >
          @{site.instagram}
        </a>
      </div>
    </div>
  );
}
