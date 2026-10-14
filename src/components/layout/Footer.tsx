import Link from "next/link";
import { Wordmark } from "@/components/brand/Wordmark";
import { facts } from "@/config/facts";
import { instagramUrl, publicValue, site } from "@/config/site";
import { liveLegalRoutes, liveRoutes } from "@/config/nav";

export async function Footer() {
  "use cache";
  const owner = publicValue(facts.legalName) ?? site.name;
  const year = new Date().getFullYear();

  return (
    <footer data-fog-cap className="border-t border-rd-chrome/15 text-rd-chrome">
      <div className="mx-auto flex max-w-[1600px] flex-col gap-12 px-4 py-16 md:flex-row md:justify-between md:px-8 md:py-20">
        <div className="flex flex-col gap-5">
          <Link href="/" aria-label="Rogue Desire home" className="block w-32">
            <Wordmark size="sm" />
          </Link>
          <p className="max-w-[36ch]">The night disappears. The object remembers.</p>
        </div>

        <nav aria-label="Footer" className="flex flex-col gap-8 sm:flex-row sm:gap-16">
          <ul className="flex flex-col gap-1">
            {liveRoutes.map((route) => (
              <li key={route.href}>
                <Link href={route.href} className="inline-flex min-h-11 items-center hover:text-rd-white">
                  {route.label}
                </Link>
              </li>
            ))}
          </ul>
          <a
            href={instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-11 items-center self-start hover:text-rd-white"
          >
            Instagram @{site.instagram}
          </a>
        </nav>
      </div>

      <div className="mx-auto flex max-w-[1600px] flex-col gap-2 border-t border-rd-chrome/10 px-4 py-6 text-sm sm:flex-row sm:justify-between md:px-8">
        <p>
          © {year} {owner}
        </p>
        {liveLegalRoutes.length > 0 && (
          <ul className="flex gap-6">
            {liveLegalRoutes.map((route) => (
              <li key={route.href}>
                <Link href={route.href} className="hover:text-rd-white">
                  {route.label}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </footer>
  );
}
