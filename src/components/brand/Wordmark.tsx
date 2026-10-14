import Image from "next/image";
import wordmarkLg from "../../../public/brand/wordmark.webp";
import wordmarkSm from "../../../public/brand/wordmark-sm.webp";

/**
 * The single swap point for the Rogue Desire wordmark.
 * "sm" (480px source) for nav and footer; "lg" (full source) for large uses.
 * The home hero renders the large asset with its spin treatment.
 */
type WordmarkProps = {
  size?: "sm" | "lg";
  className?: string;
  sizes?: string;
  priority?: boolean;
};

export function Wordmark({ size = "sm", className = "", sizes, priority = false }: WordmarkProps) {
  return (
    <Image
      src={size === "sm" ? wordmarkSm : wordmarkLg}
      alt="Rogue Desire"
      sizes={sizes ?? (size === "sm" ? "160px" : "100vw")}
      priority={priority}
      className={`h-auto w-full ${className}`}
    />
  );
}
