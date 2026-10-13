import { Hanken_Grotesk, Syncopate } from "next/font/google";

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

export const fontVariables = [fontBody, fontChapter]
  .map((f) => f.variable)
  .join(" ");
