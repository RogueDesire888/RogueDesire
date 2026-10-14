import { Button } from "@/components/ui/Button";
import { CIRCLE_HREF, isLive } from "@/config/nav";
import { instagramUrl, site } from "@/config/site";

/** Closing CTA: Enter the Circle when /circle is live, otherwise the Instagram signal. */
export function SignalCta({ className = "" }: { className?: string }) {
  return (
    <div className={`flex flex-col items-center gap-3 ${className}`}>
      {isLive(CIRCLE_HREF) ? (
        <Button href={CIRCLE_HREF}>Enter the Circle</Button>
      ) : (
        <>
          <Button href={instagramUrl} target="_blank" rel="noopener noreferrer">
            Follow the signal
          </Button>
          <span className="text-sm text-rd-chrome">@{site.instagram}</span>
        </>
      )}
    </div>
  );
}
