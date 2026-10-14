"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { Wordmark } from "@/components/brand/Wordmark";
import { Button } from "@/components/ui/Button";
import { circleRoute, isActive, primaryRoutes } from "@/config/nav";
import { MenuOverlay } from "./MenuOverlay";

const SCROLL_THRESHOLD = 80;

export function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  // The menu belongs to the path it was opened on, so it closes on route change.
  const [openPath, setOpenPath] = useState<string | null>(null);
  const open = openPath === pathname;
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const wasOpen = useRef(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > SCROLL_THRESHOLD);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Return focus to the Menu button after the overlay closes.
  useEffect(() => {
    if (wasOpen.current && !open) menuButtonRef.current?.focus();
    wasOpen.current = open;
  }, [open]);

  const closeMenu = useCallback(() => setOpenPath(null), []);

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-30 border-b transition-[background-color,border-color,backdrop-filter] duration-300 motion-reduce:transition-none ${
          scrolled
            ? "border-rd-chrome/15 bg-rd-charcoal/80 backdrop-blur-md"
            : "border-transparent bg-transparent"
        }`}
      >
        <div className="mx-auto flex h-16 max-w-[1600px] items-center justify-between gap-6 px-4 md:h-20 md:px-8">
          <Link href="/" aria-label="Rogue Desire home" className="block w-[76px] shrink-0 md:w-28">
            <Wordmark size="sm" priority />
          </Link>

          <nav aria-label="Primary" className="flex items-center gap-2 md:gap-6">
            {primaryRoutes.length > 0 && (
              <ul className="hidden items-center gap-6 md:flex">
                {primaryRoutes.map((route) => {
                  const current = isActive(pathname, route.href);
                  return (
                    <li key={route.href}>
                      <Link
                        href={route.href}
                        aria-current={current ? "page" : undefined}
                        className={`inline-flex min-h-11 items-center border-b text-sm tracking-[0.08em] ${
                          current
                            ? "border-accent text-rd-white"
                            : "border-transparent text-rd-chrome hover:text-rd-white"
                        }`}
                      >
                        {route.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
            {circleRoute && (
              // Wrapper hides it on mobile: the Button's own inline-flex would win over "hidden".
              <span className="hidden md:block">
                <Button href={circleRoute.href} variant="primary">
                  {circleRoute.label}
                </Button>
              </span>
            )}
            <button
              ref={menuButtonRef}
              type="button"
              aria-haspopup="dialog"
              aria-expanded={open}
              aria-controls="site-menu"
              onClick={() => setOpenPath(pathname)}
              className="min-h-11 px-3 text-sm font-medium tracking-[0.12em] text-rd-white uppercase"
            >
              Menu
            </button>
          </nav>
        </div>
      </header>
      <MenuOverlay open={open} pathname={pathname} onClose={closeMenu} />
    </>
  );
}
