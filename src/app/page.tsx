import { LaserGrid } from "@/components/atmosphere/LaserGrid";
import { Wordmark } from "@/components/brand/Wordmark";

export default function Home() {
  return (
    <section
      aria-labelledby="hero-title"
      className="relative isolate flex min-h-svh flex-col items-center justify-center overflow-hidden px-4 py-24 text-center"
    >
      <LaserGrid />
      <h1 id="hero-title" className="relative">
        <Wordmark className="text-[clamp(3.5rem,19vw,6.5rem)] md:text-[clamp(4rem,10vw,9rem)]" />
      </h1>
      <p className="relative mt-8 text-lg font-medium tracking-wide text-rd-white sm:text-xl">
        Architects of Temporary Realities.
      </p>
      <p className="relative mt-4 max-w-[34ch] text-base leading-relaxed text-rd-chrome sm:text-lg">
        A nightlife universe built through sound, atmosphere, memory, and desire.
      </p>
    </section>
  );
}
