import type { Metadata } from "next";
import Link from "next/link";
import "@/components/archive/vault.css";
import { FadeIn, ScrubWords } from "@/components/motion/primitives";
import { SignalCta } from "@/components/ui/SignalCta";
import { container, display } from "@/components/ui/styles";
import { isLive } from "@/config/nav";
import { getChapter } from "@/lib/content";

export const metadata: Metadata = { title: "Archive" };

const COMPARTMENTS = [
  { name: "Fragments" },
  { name: "Witnesses" },
  { name: "Frequencies" },
  { name: "Artifact 001", href: "/artifacts" },
  { name: "Archive Film 001" },
  { name: "Yearbook", href: "/yearbook" },
];

function Lock() {
  return (
    <svg aria-hidden="true" viewBox="0 0 32 32" className="rd-lock size-8 shrink-0 text-rd-violet-soft">
      <circle cx="16" cy="16" r="14.5" fill="none" stroke="currentColor" strokeWidth="1.2" />
      <rect x="10.5" y="14.5" width="11" height="8.5" rx="1.2" fill="none" stroke="currentColor" strokeWidth="1.4" />
      <path d="M12.8 14.5v-2.6a3.2 3.2 0 0 1 6.4 0v2.6" fill="none" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="16" cy="18.6" r="1.1" fill="currentColor" />
    </svg>
  );
}

export default function ArchivePage() {
  const chapter = getChapter("ascension");
  return (
    <div data-chapter="ascension" className="overflow-x-clip">
      <section data-cue="lasers" data-fog-cap className={`${container} flex min-h-svh flex-col justify-center pt-28 pb-20`}>
        <h1 className="max-w-[14ch] font-display text-[clamp(3.5rem,10vw,8.5rem)] leading-[1.08] font-semibold tracking-[-0.005em] text-rd-white">
          The Archive Remembers
        </h1>
        <ScrubWords text="The event ends. The archive begins." className={`${display} mt-14 max-w-[18ch] text-rd-white`} />
        <FadeIn className="mt-10">
          <p className="max-w-[60ch] text-lg leading-relaxed text-rd-chrome md:text-xl">
            Every Rogue Desire chapter is temporary by nature. The archive exists to preserve what the night cannot hold:
            sound, atmosphere, movement, artifacts, frequencies, witnesses, and memory.
          </p>
        </FadeIn>
      </section>

      {chapter && (
        <section data-cue="fog" data-fog-cap aria-labelledby="vault-title" className={`${container} py-24 md:py-36`}>
          <div className="flex flex-col items-center text-center">
            <div className="relative flex aspect-square w-[min(84vw,420px)] items-center justify-center">
              <svg aria-hidden="true" viewBox="0 0 200 200" className="rd-seal-ring absolute inset-0 size-full text-accent">
                <circle cx="100" cy="100" r="94" fill="none" stroke="currentColor" strokeWidth="0.8" strokeDasharray="2 6" />
                <circle cx="100" cy="100" r="86" fill="none" stroke="currentColor" strokeWidth="1.4" strokeDasharray="120 420" strokeLinecap="round" />
                <circle cx="100" cy="100" r="78" fill="none" stroke="var(--rd-chrome)" strokeOpacity="0.35" strokeWidth="0.6" />
              </svg>
              <p className="relative font-display text-[clamp(1.4rem,5.6vw,2.6rem)] leading-none font-semibold text-rd-chrome">
                {chapter.code}
              </p>
            </div>
            <h2 id="vault-title" className="mt-8 font-display text-3xl leading-[1.08] font-semibold text-rd-white md:text-4xl">
              Chapter {chapter.number}: {chapter.title}
            </h2>
          </div>

          <ul className="mt-16 grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-5">
            {COMPARTMENTS.map((c) => {
              const inner = (
                <>
                  <span className="font-display text-xl leading-[1.1] font-semibold text-rd-white md:text-3xl">{c.name}</span>
                  <span className="mt-auto flex items-center gap-3 pt-8">
                    <Lock />
                    <span className="text-sm text-rd-chrome">Sealed</span>
                  </span>
                  <span className="rd-opens text-sm text-rd-white">Opens after the night.</span>
                </>
              );
              const panel = "rd-compartment flex min-h-[13rem] flex-col gap-2 border border-rd-chrome/25 bg-rd-charcoal/70 p-5 md:min-h-[15rem] md:p-7";
              return (
                <li key={c.name}>
                  {c.href && isLive(c.href) ? (
                    <Link href={c.href} className={`${panel} hover:border-rd-chrome/50`}>
                      {inner}
                    </Link>
                  ) : (
                    <div tabIndex={0} className={panel}>
                      {inner}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
          <p className="mt-8 text-sm text-rd-chrome">Nothing has been archived yet. The first entries arrive after Chapter 001.</p>
        </section>
      )}

      <section data-cue="flare" data-fog-cap aria-label="Enter the Circle" className={`${container} flex justify-center py-24 md:py-36`}>
        <SignalCta />
      </section>
    </div>
  );
}
