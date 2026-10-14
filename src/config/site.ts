/** Site-wide facts. Unconfirmed values are null and never render. */

export type SitePhase = "signal" | "reveal" | "access" | "archive";

export const SITE_PHASE: SitePhase = "signal";

export const site = {
  name: "Rogue Desire",
  tagline: "Architects of Temporary Realities.",
  description:
    "A nightlife universe built through sound, atmosphere, memory, and desire.",
  url: "https://roguedesire.com",
  instagram: "roguedesireofficial",
  city: "Greenville, SC",
  cityPublic: false,
  /** Pulse engine tempo. Capped at 180 (3 pulses per second) by the engine. */
  bpm: 128,
  legalName: null as string | null,
  contactEmail: null as string | null,
} as const;

/**
 * Returns the value only when it is confirmed and public.
 * Use for every optional fact: `publicValue(site.contactEmail)`,
 * `publicValue(site.city, site.cityPublic)`.
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
