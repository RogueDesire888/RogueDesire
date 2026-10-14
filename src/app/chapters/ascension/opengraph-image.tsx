import { ogContentType, ogSize, renderOg } from "@/lib/og";

export const size = ogSize;
export const contentType = ogContentType;
export const alt = "Chapter 001: Ascension | Rogue Desire";

export default async function Image() {
  return renderOg({ kind: "chapter", title: "Ascension", label: "CHAPTER 001" });
}
