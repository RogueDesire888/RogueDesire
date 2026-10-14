/**
 * Public, client-safe site config: client components import this, so it ships
 * in the browser bundle. Unconfirmed or private facts live in ./facts.ts
 * (server-only) and must never be added here.
 */

export type SitePhase = "signal" | "reveal" | "access" | "archive";

export const SITE_PHASE: SitePhase = "signal";

export const site = {
  name: "Rogue Desire",
  tagline: "Architects of Temporary Realities.",
  description:
    "A nightlife universe built through sound, atmosphere, memory, and desire.",
  url: "https://roguedesire.com",
  instagram: "roguedesireofficial",
  /** Pulse engine tempo. Capped at 180 (3 pulses per second) by the engine. */
  bpm: 128,
} as const;

/**
 * Returns the value only when it is confirmed and public.
 * Use for every optional fact: `publicValue(facts.contactEmail)`,
 * `publicValue(facts.city, facts.cityPublic)`.
 */
export function publicValue<T>(
  value: T | null | undefined,
  isPublic = true,
): T | null {
  if (!isPublic || value === null || value === undefined) return null;
  if (typeof value === "string" && value.trim() === "") return null;
  return value;
}

export const instagramUrl = `https://instagram.com/${site.instagram}`;
