import { artifacts } from "@content/artifacts";
import { chapters } from "@content/chapters";
import type { Artifact, Chapter } from "@content/schemas";

export type { Artifact, Chapter, Frequency } from "@content/schemas";

/**
 * False for null, undefined, empty or whitespace strings, and empty arrays.
 * Gate every optional field with this before rendering it.
 */
export function isPublic<T>(
  value: T | null | undefined,
): value is Exclude<T, null | undefined> {
  if (value === null || value === undefined) return false;
  if (typeof value === "string") return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  return true;
}

export function getChapters(): readonly Chapter[] {
  return chapters;
}

export function getChapter(slug: string): Chapter | undefined {
  return chapters.find((c) => c.slug === slug);
}

/** The first chapter with status "upcoming". */
export function getNextChapter(): Chapter | undefined {
  return chapters.find((c) => c.status === "upcoming");
}

export function getConceptChapters(): readonly Chapter[] {
  return chapters.filter((c) => c.status === "concept");
}

export function getRevealedChapters(): readonly Chapter[] {
  return chapters.filter((c) => c.revealed);
}

/**
 * Concept chapters safe to render. Unrevealed entries are stripped to their
 * number at the source so their title, line, element, and theme never reach
 * a component or the HTML.
 */
export type ConceptListing =
  | { revealed: true; number: string; slug: string; title: string; line: string }
  | { revealed: false; number: string };

export function getConceptListing(): ConceptListing[] {
  return getConceptChapters().map((c) =>
    c.revealed
      ? { revealed: true, number: c.number, slug: c.slug, title: c.title, line: c.line }
      : { revealed: false, number: c.number },
  );
}

export function getArtifacts(): readonly Artifact[] {
  return artifacts;
}
