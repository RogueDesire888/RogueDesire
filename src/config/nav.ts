/**
 * Single source of truth for site routes. Nav, menu overlay, and footer render
 * only routes with live: true. Flipping a page to live is the only step needed.
 */
export type NavRoute = {
  label: string;
  href: string;
  live: boolean;
  /** Shown in the desktop navbar. */
  primary?: boolean;
  /** Live and linkable, but not listed in the nav, menu, or footer. */
  unlisted?: boolean;
};

export const routes: NavRoute[] = [
  { label: "Home", href: "/", live: true },
  { label: "Manifesto", href: "/manifesto", live: true, primary: true },
  { label: "Chapters", href: "/chapters", live: true, primary: true },
  { label: "Chapter 001: Ascension", href: "/chapters/ascension", live: true, unlisted: true },
  { label: "Archive", href: "/archive", live: false, primary: true },
  { label: "Transmissions", href: "/transmissions", live: false },
  { label: "Artifacts", href: "/artifacts", live: false, primary: true },
  { label: "Collective", href: "/collective", live: false },
  { label: "Yearbook", href: "/yearbook", live: false },
  { label: "Enter the Circle", href: "/circle", live: false },
];

/** Legal routes: footer bottom row only. */
export const legalRoutes: NavRoute[] = [
  { label: "Privacy", href: "/privacy", live: false },
];

export const CIRCLE_HREF = "/circle";

export const liveRoutes = routes.filter((r) => r.live && !r.unlisted);
export const primaryRoutes = liveRoutes.filter((r) => r.primary);
export const liveLegalRoutes = legalRoutes.filter((r) => r.live);
export const circleRoute = liveRoutes.find((r) => r.href === CIRCLE_HREF);

export function isActive(pathname: string, href: string): boolean {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
}

/** True when the route exists in config and is live. Gate every CTA with this. */
export function isLive(href: string): boolean {
  return routes.some((r) => r.href === href && r.live) || legalRoutes.some((r) => r.href === href && r.live);
}
