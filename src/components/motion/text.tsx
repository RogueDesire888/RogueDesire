import { Fragment } from "react";

/**
 * A full string for assistive tech plus aria-hidden word spans for animation.
 * Words render in their final state; motion hides them only inside effects.
 */
export function Words({
  text,
  wordClassName = "",
  glow = false,
}: {
  text: string;
  wordClassName?: string;
  glow?: boolean;
}) {
  const words = text.split(" ");
  return (
    <>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        {words.map((word, i) => (
          <Fragment key={i}>
            <span data-word className={`inline-block ${wordClassName} ${glow ? "rd-text-glow" : ""}`}>
              {word}
            </span>
            {i < words.length - 1 ? " " : null}
          </Fragment>
        ))}
      </span>
    </>
  );
}

/**
 * Stanza line: first word in --rd-white, the rest in --rd-chrome. Words listed
 * in `glowWords` carry an accent overlay (final state: glowing) that motion can
 * ignite. The real text stays in the DOM; the overlay is aria-hidden.
 */
export function StanzaLine({ line, glowWords = [] }: { line: string; glowWords?: string[] }) {
  const [first, ...rest] = line.split(" ");
  return (
    <>
      <span className="text-rd-white">{first}</span>
      {rest.length > 0 && (
        <span className="text-rd-chrome">
          {rest.map((word, i) => {
            const bare = word.replace(/[^\p{L}]/gu, "");
            return (
              <Fragment key={i}>
                {" "}
                {glowWords.includes(bare) ? (
                  <span className="relative inline-block">
                    {word}
                    <span data-glow aria-hidden="true" className="rd-text-glow absolute inset-0 text-accent">
                      {word}
                    </span>
                  </span>
                ) : (
                  word
                )}
              </Fragment>
            );
          })}
        </span>
      )}
    </>
  );
}
