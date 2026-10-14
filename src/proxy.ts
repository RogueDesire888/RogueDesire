import { NextResponse, type NextRequest } from "next/server";
import { isIndexable } from "@/lib/seo";

/**
 * Indexing guard: every response from a non-production host (all *.vercel.app
 * deployment URLs, local) carries X-Robots-Tag noindex, so preview links never
 * appear in search results. Pages are prerendered, so the guard lives here
 * rather than in per-page metadata.
 */
export function proxy(request: NextRequest) {
  const response = NextResponse.next();
  if (!isIndexable(request.headers.get("host"))) {
    response.headers.set("X-Robots-Tag", "noindex, nofollow");
  }
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image).*)"],
};
