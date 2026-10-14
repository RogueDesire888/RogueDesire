import type { ReactNode } from "react";
import { Redaction } from "@/components/ui/Redaction";
import { getFrequencies, isPublic, type Chapter } from "@/lib/content";

const hairline = "border-rd-chrome/20";

/**
 * Chapter disclosure rows: Date, Location, Frequencies, Access. Each shows its
 * real value when public, otherwise a redaction bar and "Undisclosed".
 * `drop` adds the data-drop hooks used by the home DropStage.
 */
export function Disclosure({ chapter, drop = false }: { chapter: Chapter; drop?: boolean }) {
  const location = [chapter.venue, chapter.city].filter(isPublic).join(", ");
  const frequencies = [...chapter.frequencies, ...getFrequencies(chapter.slug)].map((f) => f.name);
  const names = [...new Set(frequencies)].join(", ");
  const dateLabel = isPublic(chapter.date)
    ? new Date(`${chapter.date}T12:00:00`).toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : null;

  const rows: { label: string; value: ReactNode | null }[] = [
    { label: "Date", value: dateLabel },
    { label: "Location", value: isPublic(location) ? location : null },
    { label: "Frequencies", value: isPublic(names) ? names : null },
    {
      label: "Access",
      value: isPublic(chapter.ticketUrl) ? (
        <a href={chapter.ticketUrl} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4">
          Tickets
        </a>
      ) : null,
    },
  ];

  return (
    <>
      <dl className={`mt-10 w-full max-w-[720px] border-b ${hairline}`}>
        {rows.map((row) => (
          <div
            key={row.label}
            data-drop={drop ? "row" : undefined}
            className={`grid grid-cols-[6.5rem_1fr] items-center gap-4 border-t ${hairline} py-3 sm:grid-cols-[10rem_1fr]`}
          >
            <dt className="text-sm text-rd-chrome">{row.label}</dt>
            <dd className="flex min-w-0 items-center gap-4 text-rd-white">
              {row.value ?? (
                <>
                  <Redaction seed={`${chapter.code}-${row.label}`} />
                  <span className="shrink-0 text-sm whitespace-nowrap text-rd-chrome">Undisclosed</span>
                </>
              )}
            </dd>
          </div>
        ))}
      </dl>
      <p data-drop={drop ? "details" : undefined} className="mt-5 text-sm text-rd-chrome">
        Details surface when the signal is ready.
      </p>
    </>
  );
}
