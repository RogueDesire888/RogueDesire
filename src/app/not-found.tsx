import type { Metadata } from "next";
import { Button } from "@/components/ui/Button";
import { container } from "@/components/ui/styles";

export const metadata: Metadata = { title: "Not found", robots: { index: false, follow: false } };

export default function NotFound() {
  return (
    <section data-cue="void" data-fog-cap className={`${container} flex min-h-svh flex-col justify-center pt-28 pb-20`}>
      <h1 className="max-w-[16ch] font-display text-[clamp(3rem,9vw,7.5rem)] leading-[1.08] font-semibold tracking-[-0.005em] text-rd-white">
        This reality does not exist.
      </h1>
      <p className="mt-6 text-xl text-rd-chrome md:text-2xl">Or it already disappeared.</p>
      <div className="mt-12 flex flex-wrap gap-4">
        <Button href="/">Return home</Button>
        <Button href="/manifesto" variant="secondary">
          Read the Manifesto
        </Button>
      </div>
    </section>
  );
}
