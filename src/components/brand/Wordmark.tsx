import Image from "next/image";
import wordmark from "../../../public/brand/wordmark.webp";

/**
 * The single swap point for the Rogue Desire wordmark (nav, footer, small uses).
 * Source: public/brand/wordmark.webp, transparent violet neon outline lettering.
 * The home hero renders the same asset with its spin treatment.
 */
type WordmarkProps = {
  className?: string;
  sizes?: string;
  priority?: boolean;
};

export function Wordmark({ className = "", sizes = "240px", priority = false }: WordmarkProps) {
  return (
    <Image
      src={wordmark}
      alt="Rogue Desire"
      sizes={sizes}
      priority={priority}
      className={`h-auto w-full ${className}`}
    />
  );
}
