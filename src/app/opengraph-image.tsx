import { ogContentType, ogSize, renderOg } from "@/lib/og";

export const size = ogSize;
export const contentType = ogContentType;
export const alt = "Rogue Desire. Architects of Temporary Realities.";

export default async function Image() {
  return renderOg({ kind: "home" });
}
