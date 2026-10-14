import { createHash, createHmac, timingSafeEqual } from "node:crypto";

/**
 * Server-only helpers for the Circle form: a signed "form opened at" token and
 * salted IP hashing. Spam protection only, never authentication.
 * TODO: set CIRCLE_FORM_SECRET and CIRCLE_IP_SALT in Vercel before launch;
 * the fallbacks below keep local and preview builds working.
 */
const SECRET = process.env.CIRCLE_FORM_SECRET ?? "rogue-desire-circle-form";
const IP_SALT = process.env.CIRCLE_IP_SALT ?? "rogue-desire-circle-ip";

const MIN_OPEN_MS = 2500;
const MAX_AGE_MS = 24 * 60 * 60 * 1000;

const sign = (value: string) => createHmac("sha256", SECRET).update(value).digest("base64url");

export function createFormToken(now = Date.now()): string {
  const ts = String(now);
  return `${ts}.${sign(ts)}`;
}

export type TokenCheck = "ok" | "invalid" | "too-fast" | "expired";

export function checkFormToken(token: unknown, now = Date.now()): TokenCheck {
  if (typeof token !== "string") return "invalid";
  const [ts, mac] = token.split(".");
  if (!ts || !mac) return "invalid";
  const expected = Buffer.from(sign(ts));
  const given = Buffer.from(mac);
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) return "invalid";
  const age = now - Number(ts);
  if (!Number.isFinite(age) || age < 0) return "invalid";
  if (age < MIN_OPEN_MS) return "too-fast";
  if (age > MAX_AGE_MS) return "expired";
  return "ok";
}

/** Salted SHA-256 of an IP. The raw IP is never stored or logged. */
export function hashIp(ip: string): string {
  return createHash("sha256").update(`${IP_SALT}:${ip}`).digest("hex");
}
