"use client";

import { useRef, type ReactNode } from "react";
import { gsap, useMotion } from "@/lib/motion";
import { barMs, msToNextDownbeat, setAtmosphereCue, setIntensity, triggerDrop } from "@/lib/pulse";

/**
 * The breath and the drop (Chapter 001 dossier).
 * Desktop: pinned ~160vh. Breath from pin start: near-void cue, intensity 0,
 * content held hidden. Once 20% in and at least one bar of stillness has
 * passed (two beats on mobile), the drop fires on the next downbeat: fog plumes, laser explosion,
 * violet flood, title slam + shake, then a sequenced reveal. Mobile: no pin;
 * the same sequence plays once at 40% in view. Scrolling past fast fires the
 * drop immediately so content never stays hidden. Reduced motion / no JS:
 * the server-rendered, fully revealed dossier.
 *
 * Children mark parts with data-drop: title, seal, line, desc, row, details, cta.
 * The element carrying data-drop-shake gets the camera shake.
 */
export function DropStage({ children, className = "" }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useMotion(ref, ({ el, desktop }) => {
    const section = el.closest<HTMLElement>("[data-cue]");
    const q = (part: string) => el.querySelectorAll<HTMLElement>(`[data-drop="${part}"]`);
    const title = q("title");
    const sequence = [...q("seal"), ...q("line"), ...q("desc")];
    const rows = q("row");
    const after = [...q("details"), ...q("cta")];
    const shake = el.querySelector<HTMLElement>("[data-drop-shake]");

    gsap.set([...title, ...sequence, ...rows, ...after], { opacity: 0 });
    if (section) section.dataset.cue = "breath";

    let breathStart = 0;
    let armed = false;
    let dropped = false;
    let timer = 0;

    const reveal = (instant: boolean) => {
      const tl = gsap.timeline();
      tl.fromTo(
        title,
        { opacity: 0, scale: 1.35, filter: "blur(10px)", transformOrigin: "0% 60%" },
        { opacity: 1, scale: 1, filter: "blur(0px)", duration: 0.28, ease: "power3.out" },
      )
        .fromTo(sequence, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.5, stagger: 0.18, ease: "power2.out" }, 0.35)
        .fromTo(rows, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.4, stagger: 0.1, ease: "power2.out" }, ">-0.1")
        .fromTo(after, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.45, stagger: 0.15, ease: "power2.out" }, ">-0.1");
      if (instant) tl.progress(1);
      else if (shake) {
        // Camera shake: translate jitter, max 4px, decaying over 400ms.
        const jitter = { k: 1 };
        gsap.to(jitter, {
          k: 0,
          duration: 0.4,
          ease: "power2.out",
          onUpdate: () => gsap.set(shake, { x: (Math.random() * 2 - 1) * 4 * jitter.k, y: (Math.random() * 2 - 1) * 4 * jitter.k }),
          onComplete: () => gsap.set(shake, { x: 0, y: 0 }),
        });
      }
    };

    const fire = (instant = false) => {
      if (dropped) return;
      dropped = true;
      window.clearTimeout(timer);
      triggerDrop();
      setIntensity(1);
      if (section) section.dataset.cue = "lasers";
      setAtmosphereCue("lasers");
      reveal(instant);
    };

    const beginBreath = () => {
      if (dropped || breathStart) return;
      breathStart = performance.now();
      setIntensity(0);
      setAtmosphereCue("breath");
    };

    // Drop on the first downbeat after the breath: at least one bar of
    // stillness on desktop (pinned), two beats on mobile (the page keeps moving).
    const stillness = desktop ? barMs() : barMs() / 2;
    const arm = () => {
      if (dropped || armed) return;
      armed = true;
      const earliest = Math.max(performance.now(), breathStart + stillness);
      const wait = earliest - performance.now() + msToNextDownbeat(earliest);
      timer = window.setTimeout(() => fire(), wait);
    };

    if (desktop) {
      gsap.timeline({
        scrollTrigger: {
          trigger: el,
          start: "top top",
          end: "+=160%",
          pin: true,
          anticipatePin: 1,
          onEnter: beginBreath,
          onUpdate: (self) => {
            if (self.progress > 0) beginBreath();
            if (self.progress >= 0.2) arm();
          },
          onLeave: () => fire(true),
        },
      });
    } else {
      gsap.timeline({
        scrollTrigger: {
          trigger: el,
          start: "top 60%",
          end: "bottom top",
          onEnter: () => {
            beginBreath();
            arm();
          },
          onLeave: () => fire(true),
        },
      });
    }

    return () => window.clearTimeout(timer);
  });

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
