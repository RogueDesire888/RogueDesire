import type { Metadata } from "next";
import { Grain } from "@/components/atmosphere/Grain";
import { fontVariables } from "@/lib/fonts";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://roguedesire.com"),
  title: {
    default: "Rogue Desire",
    template: "%s | Rogue Desire",
  },
  description:
    "A nightlife universe built through sound, atmosphere, memory, and desire.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={fontVariables}>
      <body>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:bg-rd-white focus:px-4 focus:py-2 focus:text-rd-black"
        >
          Skip to content
        </a>
        <main id="main" tabIndex={-1} className="outline-none">
          {children}
        </main>
        <Grain />
      </body>
    </html>
  );
}
