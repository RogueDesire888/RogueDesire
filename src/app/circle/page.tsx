import type { Metadata } from "next";
import { connection } from "next/server";
import { Suspense } from "react";
import { CircleForm } from "@/components/circle/CircleForm";
import { FadeIn } from "@/components/motion/primitives";
import { container } from "@/components/ui/styles";
import { isLive } from "@/config/nav";
import { circleStateFromQuery } from "@/lib/circle-shared";
import { createFormToken } from "@/lib/circle-token";

export const metadata: Metadata = {
  title: "Enter the Circle",
  // Unlisted until the Circle opens (see CLAUDE.md).
  robots: { index: false, follow: false },
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

/** Per-request: signed "form opened" token, referral code, dev-only preview. */
async function CircleFormLoader({ searchParams }: { searchParams: SearchParams }) {
  await connection();
  const params = await searchParams;
  const referral = typeof params.c === "string" ? params.c.slice(0, 64) : "";
  const preview = process.env.NODE_ENV !== "production" && params.preview === "success" ? "success" : undefined;
  return (
    <CircleForm
      token={createFormToken()}
      referralCode={referral}
      sourcePath="/circle"
      privacyHref={isLive("/privacy") ? "/privacy" : null}
      preview={preview}
      initialState={circleStateFromQuery(params)}
    />
  );
}

export default function CirclePage({ searchParams }: { searchParams: SearchParams }) {
  return (
    <div data-chapter="ascension" data-cue="fog" data-fog-cap className="overflow-x-clip">
      <section className={`${container} pt-36 pb-12 md:pt-44`}>
        <h1 className="max-w-[14ch] font-display text-[clamp(3.5rem,10vw,8.5rem)] leading-[1.08] font-semibold tracking-[-0.005em] text-rd-white">
          The Circle Is Forming.
        </h1>
        <FadeIn className="mt-10">
          <p className="max-w-[60ch] text-lg leading-relaxed text-rd-chrome md:text-xl">
            Rogue Desire is built through sound, atmosphere, memory, and human connection. This is not a mailing list. It is
            the beginning of a community built around temporary realities.
          </p>
        </FadeIn>
      </section>
      <section aria-label="Enter the Circle" className={`${container} pb-32 md:pb-44`}>
        <Suspense fallback={<div className="min-h-[36rem]" />}>
          <CircleFormLoader searchParams={searchParams} />
        </Suspense>
      </section>
    </div>
  );
}
