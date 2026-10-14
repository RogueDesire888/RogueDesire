import type { ReactNode } from "react";
import { Button } from "@/components/ui/Button";
import { Redaction } from "@/components/ui/Redaction";
import { Reveal } from "@/components/ui/Reveal";
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
    <section data-cue="fog" data-fog-cap className={`${container} ${screen}`}>
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
    </section>
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
    <section data-cue="fog" data-fog-cap aria-label="The rules" className={container}>
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
    </section>
  );
}

export function ChapterDossier() {
  const chapter = getNextChapter();
  if (!chapter) return null;

  const href = `/chapters/${chapter.slug}`;
  const location = [chapter.venue, chapter.city].filter(isPublic).join(", ");
  const frequencies = chapter.frequencies.map((f) => f.name).join(", ");
  const dateLabel = isPublic(chapter.date)
    ? new Date(`${chapter.date}T12:00:00`).toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : null;

  const rows: { label: string; value: ReactNode | null }[] = [
    { label: "Date", value: dateLabel },
    { label: "Location", value: isPublic(location) ? location : null },
    { label: "Frequencies", value: isPublic(frequencies) ? frequencies : null },
    {
      label: "Access",
      value: isPublic(chapter.ticketUrl) ? (
        <a href={chapter.ticketUrl} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4">
          Tickets
        </a>
      ) : null,
    },
  ];

  return (
    <section
      data-fog-cap
      data-cue="lasers"
      data-chapter={chapter.slug}
      aria-labelledby="dossier-title"
      className={`${container} ${screen}`}
    >
      <Reveal className="flex flex-col items-start">
        <p className="text-xs tracking-[0.35em] text-rd-chrome">{chapter.code}</p>
        <h2
          id="dossier-title"
          className="mt-8 max-w-full font-display text-[clamp(3.5rem,12vw,9rem)] leading-[1.08] font-semibold tracking-[-0.005em] text-rd-white rd-text-glow"
        >
          {chapter.title}
        </h2>
        <p className="mt-8 text-2xl text-rd-white md:text-3xl">{chapter.line}</p>
        {isPublic(chapter.description) && (
          <p className="mt-6 max-w-[60ch] leading-relaxed text-rd-chrome">{chapter.description}</p>
        )}

        <dl className={`mt-14 w-full max-w-[720px] border-b ${hairline}`}>
          {rows.map((row) => (
            <div
              key={row.label}
              className={`grid grid-cols-[6.5rem_1fr] items-center gap-4 border-t ${hairline} py-4 sm:grid-cols-[10rem_1fr]`}
            >
              <dt className="text-sm text-rd-chrome">{row.label}</dt>
              <dd className="flex min-w-0 items-center gap-4 text-rd-white">
                {row.value ?? (
                  <>
                    <Redaction seed={`${chapter.code}-${row.label}`} />
                    <span className="shrink-0 text-sm whitespace-nowrap text-rd-chrome">Undisclosed</span>
                  </>
                )}
              </dd>
            </div>
          ))}
        </dl>
        <p className="mt-6 text-sm text-rd-chrome">Details surface when the signal is ready.</p>

        {isLive(href) && (
          <div className="mt-10">
            <Button href={href}>Enter Chapter {chapter.number}</Button>
          </div>
        )}
      </Reveal>
    </section>
  );
}

export function FutureRealities() {
  const concepts = getConceptListing();
  if (concepts.length === 0) return null;

  return (
    <section data-cue="fog" data-fog-cap aria-labelledby="future-title" className={`${container} py-24 md:py-32`}>
      <h2 id="future-title" className="font-display text-3xl leading-[1.08] font-semibold text-rd-white md:text-4xl">
        Future realities
      </h2>
      <ul className={`mt-8 border-b ${hairline}`}>
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
      </ul>
      <p className="mt-6 text-sm text-rd-chrome">Each reality is revealed when it is ready.</p>
    </section>
  );
}

export function Closing() {
  return (
    <section data-cue="flare" data-fog-cap className={`${container} ${screen} flex flex-col items-center text-center`}>
      <p className={`${display} max-w-[18ch] text-rd-white`}>
        The crowd is not an audience. The crowd is the artwork.
      </p>
      <p className="mt-8 max-w-[40ch] font-display text-2xl leading-[1.25] font-semibold text-rd-chrome md:text-3xl">
        Enter with curiosity. Leave with a story. Keep the evidence.
      </p>
      <SignalCta className="mt-12" />
    </section>
  );
}
