import type { Metadata } from "next";
import type { ReactNode } from "react";
import { manifesto, type ManifestoBlock } from "@content/manifesto";
import { Wordmark } from "@/components/brand/Wordmark";
import { ScrollProgress } from "@/components/manifesto/ScrollProgress";
import "@/components/manifesto/manifesto.css";
import { BeatWords, PinnedDissolve, PinnedSwap } from "@/components/motion/pinned";
import {
  FadeIn,
  GlitchResolve,
  LightSweep,
  NeonIgnite,
  RevealLines,
  ScrubWords,
} from "@/components/motion/primitives";
import { StanzaLine } from "@/components/motion/text";
import { SignalCta } from "@/components/ui/SignalCta";
import { container, display, stanza } from "@/components/ui/styles";

export const metadata: Metadata = {
  title: "Manifesto",
  description: "We are architects of temporary realities. The Rogue Desire manifesto.",
};

/** Narrow centered column on mobile, left-aligned with an offset on desktop. */
const column = "mx-auto max-w-[36rem] md:mx-0 md:ml-[12%] md:max-w-none";
const statementClass = `${display} max-w-[18ch] text-rd-white`;
const paragraphClass = "max-w-[60ch] text-lg leading-relaxed text-rd-chrome md:text-xl";

type BodyBlock = Exclude<ManifestoBlock, { type: "opening" | "signoff" }>;

/** "A. B." to ["A.", "B."]: splits after the first sentence without changing words. */
function splitFirstSentence(text: string): [string, string] {
  const i = text.indexOf(". ");
  return i === -1 ? [text, ""] : [text.slice(0, i + 1), text.slice(i + 2)];
}

function renderBlock(block: BodyBlock): ReactNode {
  switch (block.type) {
    case "statement": {
      if (block.motion === "scrubWords") return <ScrubWords text={block.text} className={statementClass} />;
      if (block.motion === "beatWords") return <BeatWords text={block.text} />;
      if (block.motion === "pinnedSwap") {
        const [a, b] = splitFirstSentence(block.text);
        return <PinnedSwap lineA={a} lineB={b} />;
      }
      if (block.motion === "pinnedDissolve") {
        const [fade, hold] = splitFirstSentence(block.text);
        return <PinnedDissolve fade={fade} hold={hold} />;
      }
      return <p className={statementClass}>{block.text}</p>;
    }
    case "stanza": {
      if (block.motion === "revealLines")
        return <RevealLines lines={block.lines} glowWords={block.glowWords} stagger={block.stagger} className={stanza} />;
      if (block.motion === "glitchResolve") return <GlitchResolve lines={block.lines} className={stanza} />;
      return (
        <p className={stanza}>
          {block.lines.map((line) => (
            <span key={line} className="block">
              <StanzaLine line={line} />
            </span>
          ))}
        </p>
      );
    }
    case "paragraph": {
      const p = <p className={paragraphClass}>{block.text}</p>;
      if (block.motion === "lightSweep")
        return (
          <LightSweep>
            <FadeIn delay={0.5}>{p}</FadeIn>
          </LightSweep>
        );
      return block.motion === "fadeIn" ? <FadeIn>{p}</FadeIn> : p;
    }
  }
}

export default function ManifestoPage() {
  const opening = manifesto.find((b) => b.type === "opening");
  const signoff = manifesto.find((b) => b.type === "signoff");
  const body = manifesto.filter((b): b is BodyBlock => b.type !== "opening" && b.type !== "signoff");

  return (
    <div data-chapter="ascension" className="overflow-x-clip">
      <ScrollProgress />

      <section data-cue={opening?.cue} className="relative flex min-h-svh items-center justify-center px-4">
        {opening && (
          <h1 className="rd-manifesto-opening max-w-[16ch] text-center font-display text-[clamp(3rem,8.5vw,8rem)] leading-[1.08] font-semibold tracking-[-0.005em] text-balance text-rd-white">
            {opening.text}
          </h1>
        )}
      </section>

      <article className={`${container} pb-32 md:pb-48`}>
        <div className={`${column} flex flex-col gap-28 md:gap-44`}>
          {body.map((block, i) => (
            <div key={i} data-cue={block.cue} data-fog-cap>
              {renderBlock(block)}
            </div>
          ))}
        </div>

        {signoff && (
          <footer data-cue={signoff.cue} data-fog-cap className="mt-40 flex flex-col items-center text-center md:mt-56">
            {signoff.motion === "neonIgnite" ? (
              <NeonIgnite className="w-32">
                <Wordmark size="sm" />
              </NeonIgnite>
            ) : (
              <div className="w-32">
                <Wordmark size="sm" />
              </div>
            )}
            <FadeIn delay={0.8} className="flex flex-col items-center">
              <p className="mt-8 font-display text-3xl leading-[1.08] font-semibold text-rd-white md:text-4xl">{signoff.text}</p>
              <SignalCta className="mt-12" />
            </FadeIn>
          </footer>
        )}
      </article>
    </div>
  );
}
