import type { Metadata } from "next";
import { Beth_Ellen, Kaushan_Script, Mr_Dafoe, Sedgwick_Ave_Display, Yellowtail } from "next/font/google";
import { Atmosphere } from "@/components/motion/Atmosphere";
import { container } from "@/components/ui/styles";

/** TEMPORARY: script font comparison. Hidden: not in nav, footer, or sitemap. */
export const metadata: Metadata = {
  title: "Type lab",
  robots: { index: false, follow: false },
};

const mrDafoe = Mr_Dafoe({ subsets: ["latin"], weight: "400" });
const yellowtail = Yellowtail({ subsets: ["latin"], weight: "400" });
const kaushan = Kaushan_Script({ subsets: ["latin"], weight: "400" });
const sedgwick = Sedgwick_Ave_Display({ subsets: ["latin"], weight: "400" });
const bethEllen = Beth_Ellen({ subsets: ["latin"], weight: "400" });

const FONTS = [
  { name: "Mr Dafoe", font: mrDafoe },
  { name: "Yellowtail", font: yellowtail },
  { name: "Kaushan Script", font: kaushan },
  { name: "Sedgwick Ave Display", font: sedgwick },
  { name: "Beth Ellen", font: bethEllen },
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
        {FONTS.map(({ name, font }, i) => (
          <section key={name} data-font-section aria-label={name} className="flex flex-col gap-6">
            <p className="text-sm tracking-[0.08em] text-rd-chrome">
              {i + 1}. {name}
            </p>
            <div className={`${font.className} flex flex-col gap-4`}>
              <p className={`${size} text-rd-white`}>We do not organize parties.</p>
              <p className={`${size} text-rd-white`} style={glow}>
                The night is temporary. The feeling is not.
              </p>
              <p className={`${size} text-accent`} style={glow}>
                Intention. Energy. Transformation. Memory.
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
