import { z } from "zod";
import { artifactSchema } from "./schemas";

export const artifacts = z.array(artifactSchema).parse([
  {
    code: "RD-Y1-CH001-ASC-CARD",
    name: "Artifact 001: Ascension",
    subtitle: "Proof of the first temporary reality.",
    chapter: "ascension",
    format: "5x7 premium art card",
    edition: null,
    status: "concept",
    line: "The night disappears. The object remembers.",
    lore: "For one night, the first reality opened. Those who entered became part of the ascent.",
    image: null,
  },
]);
