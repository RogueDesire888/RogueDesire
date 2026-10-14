import { ogContentType, ogSize, renderOg } from "@/lib/og";

export const size = ogSize;
export const contentType = ogContentType;
export const alt = "Transmissions | Rogue Desire";

export default async function Image() {
  return renderOg({ kind: "page", title: "Transmissions" });
}
