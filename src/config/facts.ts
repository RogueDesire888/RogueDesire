import "server-only";

/**
 * Unconfirmed or not-yet-public facts. Server-only: importing this from a
 * client component fails the build, so these values never reach the browser
 * bundle. Unconfirmed values are null and never render; gate everything with
 * publicValue() from ./site.
 */
export const facts = {
  city: "Greenville, SC",
  cityPublic: false,
  legalName: null as string | null,
  contactEmail: null as string | null,
} as const;
