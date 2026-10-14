import { getTransmission, getTransmissions } from "@/lib/transmissions";
import { ogContentType, ogSize, renderOg } from "@/lib/og";

export const size = ogSize;
export const contentType = ogContentType;
export const alt = "Rogue Desire transmission";

export async function generateStaticParams() {
  return (await getTransmissions()).map((t) => ({ slug: t.slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const t = await getTransmission((await params).slug);
  return renderOg(t ? { kind: "transmission", number: t.number, title: t.title } : { kind: "page", title: "Transmissions" });
}
