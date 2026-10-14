import { Grenze_Gotisch, Hanken_Grotesk } from "next/font/google";

/** Body and UI. */
export const fontBody = Hanken_Grotesk({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

/** Display face (blackletter). Variable weight. Never uppercase, never wide tracking. */
export const fontDisplay = Grenze_Gotisch({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

export const fontVariables = [fontBody, fontDisplay].map((f) => f.variable).join(" ");
