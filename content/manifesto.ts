import { z } from "zod";

/** Atmosphere cue a block sets while it is in the middle of the viewport. */
const cue = z.enum(["void", "fog", "grid", "flare"]).optional();

export const manifestoBlockSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("opening"), text: z.string().min(1), cue }),
  z.object({
    type: z.literal("statement"),
    text: z.string().min(1),
    motion: z.enum(["scrubWords", "pinnedSwap", "pinnedDissolve", "beatWords"]).optional(),
    cue,
  }),
  z.object({
    type: z.literal("stanza"),
    lines: z.array(z.string().min(1)).min(1),
    motion: z.enum(["revealLines", "glitchResolve"]).optional(),
    glowWords: z.array(z.string()).optional(),
    /** Seconds between lines for revealLines. */
    stagger: z.number().positive().optional(),
    cue,
  }),
  z.object({
    type: z.literal("paragraph"),
    text: z.string().min(1),
    /** Paragraphs only ever get FadeIn (optionally preceded by a light sweep). */
    motion: z.enum(["fadeIn", "lightSweep"]).optional(),
    cue,
  }),
  z.object({ type: z.literal("signoff"), text: z.string().min(1), motion: z.literal("neonIgnite").optional(), cue }),
]);

export type ManifestoBlock = z.infer<typeof manifestoBlockSchema>;

/** The Rogue Desire manifesto. Text is final: do not edit words. */
export const manifesto = z.array(manifestoBlockSchema).parse([
  { type: "opening", text: "We are architects of temporary realities.", cue: "grid" },
  {
    type: "paragraph",
    text: "Rogue Desire was born from the belief that some moments are too powerful to disappear.",
    motion: "fadeIn",
    cue: "void",
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
    motion: "revealLines",
    cue: "fog",
  },
  { type: "statement", text: "We exist to create those moments.", motion: "scrubWords" },
  {
    type: "statement",
    text: "We do not organize parties. We construct emotional architecture.",
    motion: "pinnedSwap",
    cue: "grid",
  },
  {
    type: "stanza",
    lines: [
      "Every detail is intentional.",
      "Every frequency has a purpose.",
      "Every room becomes a world.",
      "Every body becomes part of the movement.",
      "Every artifact carries evidence of what happened there.",
    ],
    motion: "revealLines",
  },
  { type: "statement", text: "The night is temporary. The feeling is not.", motion: "pinnedDissolve", cue: "void" },
  {
    type: "paragraph",
    text: "We believe the dance floor can be more than a place to gather. It can be a threshold: a crossing from the ordinary into the unknown. A space where identity loosens, time bends, and people remember what it feels like to be fully present.",
    motion: "lightSweep",
  },
  {
    type: "paragraph",
    text: "We believe the audience is not separate from the artwork. The people are the artwork. Their movement, their presence, their stories, and their shared energy complete the reality.",
    motion: "fadeIn",
    cue: "fog",
  },
  {
    type: "paragraph",
    text: "We believe a flyer should not be thrown away. It should be collected. A photograph should not simply document a crowd. It should preserve a witness. A yearbook should not merely summarize a calendar. It should become a physical record of a world that existed.",
    motion: "fadeIn",
    cue: "fog",
  },
  { type: "statement", text: "We build for the moment, and for what remains after it.", motion: "scrubWords" },
  {
    type: "stanza",
    lines: [
      "Each Chapter is a new reality.",
      "Each Frequency opens a different passage.",
      "Each Artifact preserves a fragment.",
      "Each Witness becomes part of the mythology.",
      "Each Archive brings the vanished night back into view.",
    ],
    motion: "revealLines",
    glowWords: ["Chapter", "Frequency", "Artifact", "Witness", "Archive"],
  },
  {
    type: "paragraph",
    text: "We are drawn to the edge between beauty and danger, elegance and distortion, the physical and the mystical, the known and the unknown.",
    motion: "fadeIn",
    cue: "flare",
  },
  {
    type: "stanza",
    lines: ["Not chaos without purpose.", "Not spectacle without soul.", "Not noise without meaning."],
    motion: "glitchResolve",
  },
  { type: "statement", text: "Intention. Energy. Transformation. Memory.", motion: "beatWords", cue: "grid" },
  {
    type: "paragraph",
    text: "Rogue Desire is for those who feel that music can change the shape of a night, and that a night can change the shape of a life.",
    motion: "fadeIn",
    cue: "void",
  },
  {
    type: "stanza",
    lines: ["Enter with curiosity.", "Leave with a story.", "Keep the evidence."],
    motion: "revealLines",
    stagger: 0.3,
    cue: "fog",
  },
  { type: "signoff", text: "Rogue Desire. Architects of Temporary Realities.", motion: "neonIgnite", cue: "flare" },
]);
