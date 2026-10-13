import { z } from "zod";
import { frequencySchema } from "./schemas";

/** Real, confirmed artists only. Empty until bookings are confirmed. */
export const frequencies = z.array(frequencySchema).parse([]);
