import { Button } from "@/components/ui/Button";
import { Redaction } from "@/components/ui/Redaction";
import { Reveal } from "@/components/ui/Reveal";
import { Disclosure } from "@/components/chapter/Disclosure";
import { DropStage } from "@/components/motion/DropStage";
import { FadeInStagger } from "@/components/motion/primitives";
import { SetZone } from "@/components/motion/SetZone";
import { SignalCta } from "@/components/ui/SignalCta";
import { container, display } from "@/components/ui/styles";
import { isLive } from "@/config/nav";
import { getConceptListing, getNextChapter, isPublic } from "@/lib/content";

const MANIFESTO_HREF = "/manifesto";

/** Each major statement gets roughly its own screen on desktop. */
const screen = "py-24 md:flex md:min-h-[70vh] md:flex-col md:justify-center md:py-28";
const hairline = "border-rd-chrome/20";

export function Intro() {
  return (
    <SetZone data-cue="fog" data-fog-cap intensity={1} className={`${container} ${screen}`}>
      <h2 className={`${display} max-w-[16ch] text-rd-white`}>
        We do not organize parties.
        <Reveal as="span" variant="fade" delay={600} className="block text-rd-chrome">
          We construct emotional architecture.
        </Reveal>
      </h2>
      <p className="mt-10 max-w-[48ch] text-rd-chrome">
        Rogue Desire is an electronic music experience told in chapters. Each one is built for a
        single night, then it’s gone.
      </p>
      {isLive(MANIFESTO_HREF) && (
        <div className="mt-10">
          <Button href={MANIFESTO_HREF} variant="secondary">
            Read the Manifesto
          </Button>
        </div>
      )}
    </SetZone>
  );
}

const RULES = [
  {
    numeral: "I",
    statement: "Every chapter happens once.",
    supporting: "One night. One world. When the lights come up, it’s gone.",
  },
  {
    numeral: "II",
    statement: "The object remembers.",
    supporting: "Each chapter leaves a numbered Artifact for the people who were there.",
  },
  {
    numeral: "III",
    statement: "The archive begins.",
    supporting: "Photographs, film, and an annual Yearbook. Proof it happened.",
  },
];

export function Rules() {
  return (
    <SetZone data-cue="build" data-fog-cap intensity={[0.3, 1]} aria-label="The rules" className={container}>
      <ol>
        {RULES.map((rule) => (
          <li key={rule.numeral} className={screen}>
            <span aria-hidden="true" className="text-sm tracking-[0.2em] text-rd-chrome">
              {rule.numeral}
            </span>
            <h3 className={`${display} mt-6 max-w-[14ch] text-rd-white`}>{rule.statement}</h3>
            <p className="mt-6 max-w-[48ch] text-rd-chrome">{rule.supporting}</p>
          </li>
        ))}
      </ol>
    </SetZone>
  );
}

export function ChapterDossier() {
  const chapter = getNextChapter();
  if (!chapter) return null;

  const href = `/chapters/${chapter.slug}`;
  return (
    <section
      data-fog-cap
      data-cue="lasers"
      data-chapter={chapter.slug}
      aria-labelledby="dossier-title"
      className={container}
    >
      <DropStage className="flex flex-col justify-center py-24 md:min-h-svh md:py-10">
        <div data-drop-shake className="flex flex-col items-start">
          <p data-drop="seal" className="text-xs tracking-[0.35em] text-rd-chrome">{chapter.code}</p>
          <h2
            id="dossier-title"
            data-drop="title"
            className="mt-6 max-w-full font-display text-[clamp(3.5rem,12vw,9rem)] leading-[1.08] font-semibold tracking-[-0.005em] text-rd-white rd-text-glow"
          >
            {chapter.title}
          </h2>
          <p data-drop="line" className="mt-6 text-2xl text-rd-white md:text-3xl">{chapter.line}</p>
          {isPublic(chapter.description) && (
            <p data-drop="desc" className="mt-5 max-w-[60ch] leading-relaxed text-rd-chrome">{chapter.description}</p>
          )}

          <Disclosure chapter={chapter} drop />

          {isLive(href) && (
            <div data-drop="cta" className="mt-8">
              <Button href={href}>Enter Chapter {chapter.number}</Button>
            </div>
          )}
        </div>
      </DropStage>
    </section>
  );
}

export function FutureRealities() {
  const concepts = getConceptListing();
  if (concepts.length === 0) return null;

  return (
    <SetZone data-cue="fog" data-fog-cap intensity={0.15} aria-labelledby="future-title" className={`${container} py-24 md:py-32`}>
      <h2 id="future-title" className="font-display text-3xl leading-[1.08] font-semibold text-rd-white md:text-4xl">
        Future realities
      </h2>
      <FadeInStagger className={`mt-8 border-b ${hairline}`}>
        {concepts.map((c) =>
          c.revealed ? (
            <li
              key={c.number}
              data-chapter={c.slug}
              className={`flex flex-col gap-1 border-t ${hairline} py-5 sm:flex-row sm:items-baseline sm:gap-8`}
            >
              <span className="w-12 shrink-0 text-sm text-accent">{c.number}</span>
              <h3 className="font-display text-3xl leading-[1.08] font-semibold text-accent sm:w-64 sm:shrink-0">
                {c.title}
              </h3>
              <p className="text-rd-chrome">{c.line}</p>
            </li>
          ) : (
            <li
              key={c.number}
              className={`flex flex-col gap-2 border-t ${hairline} py-5 sm:flex-row sm:items-center sm:gap-8`}
            >
              <span className="w-12 shrink-0 text-sm text-rd-chrome">{c.number}</span>
              <span className="flex items-center sm:w-64 sm:shrink-0">
                <Redaction seed={`concept-${c.number}`} />
              </span>
              <p className="text-sm text-rd-chrome">Classified</p>
            </li>
          ),
        )}
      </FadeInStagger>
      <p className="mt-6 text-sm text-rd-chrome">Each reality is revealed when it is ready.</p>
    </SetZone>
  );
}

export function Closing() {
  return (
    <SetZone data-cue="flare" data-fog-cap intensity={0.4} burstOnEnter={0.4} className={`${container} ${screen} flex flex-col items-center text-center`}>
      <p className={`${display} max-w-[18ch] text-rd-white`}>
        The crowd is not an audience. The crowd is the artwork.
      </p>
      <p className="mt-8 max-w-[40ch] font-display text-2xl leading-[1.25] font-semibold text-rd-chrome md:text-3xl">
        Enter with curiosity. Leave with a story. Keep the evidence.
      </p>
      <SignalCta className="mt-12" />
    </SetZone>
  );
}
