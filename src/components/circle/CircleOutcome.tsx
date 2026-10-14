"use client";

import { useEffect, useRef } from "react";
import { NeonIgnite } from "@/components/motion/primitives";
import { instagramUrl, site } from "@/config/site";
import { triggerFogBurst } from "@/lib/pulse";

const statement = "font-display text-[clamp(2.25rem,6vw,4.5rem)] leading-[1.08] font-semibold tracking-[-0.005em] text-rd-white";

function InstagramLink() {
  return (
    <a
      href={instagramUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex min-h-11 items-center text-rd-white underline-offset-[6px] hover:underline"
    >
      @{site.instagram}
    </a>
  );
}

/** Replaces the form after a successful entry. One gentle fog burst. */
export function CircleSuccess() {
  const fired = useRef(false);
  useEffect(() => {
    if (fired.current) return;
    fired.current = true;
    triggerFogBurst(0.6);
  }, []);
  return (
    <div role="status" className="flex flex-col items-start gap-8">
      <NeonIgnite>
        <p className={`rd-text-glow max-w-[20ch] ${statement}`}>
          You have entered the signal. Private transmissions will follow.
        </p>
      </NeonIgnite>
      <InstagramLink />
    </div>
  );
}

/** Shown when no store is connected yet. */
export function CircleClosed() {
  return (
    <div role="status" className="flex flex-col items-start gap-6">
      <p className={statement}>The Circle opens soon.</p>
      <p className="text-lg text-rd-chrome">Follow the signal until then.</p>
      <InstagramLink />
    </div>
  );
}
