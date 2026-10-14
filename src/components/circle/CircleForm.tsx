"use client";

import { useActionState, useEffect, useRef, type ReactNode } from "react";
import Link from "next/link";
import { enterCircle } from "@/app/circle/actions";
import { Button } from "@/components/ui/Button";
import { CIRCLE_ROLES, type CircleField, type CircleState } from "@/lib/circle-shared";
import { CircleClosed, CircleSuccess } from "./CircleOutcome";

const input =
  "block w-full min-h-12 border border-rd-chrome/30 bg-rd-charcoal/85 px-4 py-3 text-base text-rd-white transition-[border-color,box-shadow] duration-200 outline-none focus:border-accent focus:shadow-[0_0_0_1px_var(--accent),0_0_18px_color-mix(in_srgb,var(--accent-glow)_45%,transparent)] aria-[invalid=true]:border-[#ff8a8a] motion-reduce:transition-none";
const labelClass = "mb-2 block text-sm text-rd-white";

type Props = {
  token: string;
  referralCode: string;
  sourcePath: string;
  privacyHref: string | null;
  preview?: "success";
  /** Outcome from a no-JS redirect (?status / ?error). */
  initialState?: CircleState;
};

function Field({
  name,
  label,
  error,
  children,
}: {
  name: CircleField;
  label: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label htmlFor={`circle-${name}`} className={labelClass}>
        {label}
      </label>
      {children}
      {error && (
        <p id={`circle-${name}-error`} className="mt-2 text-sm text-[#ff8a8a]">
          {error}
        </p>
      )}
    </div>
  );
}

export function CircleForm({ token, referralCode, sourcePath, privacyHref, preview, initialState }: Props) {
  const [state, formAction, pending] = useActionState<CircleState, FormData>(enterCircle, initialState ?? { status: "idle" });
  const formRef = useRef<HTMLFormElement>(null);
  const jsRef = useRef<HTMLInputElement>(null);

  // Marks submissions made with JavaScript (they get inline state, not a redirect).
  useEffect(() => {
    if (jsRef.current) jsRef.current.value = "1";
  });
  const errors = state.status === "error" ? state.fieldErrors : {};
  const values = state.status === "error" ? state.values : {};
  const attempt = state.status === "error" ? state.attempt : 0;

  // After an error, move focus to the first invalid field.
  useEffect(() => {
    if (attempt === 0) return;
    formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
  }, [attempt]);

  if (preview === "success" || state.status === "success") return <CircleSuccess />;
  if (state.status === "closed") return <CircleClosed />;

  const a11y = (name: CircleField) => ({
    id: `circle-${name}`,
    name,
    "aria-invalid": errors[name] ? true : undefined,
    "aria-describedby": errors[name] ? `circle-${name}-error` : undefined,
    defaultValue: values[name] ?? "",
  });
  const optionalOpen = (["city", "instagram", "role", "music", "involvement", "message"] as const).some(
    (f) => errors[f] || values[f],
  );

  return (
    // key re-mounts the form after each error so fields keep what was typed.
    <form key={attempt} ref={formRef} action={formAction} noValidate className="flex max-w-[40rem] flex-col gap-8">
      <div aria-live="polite" role="status" className="min-h-6 text-sm text-[#ff8a8a]">
        {state.status === "error" ? state.message : ""}
      </div>

      <Field name="name" label="Name" error={errors.name}>
        <input {...a11y("name")} type="text" autoComplete="name" required maxLength={80} className={input} />
      </Field>
      <Field name="email" label="Email" error={errors.email}>
        <input {...a11y("email")} type="email" autoComplete="email" required inputMode="email" className={input} />
      </Field>

      <details open={optionalOpen} className="group border-t border-rd-chrome/20 pt-6">
        <summary className="flex min-h-11 cursor-pointer list-none items-center gap-3 text-rd-white [&::-webkit-details-marker]:hidden">
          <span aria-hidden="true" className="inline-block size-2 rotate-45 bg-rd-violet transition-transform group-open:rotate-[225deg] motion-reduce:transition-none" />
          Tell us more
        </summary>
        <div className="mt-6 flex flex-col gap-8">
          <Field name="city" label="City" error={errors.city}>
            <input {...a11y("city")} type="text" autoComplete="address-level2" maxLength={80} className={input} />
          </Field>
          <Field name="instagram" label="Instagram" error={errors.instagram}>
            <input {...a11y("instagram")} type="text" autoComplete="off" maxLength={41} className={input} />
          </Field>
          <Field name="role" label="Role" error={errors.role}>
            <select {...a11y("role")} className={`${input} appearance-none`}>
              <option value="" />
              {CIRCLE_ROLES.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
          </Field>
          <Field name="music" label="What kind of music moves you?" error={errors.music}>
            <textarea {...a11y("music")} rows={3} maxLength={300} className={input} />
          </Field>
          <Field name="involvement" label="How do you want to be involved?" error={errors.involvement}>
            <textarea {...a11y("involvement")} rows={3} maxLength={300} className={input} />
          </Field>
          <Field name="message" label="Message" error={errors.message}>
            <textarea {...a11y("message")} rows={4} maxLength={1000} className={input} />
          </Field>
        </div>
      </details>

      <div>
        <label htmlFor="circle-consent" className="flex min-h-11 cursor-pointer items-start gap-4 text-rd-white">
          <input
            id="circle-consent"
            name="consent"
            type="checkbox"
            required
            defaultChecked={values.consent === "on"}
            aria-invalid={errors.consent ? true : undefined}
            aria-describedby={errors.consent ? "circle-consent-error" : undefined}
            className="mt-1 size-5 shrink-0 cursor-pointer accent-[var(--rd-violet)]"
          />
          <span>Send me Private Transmissions from Rogue Desire. I can leave at any time.</span>
        </label>
        {errors.consent && (
          <p id="circle-consent-error" className="mt-2 text-sm text-[#ff8a8a]">
            {errors.consent}
          </p>
        )}
        <p className="mt-4 max-w-[60ch] text-sm text-rd-chrome">
          We only use what you share here to send Private Transmissions and to understand who the Circle is. We never sell it.
          {privacyHref && (
            <>
              {" "}
              <Link href={privacyHref} className="text-rd-white underline underline-offset-4">
                Privacy
              </Link>
            </>
          )}
        </p>
      </div>

      {/* Spam and context fields. The honeypot stays empty for people. */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label htmlFor="circle-website">Website</label>
        <input id="circle-website" name="website" type="text" tabIndex={-1} autoComplete="off" defaultValue="" />
      </div>
      <input ref={jsRef} type="hidden" name="js" defaultValue="" />
      <input type="hidden" name="opened" value={token} />
      <input type="hidden" name="referral_code" value={referralCode} />
      <input type="hidden" name="source_path" value={sourcePath} />

      <div>
        <Button type="submit" disabled={pending} aria-busy={pending} className="disabled:cursor-wait disabled:opacity-70">
          Enter the Circle
        </Button>
      </div>
    </form>
  );
}
