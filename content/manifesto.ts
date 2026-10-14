import { z } from "zod";

export const manifestoBlockSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("opening"), text: z.string().min(1) }),
  z.object({ type: z.literal("statement"), text: z.string().min(1) }),
  z.object({ type: z.literal("stanza"), lines: z.array(z.string().min(1)).min(1) }),
  z.object({ type: z.literal("paragraph"), text: z.string().min(1) }),
  z.object({ type: z.literal("signoff"), text: z.string().min(1) }),
]);

export type ManifestoBlock = z.infer<typeof manifestoBlockSchema>;

/** The Rogue Desire manifesto. Text is final: do not edit words. */
export const manifesto = z.array(manifestoBlockSchema).parse([
  { type: "opening", text: "We are architects of temporary realities." },
  {
    type: "paragraph",
    text: "Rogue Desire was born from the belief that some moments are too powerful to disappear.",
  },
  {
    type: "stanza",
    lines: [
      "There are nights that divide a life into before and after.",
      "Nights where sound becomes architecture.",
      "Where light becomes emotion.",
      "Where strangers become witnesses.",
      "Where the outside world falls away, and something impossible feels real.",
    ],
  },
  { type: "statement", text: "We exist to create those moments." },
  { type: "statement", text: "We do not organize parties. We construct emotional architecture." },
  {
    type: "stanza",
    lines: [
      "Every detail is intentional.",
      "Every frequency has a purpose.",
      "Every room becomes a world.",
      "Every body becomes part of the movement.",
      "Every artifact carries evidence of what happened there.",
    ],
  },
  { type: "statement", text: "The night is temporary. The feeling is not." },
  {
    type: "paragraph",
    text: "We believe the dance floor can be more than a place to gather. It can be a threshold: a crossing from the ordinary into the unknown. A space where identity loosens, time bends, and people remember what it feels like to be fully present.",
  },
  {
    type: "paragraph",
    text: "We believe the audience is not separate from the artwork. The people are the artwork. Their movement, their presence, their stories, and their shared energy complete the reality.",
  },
  {
    type: "paragraph",
    text: "We believe a flyer should not be thrown away. It should be collected. A photograph should not simply document a crowd. It should preserve a witness. A yearbook should not merely summarize a calendar. It should become a physical record of a world that existed.",
  },
  { type: "statement", text: "We build for the moment, and for what remains after it." },
  {
    type: "stanza",
    lines: [
      "Each Chapter is a new reality.",
      "Each Frequency opens a different passage.",
      "Each Artifact preserves a fragment.",
      "Each Witness becomes part of the mythology.",
      "Each Archive brings the vanished night back into view.",
    ],
  },
  {
    type: "paragraph",
    text: "We are drawn to the edge between beauty and danger, elegance and distortion, the physical and the mystical, the known and the unknown.",
  },
  {
    type: "stanza",
    lines: ["Not chaos without purpose.", "Not spectacle without soul.", "Not noise without meaning."],
  },
  { type: "statement", text: "Intention. Energy. Transformation. Memory." },
  {
    type: "paragraph",
    text: "Rogue Desire is for those who feel that music can change the shape of a night, and that a night can change the shape of a life.",
  },
  { type: "stanza", lines: ["Enter with curiosity.", "Leave with a story.", "Keep the evidence."] },
  { type: "signoff", text: "Rogue Desire. Architects of Temporary Realities." },
]);
