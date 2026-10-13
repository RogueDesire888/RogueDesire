import fs from "node:fs";
import path from "node:path";

/**
 * The single swap point for the Rogue Desire wordmark.
 * When public/brand/wordmark.svg exists it is rendered; otherwise a
 * temporary neon-outline placeholder set in the placeholder font.
 *
 * The full home hero artwork lives in public/brand/hero-ascension.png and is
 * rendered by the home page, not here. This text version stays for small uses
 * (nav, footer) until a separate compact wordmark asset is delivered.
 * TODO: a compact wordmark asset (SVG, legible at nav size) is still needed.
 */
const WORDMARK_SRC = "/brand/wordmark.svg";
const hasWordmarkSvg = fs.existsSync(
  path.join(process.cwd(), "public", WORDMARK_SRC),
);

type WordmarkProps = {
  className?: string;
};

export function Wordmark({ className = "" }: WordmarkProps) {
  if (hasWordmarkSvg) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- static SVG, no optimization needed
      <img
        src={WORDMARK_SRC}
        alt="Rogue Desire"
        className={`h-auto w-full max-w-4xl ${className}`}
      />
    );
  }

  return (
    <span
      role="img"
      aria-label="Rogue Desire"
      className={`font-mark block text-center uppercase leading-[0.9] ${className}`}
      style={{
        color: "transparent",
        WebkitTextStroke: "1.5px var(--rd-white)",
        textShadow:
          "0 0 1px var(--accent-glow), 0 0 10px color-mix(in srgb, var(--accent-glow) 55%, transparent), 0 0 32px color-mix(in srgb, var(--accent) 45%, transparent)",
      }}
    >
      <span aria-hidden="true" className="block md:inline">
        Rogue
      </span>{" "}
      <span aria-hidden="true" className="block md:inline">
        Desire
      </span>
    </span>
  );
}
