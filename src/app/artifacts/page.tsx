import type { Metadata } from "next";
import Link from "next/link";
import { FadeIn, FadeInStagger, ScrubWords } from "@/components/motion/primitives";
import { ArtifactCard } from "@/components/objects/ArtifactCard";
import { SignalCta } from "@/components/ui/SignalCta";
import { container, display } from "@/components/ui/styles";
import { isLive } from "@/config/nav";
import { getArtifacts, getChapter, isPublic } from "@/lib/content";

export const metadata: Metadata = { title: "Artifacts" };

const section = `${container} py-24 md:py-36`;
const body = "max-w-[60ch] text-lg leading-relaxed text-rd-chrome md:text-xl";
const heading = "font-display text-4xl leading-[1.08] font-semibold text-rd-white md:text-6xl";

/** Plain-language status labels. */
const STATUS_LABEL: Record<string, string> = {
  concept: "in development",
  "in-production": "in production",
  available: "available",
  limited: "limited",
  archived: "archived",
};

const OBJECTS = [
  { name: "Chapter Artifacts", line: "The numbered object every chapter leaves behind." },
  { name: "Posters", line: "The chapter, printed large enough to live on a wall." },
  { name: "Wristbands", line: "What you wore across the threshold." },
  { name: "Inner Circle Cards", line: "Proof you were closer than most." },
  { name: "Wearable Archives", line: "Pieces made to carry the night on your body." },
  { name: "Yearbooks", line: "The whole year, bound.", href: "/yearbook" },
];

export default function ArtifactsPage() {
  const artifact = getArtifacts()[0];
  const chapter = artifact ? getChapter(artifact.chapter) : undefined;

  return (
    <div data-chapter="ascension" className="overflow-x-clip">
      <section data-cue="lasers" data-fog-cap className={`${container} flex min-h-svh flex-col justify-center pt-28 pb-20`}>
        <h1 className="max-w-[14ch] font-display text-[clamp(3.5rem,10vw,8.5rem)] leading-[1.08] font-semibold tracking-[-0.005em] text-rd-white">
          Objects Worth Keeping.
        </h1>
        <ScrubWords text="Not merchandise. Not promotion. Preservation." className={`${display} mt-14 max-w-[18ch] text-rd-white`} />
        <FadeIn className="mt-10">
          <p className={body}>Rogue Desire artifacts are physical records of temporary realities.</p>
        </FadeIn>
      </section>

      {artifact && chapter && (
        <section data-cue="fog" aria-labelledby="artifact-title" className={section}>
          <div className="grid items-center gap-14 md:grid-cols-2 md:gap-20">
            <div className="flex justify-center md:justify-start">
              <div className="w-[min(78vw,340px)]">
                <ArtifactCard title={chapter.title} line={artifact.line} code={artifact.code} />
              </div>
            </div>
            <div data-fog-cap className="flex flex-col gap-4">
              <h2 id="artifact-title" className={heading}>
                {artifact.name}
              </h2>
              {isPublic(artifact.subtitle) && <p className="text-xl text-rd-white md:text-2xl">{artifact.subtitle}</p>}
              {isPublic(artifact.lore) && (
                <FadeIn className="mt-4">
                  <p className={body}>{artifact.lore}</p>
                </FadeIn>
              )}
              <p className="mt-4 text-sm text-rd-chrome">Status: {STATUS_LABEL[artifact.status]}</p>
            </div>
          </div>
        </section>
      )}

      <section data-cue="fog" data-fog-cap aria-labelledby="objects-title" className={section}>
        <h2 id="objects-title" className={heading}>
          The objects
        </h2>
        <FadeInStagger blur stagger={0.12} duration={0.9} className="mt-12 border-b border-rd-chrome/20">
          {OBJECTS.map((o) => (
            <li key={o.name} className="grid gap-2 border-t border-rd-chrome/20 py-7 md:grid-cols-12 md:items-baseline md:gap-8">
              <h3 className="font-display text-3xl leading-[1.08] font-semibold text-rd-white md:col-span-5 md:text-4xl">
                {o.href && isLive(o.href) ? (
                  <Link href={o.href} className="underline-offset-[6px] hover:underline">
                    {o.name}
                  </Link>
                ) : (
                  o.name
                )}
              </h3>
              <p className="text-lg text-rd-chrome md:col-span-7">{o.line}</p>
            </li>
          ))}
        </FadeInStagger>
        <p className="mt-8 text-sm text-rd-chrome">None of these are available yet. Each is released only when it is real.</p>
      </section>

      <section data-cue="flare" data-fog-cap className={`${section} flex flex-col items-center text-center`}>
        <p className={`${display} max-w-[18ch] text-rd-white`}>The night disappears. The object remembers.</p>
        <SignalCta className="mt-14" />
      </section>
    </div>
  );
}
