import type { Metadata } from "next";
import { Bodoni_Moda, Gloock, Grenze_Gotisch, Instrument_Serif, Syne } from "next/font/google";
import { Atmosphere } from "@/components/motion/Atmosphere";
import { container } from "@/components/ui/styles";

/** TEMPORARY: script font comparison. Hidden: not in nav, footer, or sitemap. */
export const metadata: Metadata = {
  title: "Type lab",
  robots: { index: false, follow: false },
};

// Bodoni Moda loads as a variable font so the optical size axis is available;
// weight 500 is applied per section below.
const bodoni = Bodoni_Moda({ subsets: ["latin"], style: "italic", axes: ["opsz"] });
const gloock = Gloock({ subsets: ["latin"], weight: "400" });
const instrument = Instrument_Serif({ subsets: ["latin"], weight: "400", style: "italic" });
const grenze = Grenze_Gotisch({ subsets: ["latin"], weight: "600" });
const syne = Syne({ subsets: ["latin"], weight: "800" });

const FONTS = [
  { name: "Bodoni Moda Italic 500", font: bodoni, weight: "font-medium" },
  { name: "Gloock", font: gloock, weight: "font-normal" },
  { name: "Instrument Serif Italic", font: instrument, weight: "font-normal" },
  { name: "Grenze Gotisch 600", font: grenze, weight: "font-semibold" },
  { name: "Syne 800", font: syne, weight: "font-extrabold" },
];

const size = "text-[clamp(2.5rem,6vw,5.5rem)] leading-[1.1]";
const glow = {
  textShadow:
    "0 0 12px color-mix(in srgb, var(--accent-glow) 60%, transparent), 0 0 40px color-mix(in srgb, var(--accent) 45%, transparent)",
};

export default function TypeLab() {
  return (
    <div data-chapter="ascension" className="overflow-x-clip">
      <h1 className="sr-only">Type lab</h1>
      <div className={`${container} flex flex-col gap-32 pt-32 pb-40`}>
        {FONTS.map(({ name, font, weight }, i) => (
          <section key={name} data-font-section aria-label={name} className="flex flex-col gap-6">
            <p className="text-sm tracking-[0.08em] text-rd-chrome">
              {i + 1}. {name}
            </p>
            <div className={`${font.className} ${weight} flex flex-col gap-4`}>
              <p className={`${size} text-rd-white`}>We do not organize parties.</p>
              <p className={`${size} text-rd-white`} style={glow}>
                The night is temporary. The feeling is not.
              </p>
              <p className={`${size} text-accent`} style={glow}>
                Intention. Energy. Transformation. Memory.
              </p>
              <p className={size}>
                <span className="text-rd-chrome opacity-60">The night is temporary.</span>{" "}
                <span className="text-rd-white" style={glow}>
                  The feeling is not.
                </span>
              </p>
            </div>
            <p className="max-w-[60ch] text-lg leading-relaxed text-rd-chrome md:text-xl">
              Rogue Desire is an electronic music experience told in chapters. Each one is built for a
              single night, then it&apos;s gone.
            </p>
          </section>
        ))}
      </div>
      <Atmosphere initial="fog" />
    </div>
  );
}
