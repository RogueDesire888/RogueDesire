/** Stable width between 6rem and 12rem derived from a seed string. */
function seededWidth(seed: string): number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return 6 + ((h >>> 0) % 601) / 100;
}

/** Solid redaction bar. Decorative: pair it with real text such as "Undisclosed". */
export function Redaction({ seed, className = "" }: { seed: string; className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={`inline-block h-[1.1em] min-w-12 max-w-full shrink rounded-[3px] bg-rd-charcoal align-middle ${className}`}
      style={{
        width: `${seededWidth(seed).toFixed(2)}rem`,
        boxShadow:
          "0 0 0 1px color-mix(in srgb, var(--accent) 28%, transparent), 0 0 12px color-mix(in srgb, var(--accent) 18%, transparent)",
      }}
    />
  );
}
