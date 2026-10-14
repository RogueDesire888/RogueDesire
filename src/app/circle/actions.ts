"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { circleOutcomeQuery, circleSchema, type CircleField, type CircleState, type CircleValues } from "@/lib/circle-shared";
import { getCircleStore } from "@/lib/circle-store";
import { checkFormToken, hashIp } from "@/lib/circle-token";
import { rateLimit } from "@/lib/rate-limit";

const FIELDS: CircleField[] = ["name", "email", "city", "instagram", "role", "music", "involvement", "message", "consent"];
const MAX_PER_HOUR = 5;
const HOUR = 60 * 60 * 1000;

const text = (formData: FormData, key: string, max = 2000) => {
  const v = formData.get(key);
  return typeof v === "string" ? v.slice(0, max) : "";
};

export async function enterCircle(prev: CircleState, formData: FormData): Promise<CircleState> {
  const state = await processEntry(prev, formData);
  // Without JavaScript the form posts natively: answer with a 303 back to the
  // page carrying outcome codes only. With JavaScript, return the state.
  if (formData.get("js") !== "1") redirect(`/circle${circleOutcomeQuery(state)}`);
  return state;
}

async function processEntry(prev: CircleState, formData: FormData): Promise<CircleState> {
  const attempt = prev.status === "error" ? prev.attempt + 1 : 1;
  const values: CircleValues = Object.fromEntries(FIELDS.map((f) => [f, text(formData, f)]));
  const fail = (message: string, fieldErrors: Partial<Record<CircleField, string>> = {}): CircleState => ({
    status: "error",
    message,
    fieldErrors,
    values,
    attempt,
  });

  // Spam: honeypot must be empty.
  if (text(formData, "website") !== "") return fail("Something went wrong. Please try again.");

  // Spam: the form must have been open for at least 2.5 seconds.
  const token = checkFormToken(formData.get("opened"));
  if (token === "too-fast") return fail("That was quick. Please wait a moment and try again.");
  if (token !== "ok") return fail("This form expired. Please reload the page and try again.");

  // Spam: at most 5 submissions per IP per hour (salted hash, never the raw IP).
  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "";
  const ipHash = ip ? hashIp(ip) : undefined;
  if (ipHash && !rateLimit(ipHash, MAX_PER_HOUR, HOUR)) {
    return fail("Too many attempts from this connection. Please try again in an hour.");
  }

  const parsed = circleSchema.safeParse(values);
  if (!parsed.success) {
    const fieldErrors: Partial<Record<CircleField, string>> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0] as CircleField;
      if (!fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return fail("Please check the highlighted fields.", fieldErrors);
  }

  const store = getCircleStore();
  if (!store) return { status: "closed" };

  const data = parsed.data;
  try {
    await store.upsert({
      name: data.name,
      email: data.email,
      city: data.city,
      instagram: data.instagram,
      role: data.role,
      music: data.music,
      involvement: data.involvement,
      message: data.message,
      referralCode: text(formData, "referral_code", 64) || undefined,
      sourcePath: text(formData, "source_path", 200) || undefined,
      consent: true,
      ipHash,
      userAgent: h.get("user-agent")?.slice(0, 300) ?? undefined,
    });
  } catch {
    return fail("We could not save your entry. Please try again in a moment.");
  }
  // Same result whether the email was new or already in the Circle.
  return { status: "success" };
}
