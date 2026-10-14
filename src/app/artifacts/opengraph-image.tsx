import { ogContentType, ogSize, renderOg } from "@/lib/og";

export const size = ogSize;
export const contentType = ogContentType;
export const alt = "Artifacts | Rogue Desire";

export default async function Image() {
  return renderOg({ kind: "artifacts", title: "Objects Worth Keeping." });
}
