"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import flyer from "../../../public/artifacts/ch001-flyer.webp";

const FLYER_SRC = "/artifacts/ch001-flyer.webp";

/**
 * "View the full flyer": a native modal <dialog> (focus trapped, Esc closes,
 * page behind is inert), with a close button. Without JS the link simply
 * opens the image.
 */
export function FlyerLightbox() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const openerRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const onClose = () => {
      document.documentElement.style.overflow = "";
      openerRef.current?.focus();
    };
    // Clicking the backdrop (outside the image panel) closes it.
    const onClick = (e: MouseEvent) => {
      if (e.target === dialog) dialog.close();
    };
    // Keep Tab inside: a native modal would otherwise let focus reach browser UI.
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      const items = [...dialog.querySelectorAll<HTMLElement>('button, a[href], [tabindex]:not([tabindex="-1"])')];
      if (items.length === 0) return;
      const i = items.indexOf(document.activeElement as HTMLElement);
      e.preventDefault();
      items[(i + (e.shiftKey ? -1 : 1) + items.length) % items.length].focus();
    };
    dialog.addEventListener("close", onClose);
    dialog.addEventListener("click", onClick);
    dialog.addEventListener("keydown", onKey);
    return () => {
      dialog.removeEventListener("close", onClose);
      dialog.removeEventListener("click", onClick);
      dialog.removeEventListener("keydown", onKey);
    };
  }, []);

  const open = (e: React.MouseEvent) => {
    const dialog = dialogRef.current;
    if (!dialog?.showModal) return; // no dialog support: follow the link
    e.preventDefault();
    document.documentElement.style.overflow = "hidden";
    dialog.showModal();
  };

  return (
    <>
      <a
        ref={openerRef}
        href={FLYER_SRC}
        onClick={open}
        className="inline-flex min-h-11 items-center text-sm text-rd-white underline underline-offset-[6px] hover:text-rd-chrome"
      >
        View the full flyer
      </a>
      <dialog
        ref={dialogRef}
        aria-label="Artifact 001 flyer"
        className="m-auto max-h-[94svh] max-w-[94vw] overflow-visible bg-transparent p-0 backdrop:bg-rd-black/90 backdrop:backdrop-blur-sm"
      >
        <div className="relative flex flex-col items-end gap-3">
          <button
            type="button"
            autoFocus
            onClick={() => dialogRef.current?.close()}
            className="min-h-11 px-3 text-sm font-medium tracking-[0.12em] text-rd-white uppercase"
          >
            Close
          </button>
          <Image
            src={flyer}
            alt="Artifact 001 flyer: the Rogue Desire wordmark above a chrome idol tablet in a violet laser starburst, titled Ascension, Chapter 001."
            sizes="(min-width: 768px) 50vw, 94vw"
            className="h-auto max-h-[calc(94svh-3.5rem)] w-auto max-w-full"
          />
        </div>
      </dialog>
    </>
  );
}
