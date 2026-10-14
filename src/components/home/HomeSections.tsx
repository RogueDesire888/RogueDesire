import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { CIRCLE_HREF, isLive } from "@/config/nav";
import { instagramUrl, site } from "@/config/site";
import { getConceptChapters, getNextChapter, isPublic } from "@/lib/content";

const container = "mx-auto w-full max-w-[1200px] px-4 md:px-8";
const sectionSpace = "py-28 md:py-40";
const hairline = "border-rd-chrome/20";

export function Intro() {
  return (
    <section className={`${container} ${sectionSpace}`}>
      <div className="grid gap-10 md:grid-cols-12">
        <h2 className="text-balance text-3xl font-medium leading-tight text-rd-white sm:text-4xl md:col-span-8 md:text-5xl">
          We do not organize parties. We construct emotional architecture.
        </h2>
        <p className="max-w-[65ch] text-lg leading-relaxed text-rd-chrome md:col-span-6 md:col-start-7">
          Rogue Desire is a chapter-based electronic music experience. Each night is a fully designed
          world: sound, light, space, and the people inside it. When it ends, the evidence remains.
        </p>
      </div>
    </section>
  );
}

const PILLARS = [
  {
    number: "01",
    title: "The Chapter",
    line: "One night. One world. Built once, never repeated.",
    supporting: null,
  },
  {
    number: "02",
    title: "The Artifact",
    line: "The night disappears. The object remembers.",
    supporting:
      "Every chapter leaves behind a numbered, collectible object for the people who were there.",
  },
  {
    number: "03",
    title: "The Archive",
    line: "The event ends. The archive begins.",
    supporting: "Photographs, film, and an annual yearbook make each night permanent.",
  },
];

export function Pillars() {
  return (
    <section aria-label="The Chapter, the Artifact, the Archive" className={container}>
      <ol className={`border-b ${hairline}`}>
        {PILLARS.map((p) => (
          <li
            key={p.number}
            className={`grid gap-4 border-t ${hairline} py-12 md:grid-cols-12 md:gap-8 md:py-16`}
          >
            <span aria-hidden="true" className="text-sm text-rd-chrome md:col-span-1 md:pt-2">
              {p.number}
            </span>
            <h3 className="text-2xl font-medium text-rd-white md:col-span-4 md:text-3xl">{p.title}</h3>
            <div className="flex max-w-[65ch] flex-col gap-3 md:col-span-7">
              <p className="text-xl leading-snug text-rd-white md:text-2xl">{p.line}</p>
              {isPublic(p.supporting) && (
                <p className="leading-relaxed text-rd-chrome">{p.supporting}</p>
              )}
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

export function NextChapter() {
  const chapter = getNextChapter();
  if (!chapter) return null;

  const href = `/chapters/${chapter.slug}`;
  const city = isPublic(chapter.city) ? chapter.city : null;
  const details = [
    { label: "Date", value: chapter.date },
    { label: "Venue", value: chapter.venue },
    { label: "City", value: city },
  ].filter((d): d is { label: string; value: string } => isPublic(d.value));

  return (
    <section
      data-chapter={chapter.slug}
      aria-labelledby="next-chapter-title"
      className={`${container} ${sectionSpace}`}
    >
      <Reveal className="flex flex-col items-start gap-6">
        <p className="text-sm tracking-[0.08em] text-rd-chrome">Chapter {chapter.number}</p>
        <h2
          id="next-chapter-title"
          className="font-title text-4xl font-bold tracking-[0.18em] text-rd-white uppercase sm:text-6xl md:text-8xl"
          style={{
            textShadow:
              "0 0 12px color-mix(in srgb, var(--accent-glow) 60%, transparent), 0 0 40px color-mix(in srgb, var(--accent) 45%, transparent)",
          }}
        >
          {chapter.title}
        </h2>
        <p className="text-2xl text-rd-white md:text-3xl">{chapter.line}</p>
        {isPublic(chapter.description) && (
          <p className="max-w-[65ch] text-lg leading-relaxed text-rd-chrome">{chapter.description}</p>
        )}
        <p className="text-rd-chrome">{chapter.element}</p>

        {details.length > 0 && (
          <dl className={`grid gap-x-10 gap-y-3 border-t ${hairline} pt-6 sm:grid-cols-3`}>
            {details.map((d) => (
              <div key={d.label}>
                <dt className="text-sm text-rd-chrome">{d.label}</dt>
                <dd className="text-rd-white">{d.value}</dd>
              </div>
            ))}
          </dl>
        )}

        {(isLive(href) || isPublic(chapter.ticketUrl)) && (
          <div className="mt-4 flex flex-wrap gap-4">
            {isLive(href) && <Button href={href}>Enter Chapter {chapter.number}</Button>}
            {isPublic(chapter.ticketUrl) && (
              <Button href={chapter.ticketUrl} variant="secondary" target="_blank" rel="noopener noreferrer">
                Tickets
              </Button>
            )}
          </div>
        )}
      </Reveal>
    </section>
  );
}

export function FutureRealities() {
  const concepts = getConceptChapters();
  if (concepts.length === 0) return null;

  return (
    <section aria-labelledby="future-title" className={`${container} pb-28 md:pb-40`}>
      <h2 id="future-title" className="text-lg font-medium text-rd-white">
        Future realities
      </h2>
      <ul className={`mt-8 border-b ${hairline}`}>
        {concepts.map((c) => (
          <li
            key={c.slug}
            data-chapter={c.slug}
            className={`flex flex-col gap-1 border-t ${hairline} py-5 sm:flex-row sm:items-baseline sm:gap-8`}
          >
            <span className="w-12 shrink-0 text-sm text-accent">{c.number}</span>
            <h3 className="font-title text-lg font-bold tracking-[0.16em] text-accent uppercase sm:w-64 sm:shrink-0">
              {c.title}
            </h3>
            <p className="text-rd-chrome">{c.line}</p>
          </li>
        ))}
      </ul>
      <p className="mt-6 text-sm text-rd-chrome">
        Concepts in development. Each reality is revealed when it is ready.
      </p>
    </section>
  );
}

export function Closing() {
  const circleLive = isLive(CIRCLE_HREF);

  return (
    <section className={`${container} ${sectionSpace} flex flex-col items-center text-center`}>
      <p className="max-w-[24ch] text-balance text-3xl font-medium leading-tight text-rd-white sm:text-4xl md:text-5xl">
        The crowd is not an audience. The crowd is the artwork.
      </p>
      <p className="mt-6 max-w-[65ch] text-lg text-rd-chrome">
        Enter with curiosity. Leave with a story. Keep the evidence.
      </p>
      <div className="mt-12 flex flex-col items-center gap-3">
        {circleLive ? (
          <Button href={CIRCLE_HREF}>Enter the Circle</Button>
        ) : (
          <>
            <Button href={instagramUrl} target="_blank" rel="noopener noreferrer">
              Follow the signal
            </Button>
            <span className="text-sm text-rd-chrome">@{site.instagram}</span>
          </>
        )}
      </div>
    </section>
  );
}
