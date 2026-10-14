import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import { notFound } from "next/navigation";
import { Disclosure } from "@/components/chapter/Disclosure";
import { NightArc } from "@/components/chapter/NightArc";
import { Marquee } from "@/components/motion/Marquee";
import { BeatWords } from "@/components/motion/pinned";
import { FadeIn, FadeInStagger, NeonIgnite, RevealLines, ScrubWords } from "@/components/motion/primitives";
import { Button } from "@/components/ui/Button";
import { Redaction } from "@/components/ui/Redaction";
import { SignalCta } from "@/components/ui/SignalCta";
import { container, display, stanza } from "@/components/ui/styles";
import { isLive } from "@/config/nav";
import { getChapter, getChapterArtifacts, getFrequencies, isPublic } from "@/lib/content";

const SLUG = "ascension";
const section = `${container} py-24 md:py-40`;
const heading = "font-display text-4xl leading-[1.08] font-semibold text-rd-white md:text-6xl";
const body = "max-w-[60ch] text-lg leading-relaxed text-rd-chrome md:text-xl";

export function generateMetadata(): Metadata {
  const chapter = getChapter(SLUG);
  if (!chapter) return {};
  const firstSentence = chapter.opening?.[0]?.split(/(?<=\.)\s/)[0] ?? "";
  return pageMeta({
    title: `Chapter ${chapter.number}: ${chapter.title}`,
    description: [chapter.line, firstSentence].filter(Boolean).join(" "),
    path: `/chapters/${chapter.slug}`,
  });
}

export default function AscensionPage() {
  const chapter = getChapter(SLUG);
  if (!chapter) notFound();
  const artifact = getChapterArtifacts(chapter.slug)[0];

  return (
    <div data-chapter={chapter.slug} className="overflow-x-clip">
      {/* 1. Hero */}
      <section data-cue="lasers" data-fog-cap className={`${container} flex min-h-svh flex-col justify-center pt-28 pb-20`}>
        <p className="text-xs tracking-[0.35em] text-rd-chrome">{chapter.code}</p>
        <p className="mt-8 text-sm tracking-[0.08em] text-rd-chrome">Chapter {chapter.number}</p>
        <NeonIgnite className="mt-2">
          <h1 className="rd-text-glow font-display text-[clamp(4.5rem,16vw,12rem)] leading-[1.08] font-semibold tracking-[-0.005em] text-rd-white">
            {chapter.title}
          </h1>
        </NeonIgnite>
        <p className="mt-6 text-2xl text-rd-white md:text-3xl">{chapter.line}</p>
        <p className="mt-4 text-sm text-rd-chrome">{chapter.era}</p>
      </section>

      {/* 2. Opening */}
      <section data-cue="fog" data-fog-cap className={section}>
        {chapter.opening?.[0] && (
          <p className={`${display} max-w-[22ch] text-rd-white`}>{chapter.opening[0]}</p>
        )}
        {chapter.opening?.slice(1).map((paragraph) => (
          <FadeIn key={paragraph} className="mt-12">
            <p className={body}>{paragraph}</p>
          </FadeIn>
        ))}
        {isPublic(chapter.closingLine) && (
          <ScrubWords text={chapter.closingLine} className={`${display} mt-24 max-w-[18ch] text-rd-white md:mt-32`} />
        )}
      </section>

      {/* 3. Meaning */}
      {chapter.meaning && chapter.meaning.length > 0 && (
        <section data-cue="lasers" data-fog-cap aria-label="Meaning" className={container}>
          <BeatWords text={chapter.meaning.join(" ")} />
        </section>
      )}

      {/* 4. Inside Ascension */}
      {chapter.elements && (
        <section data-cue="fog" data-fog-cap aria-labelledby="inside-title" className={section}>
          <h2 id="inside-title" className={heading}>
            Inside {chapter.title}
          </h2>
          <FadeInStagger blur stagger={0.12} duration={0.9} className="mt-12 border-b border-rd-chrome/20">
            {chapter.elements.map((element) => (
              <li
                key={element.name}
                className="grid gap-3 border-t border-rd-chrome/20 py-8 md:grid-cols-12 md:items-center md:gap-8"
              >
                <h3 className="flex items-center gap-4 font-display text-4xl leading-[1.08] font-semibold text-rd-white md:col-span-4 md:text-5xl">
                  <span
                    aria-hidden="true"
                    className="size-4 shrink-0 rounded-full border border-rd-chrome/30"
                    style={{
                      background: `var(${element.token})`,
                      boxShadow: `0 0 16px color-mix(in srgb, var(${element.token}) 60%, transparent)`,
                    }}
                  />
                  {element.name}
                </h3>
                <p className="max-w-[48ch] text-lg text-rd-chrome md:col-span-8">{element.line}</p>
              </li>
            ))}
          </FadeInStagger>
        </section>
      )}

      {/* 5. The night */}
      {chapter.nightArc && (
        <section data-cue="fog" data-fog-cap aria-labelledby="night-title" className={container}>
          <NightArc className="flex flex-col justify-center py-24 md:min-h-svh md:py-16">
            <h2 id="night-title" className={heading}>
              The night
            </h2>
            <ol className="mt-12 grid gap-12 md:grid-cols-4 md:gap-8">
              {chapter.nightArc.map((phase) => {
                const names = getFrequencies(chapter.slug, phase.role).map((f) => f.name);
                return (
                  <li key={phase.role} data-phase className="flex flex-col gap-3 border-t border-rd-chrome/20 pt-6">
                    <h3 className="font-display text-4xl leading-[1.08] font-semibold text-rd-white">{phase.name}</h3>
                    <p className="text-rd-chrome">{phase.mood}</p>
                    <p className="text-rd-white">{phase.line}</p>
                    <p className="mt-4 text-sm text-rd-chrome">Frequency</p>
                    {names.length > 0 ? (
                      <p className="text-rd-white">{names.join(", ")}</p>
                    ) : (
                      <p className="flex items-center gap-3">
                        <Redaction seed={`${chapter.code}-${phase.role}`} className="!w-24" />
                        <span className="text-sm text-rd-chrome">Undisclosed</span>
                      </p>
                    )}
                  </li>
                );
              })}
            </ol>
          </NightArc>
        </section>
      )}

      {/* 6. Sound */}
      {chapter.soundDirection && (
        <section data-cue="fog" data-fog-cap aria-labelledby="sound-title" className={section}>
          <h2 id="sound-title" className={heading}>
            Sound
          </h2>
          <FadeIn className="mt-10">
            <p className="max-w-[30ch] font-display text-[clamp(1.75rem,3.5vw,3rem)] leading-[1.15] font-semibold text-rd-white">
              {chapter.soundDirection.line}
            </p>
            <p className="mt-6 text-sm text-rd-chrome">{chapter.soundDirection.genres}</p>
          </FadeIn>
        </section>
      )}

      {/* 7. Artifact */}
      {artifact && (
        <section data-cue="fog" data-fog-cap aria-labelledby="artifact-title" className={section}>
          <h2 id="artifact-title" className={heading}>
            {artifact.name}
          </h2>
          {isPublic(artifact.subtitle) && <p className="mt-4 text-xl text-rd-white md:text-2xl">{artifact.subtitle}</p>}
          {isPublic(artifact.line) && <p className={`${display} mt-12 max-w-[18ch] text-rd-white`}>{artifact.line}</p>}
          {isPublic(artifact.lore) && (
            <FadeIn className="mt-10">
              <p className={body}>{artifact.lore}</p>
            </FadeIn>
          )}
          {isLive("/artifacts") && (
            <Button href="/artifacts" variant="secondary" className="mt-10">
              View Artifacts
            </Button>
          )}
        </section>
      )}

      {/* 8. Style direction */}
      {chapter.styleDirection && (
        <section data-cue="lasers" data-fog-cap aria-label="Style direction">
          <div className={`${section} flex flex-col gap-10 md:gap-16`}>
            {chapter.styleDirection.lines.map((line) => (
              <p key={line} className={`${display} max-w-[18ch] text-rd-white`}>
                {line}
              </p>
            ))}
          </div>
          <Marquee items={chapter.styleDirection.words} cue="lasers" />
        </section>
      )}

      {/* 9. Guest code */}
      {chapter.guestCode && (
        <section data-cue="fog" data-fog-cap aria-labelledby="guest-title" className={section}>
          <h2 id="guest-title" className={heading}>
            Guest code
          </h2>
          {isPublic(chapter.guestCodeIntro) && <p className="mt-6 text-rd-chrome">{chapter.guestCodeIntro}</p>}
          <RevealLines lines={chapter.guestCode} className={`${stanza} mt-10`} />
          <p className={`${display} mt-24 max-w-[18ch] text-rd-white md:mt-32`}>
            The crowd is not an audience. The crowd is the artwork.
          </p>
        </section>
      )}

      {/* 10. Access */}
      <section data-cue="flare" data-fog-cap aria-label="Access" className={`${section} flex flex-col items-start`}>
        <Disclosure chapter={chapter} />
        <SignalCta className="mt-14 self-center" />
      </section>
    </div>
  );
}
