import type { Metadata } from "next";
import Link from "next/link";
import { FadeInStagger } from "@/components/motion/primitives";
import { container } from "@/components/ui/styles";
import { formatTransmissionDate, getTransmissions } from "@/lib/transmissions";

export const metadata: Metadata = { title: "Transmissions" };

export default async function TransmissionsPage() {
  const transmissions = await getTransmissions();
  return (
    <div data-cue="fog" data-fog-cap className="overflow-x-clip">
      <section className={`${container} pt-36 pb-16 md:pt-44`}>
        <h1 className="font-display text-[clamp(3.5rem,10vw,8.5rem)] leading-[1.08] font-semibold tracking-[-0.005em] text-rd-white">
          Transmissions
        </h1>
        {/* Approved copy; the banned word is used to reject it. */}
        <p className="mt-6 max-w-[40ch] text-xl text-rd-chrome md:text-2xl">Signals from inside the universe. This is not a blog.</p>{/* brand-lint-ignore */}
      </section>
      {transmissions.length > 0 && (
        <section aria-label="Transmissions" className={`${container} pb-32 md:pb-44`}>
          <FadeInStagger blur stagger={0.12} duration={0.9} className="border-b border-rd-chrome/20">
            {transmissions.map((t) => (
              <li key={t.slug} data-chapter={t.chapter ?? undefined} className="border-t border-rd-chrome/20">
                <Link href={`/transmissions/${t.slug}`} className="group grid gap-3 py-10 md:grid-cols-12 md:gap-8 md:py-14">
                  <span className="font-display text-6xl leading-none font-semibold text-accent md:col-span-2 md:text-7xl">{t.number}</span>
                  <span className="flex flex-col gap-3 md:col-span-10">
                    <span className="text-sm text-rd-chrome">{t.type}</span>
                    <span className="font-display text-3xl leading-[1.08] font-semibold text-rd-white underline-offset-[6px] group-hover:underline md:text-5xl">
                      {t.title}
                    </span>
                    <span className="max-w-[62ch] text-lg leading-relaxed text-rd-chrome">{t.excerpt}</span>
                    <time dateTime={t.date} className="text-sm text-rd-chrome">
                      {formatTransmissionDate(t.date)}
                    </time>
                  </span>
                </Link>
              </li>
            ))}
          </FadeInStagger>
        </section>
      )}
    </div>
  );
}
