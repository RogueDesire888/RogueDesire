import { Hanken_Grotesk, Rubik_Wet_Paint, Syncopate } from "next/font/google";

export const fontBody = Hanken_Grotesk({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

/** Chapter titles only (ASCENSION, ECLIPSE). */
export const fontChapter = Syncopate({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-chapter",
  display: "swap",
});

/** TEMPORARY: wordmark placeholder until public/brand/wordmark.svg arrives. */
export const fontWordmarkTemp = Rubik_Wet_Paint({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-wordmark-temp",
  display: "swap",
});

export const fontVariables = [fontBody, fontChapter, fontWordmarkTemp]
  .map((f) => f.variable)
  .join(" ");
