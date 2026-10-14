import fs from "node:fs";
import path from "node:path";
import { compileMDX } from "next-mdx-remote/rsc";
import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { transmissionSchema, type TransmissionMeta } from "@content/transmission-schema";
import { FadeIn } from "@/components/motion/primitives";

/** Server-only: reads and validates content/transmissions/*.mdx at build time. */
const DIR = path.join(process.cwd(), "content/transmissions");

type Node = { type: string; value?: string; children?: Node[]; data?: { hProperties?: Record<string, unknown> } };
const textOf = (n: Node): string => n.value ?? (n.children ?? []).map(textOf).join("");

/**
 * Pull lines: a single-sentence paragraph under 8 words that ends a section
 * (followed by a heading, a rule, or the end) is marked data-pull. The text is
 * never changed; only its presentation.
 */
function remarkPullLines() {
  return (tree: Node) => {
    const kids = tree.children ?? [];
    kids.forEach((node, i) => {
      if (node.type !== "paragraph") return;
      const next = kids[i + 1];
      const endsSection = !next || next.type === "heading" || next.type === "thematicBreak";
      const text = textOf(node).trim();
      const sentences = text.match(/[.!?](\s|$)/g)?.length ?? 0;
      const words = text.split(/\s+/).filter(Boolean).length;
      if (endsSection && sentences <= 1 && words > 0 && words < 8) {
        node.data = { ...node.data, hProperties: { ...node.data?.hProperties, "data-pull": "" } };
      }
    });
  };
}

const components = {
  p: ({ children, ...props }: ComponentPropsWithoutRef<"p"> & { "data-pull"?: string }) =>
    props["data-pull"] !== undefined ? (
      <FadeIn>
        <p className="font-display text-[clamp(1.75rem,3.4vw,2.75rem)] leading-[1.15] font-semibold text-rd-white">{children}</p>
      </FadeIn>
    ) : (
      <FadeIn>
        <p>{children}</p>
      </FadeIn>
    ),
  h2: (props: ComponentPropsWithoutRef<"h2">) => (
    <h2 className="mt-8 font-display text-3xl leading-[1.08] font-semibold text-rd-white md:text-4xl" {...props} />
  ),
  h3: (props: ComponentPropsWithoutRef<"h3">) => (
    <h3 className="mt-6 font-display text-2xl leading-[1.08] font-semibold text-rd-white" {...props} />
  ),
  a: (props: ComponentPropsWithoutRef<"a">) => <a className="text-rd-white underline underline-offset-4" {...props} />,
  hr: () => <hr className="my-6 border-rd-chrome/20" />,
};

export type Transmission = TransmissionMeta & { content: ReactNode };

function files(): string[] {
  if (!fs.existsSync(DIR)) return [];
  return fs.readdirSync(DIR).filter((f) => f.endsWith(".mdx")).sort();
}

async function load(file: string): Promise<Transmission> {
  const source = fs.readFileSync(path.join(DIR, file), "utf8");
  const { content, frontmatter } = await compileMDX({
    source,
    components,
    options: { parseFrontmatter: true, mdxOptions: { remarkPlugins: [remarkPullLines] } },
  });
  const parsed = transmissionSchema.safeParse(frontmatter);
  if (!parsed.success) throw new Error(`Invalid frontmatter in ${file}: ${parsed.error.message}`);
  return { ...parsed.data, content };
}

/** Published transmissions, newest number first. */
export async function getTransmissions(): Promise<Transmission[]> {
  const all = await Promise.all(files().map(load));
  return all.filter((t) => t.published).sort((a, b) => b.number.localeCompare(a.number));
}

export async function getTransmission(slug: string): Promise<Transmission | undefined> {
  return (await getTransmissions()).find((t) => t.slug === slug);
}

export function formatTransmissionDate(date: string): string {
  return new Date(`${date}T12:00:00`).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}
