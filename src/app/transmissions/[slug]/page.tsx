import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { LightSweep } from "@/components/motion/primitives";
import { Button } from "@/components/ui/Button";
import { SignalCta } from "@/components/ui/SignalCta";
import { container } from "@/components/ui/styles";
import { isLive } from "@/config/nav";
import { formatTransmissionDate, getTransmission, getTransmissions } from "@/lib/transmissions";

type Params = { params: Promise<{ slug: string }> };

/** Per-transmission links out, by transmission number. */
const FOLLOW_UP: Record<string, { href: string; label: string }> = {
  "000": { href: "/manifesto", label: "Read the Manifesto" },
  "002": { href: "/artifacts", label: "View Artifacts" },
};

// Cache Components requires at least one static param. Until transmissions
// exist, a placeholder that can never be a valid slug renders the 404.
const NO_TRANSMISSIONS = "_";

export async function generateStaticParams() {
  const slugs = (await getTransmissions()).map((t) => ({ slug: t.slug }));
  return slugs.length > 0 ? slugs : [{ slug: NO_TRANSMISSIONS }];
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const t = await getTransmission((await params).slug);
  return t ? { title: t.title, description: t.excerpt } : {};
}

export default async function TransmissionPage({ params }: Params) {
  const { slug } = await params;
  const all = await getTransmissions();
  const index = all.findIndex((t) => t.slug === slug);
  if (index === -1) notFound();
  const t = all[index];
  const newer = all[index - 1];
  const older = all[index + 1];
  const followUp = FOLLOW_UP[t.number];

  return (
    <article data-chapter={t.chapter ?? undefined} data-cue="fog" className="overflow-x-clip">
      <header data-fog-cap className={`${container} pt-36 pb-16 md:pt-44`}>
        <p className="text-sm tracking-[0.08em] text-rd-chrome">Transmission {t.number}</p>
        <p className="mt-2 text-sm text-rd-chrome">
          {t.type} <span aria-hidden="true">/</span> <time dateTime={t.date}>{formatTransmissionDate(t.date)}</time>
        </p>
        <LightSweep>
          <h1 className="mt-8 max-w-[18ch] font-display text-[clamp(2.75rem,7vw,6.5rem)] leading-[1.08] font-semibold tracking-[-0.005em] text-rd-white">
            {t.title}
          </h1>
        </LightSweep>
      </header>

      <div data-fog-cap className={`${container} pb-24`}>
        <div className="flex max-w-[62ch] flex-col gap-7 text-lg leading-relaxed text-rd-chrome md:text-xl">{t.content}</div>
        {followUp && isLive(followUp.href) && (
          <Button href={followUp.href} variant="secondary" className="mt-14">
            {followUp.label}
          </Button>
        )}
      </div>

      <footer data-fog-cap className={`${container} border-t border-rd-chrome/15 py-20`}>
        <SignalCta />
        <nav aria-label="More transmissions" className="mt-16 grid gap-6 sm:grid-cols-2">
          {older && (
            <Link href={`/transmissions/${older.slug}`} className="group flex flex-col gap-1">
              <span className="text-sm text-rd-chrome">Previous: Transmission {older.number}</span>
              <span className="font-display text-2xl leading-[1.08] font-semibold text-rd-white group-hover:underline">{older.title}</span>
            </Link>
          )}
          {newer && (
            <Link href={`/transmissions/${newer.slug}`} className="group flex flex-col gap-1 sm:col-start-2 sm:text-right">
              <span className="text-sm text-rd-chrome">Next: Transmission {newer.number}</span>
              <span className="font-display text-2xl leading-[1.08] font-semibold text-rd-white group-hover:underline">{newer.title}</span>
            </Link>
          )}
        </nav>
      </footer>
    </article>
  );
}
