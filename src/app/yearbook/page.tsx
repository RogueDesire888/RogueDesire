import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import { FadeIn } from "@/components/motion/primitives";
import { PinnedDissolve } from "@/components/motion/pinned";
import { YearbookBook } from "@/components/objects/YearbookBook";
import { SignalCta } from "@/components/ui/SignalCta";
import { container } from "@/components/ui/styles";

export const metadata: Metadata = pageMeta({
  title: "Yearbook",
  description: "A visual archive of temporary realities. Every chapter in Year One will be preserved inside the first Rogue Desire yearbook.",
  path: "/yearbook",
});

const body = "max-w-[60ch] text-lg leading-relaxed text-rd-chrome md:text-xl";
const heading = "font-display text-4xl leading-[1.08] font-semibold text-rd-white md:text-6xl";

export default function YearbookPage() {
  return (
    <div data-chapter="ascension" className="overflow-x-clip">
      <h1 className="sr-only">Yearbook</h1>
      <section data-cue="lasers" aria-label="Year One: Awakening, the book" className={`${container} pt-16`}>
        <YearbookBook />
      </section>

      <section data-cue="fog" data-fog-cap aria-labelledby="yearbook-title" className={`${container} py-24 md:py-36`}>
        <h2 id="yearbook-title" className={heading}>
          Year One: Awakening
        </h2>
        <p className="mt-4 text-xl text-rd-white md:text-2xl">A visual archive of temporary realities.</p>
        <FadeIn className="mt-10">
          <p className={body}>
            Every chapter in Year One will be preserved inside the first Rogue Desire yearbook. This book will document the
            events, artists, witnesses, artifacts, fashion, atmosphere, and emotional architecture of the first era.
          </p>
        </FadeIn>
        <div className="mt-24 md:mt-32">
          <PinnedDissolve fade="The year is temporary." hold="The archive is not." />
        </div>
      </section>

      <section data-cue="flare" data-fog-cap aria-labelledby="editions-title" className={`${container} flex flex-col items-start py-24 md:py-36`}>
        <h2 id="editions-title" className={heading}>
          Collector editions
        </h2>
        <p className="mt-3 font-sans text-sm text-rd-chrome">Status: in development</p>
        <FadeIn className="mt-8">
          <p className={body}>Editions, formats, and release details will be announced to the Circle.</p>
        </FadeIn>
        <SignalCta className="mt-14 self-center" />
      </section>
    </div>
  );
}
