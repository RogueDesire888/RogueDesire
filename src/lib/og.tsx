/* eslint-disable @next/next/no-img-element -- next/og (Satori) renders plain <img> with data URIs. */
import fs from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";
import sharp from "sharp";

/** Shared share-image design (1200x630): black, faded scene, wordmark, Grenze title with violet glow. */
export const ogSize = { width: 1200, height: 630 };
export const ogContentType = "image/png";

// Literal paths only: a variable path makes the bundler trace the whole project.
const FILES = {
  scene: path.join(process.cwd(), "public/brand/hero-scene.webp"),
  wordmark: path.join(process.cwd(), "public/brand/wordmark.webp"),
  flyer: path.join(process.cwd(), "public/artifacts/ch001-flyer.webp"),
};
const VIOLET = "#8B2CFF";
const GLOW = `0 0 18px ${VIOLET}, 0 0 48px rgba(139, 44, 255, 0.7)`;

const png = async (file: string, width: number) =>
  `data:image/png;base64,${(await sharp(file).resize({ width }).png().toBuffer()).toString("base64")}`;

// Satori needs static (non-variable) fonts: these instances come from Google Fonts.
const fonts = async () => [
  { name: "Grenze", data: await fs.readFile(path.join(process.cwd(), "scripts/fonts/GrenzeGotisch-SemiBold.ttf")), weight: 600 as const },
  { name: "Hanken", data: await fs.readFile(path.join(process.cwd(), "scripts/fonts/HankenGrotesk-Regular.ttf")), weight: 400 as const },
];

type Variant =
  | { kind: "home" }
  | { kind: "chapter"; title: string; label: string }
  | { kind: "artifacts"; title: string }
  | { kind: "transmission"; number: string; title: string }
  | { kind: "page"; title: string };

export async function renderOg(variant: Variant) {
  const [scene, wordmark] = await Promise.all([png(FILES.scene, 1200), png(FILES.wordmark, 700)]);
  const flyer = variant.kind === "artifacts" ? await png(FILES.flyer, 450) : null;

  const corner = <img src={wordmark} width={190} height={119} style={{ position: "absolute", top: 40, left: 52 }} alt="" />;
  let body: React.ReactNode;
  if (variant.kind === "home") {
    body = (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", width: "100%", height: "100%" }}>
        <img src={wordmark} width={640} height={401} alt="" />
        <div style={{ marginTop: 18, fontFamily: "Grenze", fontSize: 54, color: "#F5F5F7", textShadow: GLOW }}>Architects of Temporary Realities.</div>
      </div>
    );
  } else if (variant.kind === "chapter") {
    body = (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", width: "100%", height: "100%" }}>
        <div style={{ fontFamily: "Hanken", fontSize: 30, letterSpacing: 6, color: "#C8CEDA" }}>{variant.label}</div>
        <div style={{ fontFamily: "Grenze", fontSize: 210, lineHeight: 1.05, color: "#F5F5F7", textShadow: GLOW }}>{variant.title}</div>
      </div>
    );
  } else if (variant.kind === "artifacts") {
    body = (
      <div style={{ display: "flex", width: "100%", height: "100%" }}>
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", width: 700, paddingLeft: 64, paddingRight: 32 }}>
          <div style={{ fontFamily: "Grenze", fontSize: 104, lineHeight: 1.08, color: "#F5F5F7", textShadow: GLOW }}>{variant.title}</div>
        </div>
        {flyer && <img src={flyer} width={450} height={630} style={{ marginLeft: "auto" }} alt="" />}
      </div>
    );
  } else {
    const label = variant.kind === "transmission" ? `Transmission ${variant.number}` : null;
    body = (
      // Top padding keeps labels and long titles clear of the corner wordmark.
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", width: "100%", height: "100%", padding: "150px 64px 40px" }}>
        {label && <div style={{ fontFamily: "Hanken", fontSize: 30, letterSpacing: 4, color: "#C8CEDA", marginBottom: 12 }}>{label}</div>}
        <div style={{ fontFamily: "Grenze", fontSize: variant.title.length > 26 ? 96 : 128, lineHeight: 1.08, color: "#F5F5F7", textShadow: GLOW, maxWidth: 1040 }}>
          {variant.title}
        </div>
      </div>
    );
  }

  return new ImageResponse(
    (
      <div style={{ display: "flex", position: "relative", width: "100%", height: "100%", background: "#030303" }}>
        <img src={scene} width={1200} height={515} style={{ position: "absolute", left: 0, top: 58, opacity: 0.22 }} alt="" />
        {variant.kind !== "home" && variant.kind !== "artifacts" && corner}
        {body}
      </div>
    ),
    { ...ogSize, fonts: await fonts() },
  );
}
