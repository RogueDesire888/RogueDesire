import type { Metadata } from "next";
import { FadeInStagger } from "@/components/motion/primitives";
import { Button } from "@/components/ui/Button";
import { Redaction } from "@/components/ui/Redaction";
import { container } from "@/components/ui/styles";
import { isLive } from "@/config/nav";
import { getConceptListing, getNextChapter } from "@/lib/content";

export const metadata: Metadata = { title: "Chapters" };

const SYMBOLS = [
  { name: "Lightning", meaning: "Emotional ignition, energy, awakening." },
  { name: "Chrome", meaning: "Reflection, futurism, identity distortion, luxury." },
  { name: "Violet Glow", meaning: "Altered states, mystical nightlife, emotional immersion." },
  { name: "Black Void", meaning: "Mystery, the unknown, sacred negative space." },
];

const hairline = "border-rd-chrome/20";

export default function ChaptersPage() {
  const next = getNextChapter();
  const concepts = getConceptListing();
  const href = next ? `/chapters/${next.slug}` : null;

  return (
    <div className="overflow-x-clip">
      <section data-cue="lasers" data-fog-cap className={`${container} flex min-h-[80svh] flex-col justify-center pt-28 pb-16`}>
        <h1 className="font-display text-[clamp(3.25rem,9vw,8rem)] leading-[1.08] font-semibold tracking-[-0.005em] text-rd-white">
          Year One: Awakening
        </h1>
        <p className="mt-6 max-w-[40ch] text-xl text-rd-chrome md:text-2xl">Every chapter happens once. One night. One world.</p>
      </section>

      <section data-cue="fog" data-fog-cap aria-label="Symbols of Year One" className={`${container} py-20 md:py-28`}>
        <FadeInStagger className={`border-b ${hairline}`}>
          {SYMBOLS.map((s) => (
            <li key={s.name} className={`grid gap-2 border-t ${hairline} py-6 md:grid-cols-12 md:items-baseline md:gap-8`}>
              <h2 className="font-display text-3xl leading-[1.08] font-semibold text-rd-white md:col-span-4">{s.name}</h2>
              <p className="text-rd-chrome md:col-span-8">{s.meaning}</p>
            </li>
          ))}
        </FadeInStagger>
      </section>

      {next && (
        <section
          data-cue="fog"
          data-fog-cap
          data-chapter={next.slug}
          aria-labelledby="feature-title"
          className={`${container} py-20 md:py-32`}
        >
          <p className="text-sm tracking-[0.08em] text-rd-chrome">Chapter {next.number}</p>
          <h2
            id="feature-title"
            className="rd-text-glow mt-2 font-display text-[clamp(3.5rem,11vw,8.5rem)] leading-[1.08] font-semibold tracking-[-0.005em] text-rd-white"
          >
            {next.title}
          </h2>
          <p className="mt-6 text-2xl text-rd-white md:text-3xl">{next.line}</p>
          <dl className="mt-8 grid max-w-[720px] gap-x-10 gap-y-3 sm:grid-cols-2">
            <div>
              <dt className="text-sm text-rd-chrome">Element</dt>
              <dd className="text-rd-white">{next.element}</dd>
            </div>
            <div>
              <dt className="text-sm text-rd-chrome">Theme</dt>
              <dd className="text-rd-white">{next.theme}</dd>
            </div>
          </dl>
          {href && isLive(href) && (
            <Button href={href} className="mt-10">
              Enter Chapter {next.number}
            </Button>
          )}
        </section>
      )}

      {concepts.length > 0 && (
        <section data-cue="fog" data-fog-cap aria-labelledby="concepts-title" className={`${container} pb-28 md:pb-40`}>
          <h2 id="concepts-title" className="font-display text-3xl leading-[1.08] font-semibold text-rd-white md:text-4xl">
            Future realities
          </h2>
          <FadeInStagger className={`mt-8 border-b ${hairline}`}>
            {concepts.map((c) =>
              c.revealed ? (
                <li key={c.number} data-chapter={c.slug} className={`grid gap-2 border-t ${hairline} py-6 md:grid-cols-12 md:gap-8`}>
                  <span className="text-sm text-accent md:col-span-1">{c.number}</span>
                  <h3 className="font-display text-3xl leading-[1.08] font-semibold text-accent md:col-span-3">{c.title}</h3>
                  <div className="flex flex-col gap-1 md:col-span-8">
                    <p className="text-rd-white">{c.line}</p>
                    <p className="text-sm text-rd-chrome">{c.element}</p>
                    <p className="text-sm text-rd-chrome">{c.theme}</p>
                  </div>
                </li>
              ) : (
                <li key={c.number} className={`grid items-center gap-2 border-t ${hairline} py-6 md:grid-cols-12 md:gap-8`}>
                  <span className="text-sm text-rd-chrome md:col-span-1">{c.number}</span>
                  <span className="flex items-center md:col-span-3">
                    <Redaction seed={`concept-${c.number}`} />
                  </span>
                  <p className="text-sm text-rd-chrome md:col-span-8">Classified</p>
                </li>
              ),
            )}
          </FadeInStagger>
          <p className="mt-6 text-sm text-rd-chrome">Each reality is revealed when it is ready.</p>
        </section>
      )}
    </div>
  );
}
