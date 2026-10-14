import { z } from "zod";

/** Shared by the Circle form (client) and its server action. */
export const CIRCLE_ROLES = [
  "Guest",
  "DJ",
  "Artist",
  "Photographer",
  "Designer",
  "Stylist",
  "Filmmaker",
  "Venue",
  "Brand Partner",
  "Culture Carrier",
  "Collaborator",
] as const;

const optional = (max: number, label: string) =>
  z
    .string()
    .trim()
    .max(max, `${label} can be up to ${max} characters.`)
    .transform((v) => (v === "" ? undefined : v))
    .optional();

export const circleSchema = z.object({
  name: z.string().trim().min(1, "Please add your name.").max(80, "Name can be up to 80 characters."),
  email: z.string().trim().email("Please enter a valid email address."),
  city: optional(80, "City"),
  instagram: z
    .string()
    .trim()
    .transform((v) => v.replace(/^@+/, ""))
    .pipe(z.string().max(40, "Instagram can be up to 40 characters."))
    .transform((v) => (v === "" ? undefined : v))
    .optional(),
  role: z
    .union([z.enum(CIRCLE_ROLES), z.literal("")], { error: "Please choose a role from the list." })
    .transform((v) => (v === "" ? undefined : v))
    .optional(),
  music: optional(300, "This answer"),
  involvement: optional(300, "This answer"),
  message: optional(1000, "Message"),
  consent: z.literal("on", { message: "Please confirm you want to receive Private Transmissions." }),
});

export type CircleField = "name" | "email" | "city" | "instagram" | "role" | "music" | "involvement" | "message" | "consent";
export type CircleValues = Partial<Record<CircleField, string>>;

export type CircleState =
  | { status: "idle" }
  | { status: "error"; message: string; fieldErrors: Partial<Record<CircleField, string>>; values: CircleValues; attempt: number }
  | { status: "closed" }
  | { status: "success" };

/**
 * No-JS submissions end in a 303 redirect back to /circle. The outcome travels
 * as codes only (never anything the person typed): ?status=closed|success, or
 * ?error=<kind>&f=<field,field>.
 */
const ERROR_KINDS = {
  fields: "Please check the highlighted fields.",
  "too-fast": "That was quick. Please wait a moment and try again.",
  expired: "This form expired. Please reload the page and try again.",
  rate: "Too many attempts from this connection. Please try again in an hour.",
  save: "We could not save your entry. Please try again in a moment.",
  other: "Something went wrong. Please try again.",
} as const;
type ErrorKind = keyof typeof ERROR_KINDS;

const FIELD_MESSAGES: Record<CircleField, string> = {
  name: "Please add your name.",
  email: "Please enter a valid email address.",
  city: "City can be up to 80 characters.",
  instagram: "Instagram can be up to 40 characters.",
  role: "Please choose a role from the list.",
  music: "This answer can be up to 300 characters.",
  involvement: "This answer can be up to 300 characters.",
  message: "Message can be up to 1000 characters.",
  consent: "Please confirm you want to receive Private Transmissions.",
};

export function circleOutcomeQuery(state: CircleState): string {
  if (state.status === "closed" || state.status === "success") return `?status=${state.status}`;
  if (state.status !== "error") return "";
  const kind = (Object.keys(ERROR_KINDS) as ErrorKind[]).find((k) => ERROR_KINDS[k] === state.message) ?? "other";
  const fields = Object.keys(state.fieldErrors).join(",");
  return `?error=${kind}${fields ? `&f=${fields}` : ""}`;
}

export function circleStateFromQuery(params: Record<string, string | string[] | undefined>): CircleState {
  const one = (k: string) => (typeof params[k] === "string" ? (params[k] as string) : undefined);
  const status = one("status");
  if (status === "closed" || status === "success") return { status };
  const kind = one("error") as ErrorKind | undefined;
  if (!kind || !(kind in ERROR_KINDS)) return { status: "idle" };
  const fieldErrors: Partial<Record<CircleField, string>> = {};
  for (const f of (one("f") ?? "").split(",")) if (f in FIELD_MESSAGES) fieldErrors[f as CircleField] = FIELD_MESSAGES[f as CircleField];
  return { status: "error", message: ERROR_KINDS[kind], fieldErrors, values: {}, attempt: 1 };
}
