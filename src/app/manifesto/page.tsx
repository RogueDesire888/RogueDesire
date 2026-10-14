import type { Metadata } from "next";
import { manifesto, type ManifestoBlock } from "@content/manifesto";
import { LaserGrid } from "@/components/atmosphere/LaserGrid";
import { Wordmark } from "@/components/brand/Wordmark";
import { ScrollProgress } from "@/components/manifesto/ScrollProgress";
import "@/components/manifesto/manifesto.css";
import { SignalCta } from "@/components/ui/SignalCta";
import { container, display } from "@/components/ui/styles";

export const metadata: Metadata = {
  title: "Manifesto",
  description: "We are architects of temporary realities. The Rogue Desire manifesto.",
};

/** Narrow centered column on mobile, left-aligned with an offset on desktop. */
const column = "mx-auto max-w-[36rem] md:mx-0 md:ml-[12%] md:max-w-none";

function StanzaLine({ line }: { line: string }) {
  const space = line.indexOf(" ");
  if (space === -1) return <span className="text-rd-white">{line}</span>;
  return (
    <>
      <span className="text-rd-white">{line.slice(0, space)}</span>
      <span className="text-rd-chrome">{line.slice(space)}</span>
    </>
  );
}

function Block({ block }: { block: Exclude<ManifestoBlock, { type: "opening" | "signoff" }> }) {
  switch (block.type) {
    case "statement":
      return <p className={`${display} max-w-[18ch] text-rd-white`}>{block.text}</p>;
    case "stanza":
      return (
        <p className="flex flex-col gap-3 text-[clamp(1.375rem,2.6vw,2.125rem)] leading-snug">
          {block.lines.map((line) => (
            <span key={line} className="block">
              <StanzaLine line={line} />
            </span>
          ))}
        </p>
      );
    case "paragraph":
      return (
        <p className="max-w-[60ch] text-lg leading-relaxed text-rd-chrome md:text-xl">{block.text}</p>
      );
  }
}

export default function ManifestoPage() {
  const opening = manifesto.find((b) => b.type === "opening");
  const signoff = manifesto.find((b) => b.type === "signoff");
  const body = manifesto.filter(
    (b): b is Exclude<ManifestoBlock, { type: "opening" | "signoff" }> =>
      b.type !== "opening" && b.type !== "signoff",
  );

  return (
    <div data-chapter="ascension">
      <ScrollProgress />

      <section className="relative isolate flex min-h-svh items-center justify-center overflow-hidden px-4">
        <div className="absolute inset-0 -z-10 opacity-30" aria-hidden="true">
          <LaserGrid />
        </div>
        {opening && (
          <h1
            className="rd-manifesto-opening max-w-[16ch] text-center text-[clamp(2.75rem,8vw,7.5rem)] leading-[1.02] font-medium tracking-[-0.02em] text-balance text-rd-white"
          >
            {opening.text}
          </h1>
        )}
      </section>

      <article className={`${container} pb-32 md:pb-48`}>
        <div className={`${column} flex flex-col gap-28 md:gap-44`}>
          {body.map((block, i) => (
            <Block key={i} block={block} />
          ))}
        </div>

        {signoff && (
          <footer className="mt-40 flex flex-col items-center text-center md:mt-56">
            <div className="w-32">
              <Wordmark size="sm" />
            </div>
            <p className="mt-8 text-xl text-rd-white md:text-2xl">{signoff.text}</p>
            <SignalCta className="mt-12" />
          </footer>
        )}
      </article>
    </div>
  );
}
