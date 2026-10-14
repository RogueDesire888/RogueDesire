/**
 * Storage adapter for Circle entries. Today: Supabase over its REST API (no
 * client library needed), used only when SUPABASE_URL and
 * SUPABASE_SERVICE_ROLE_KEY are set. Server-only: the service role key must
 * never reach the client.
 */
export type CircleEntry = {
  name: string;
  email: string;
  city?: string;
  instagram?: string;
  role?: string;
  music?: string;
  involvement?: string;
  message?: string;
  referralCode?: string;
  sourcePath?: string;
  consent: true;
  ipHash?: string;
  userAgent?: string;
};

export interface CircleStore {
  /** Insert, or update an existing email's optional fields with any newly provided values. */
  upsert(entry: CircleEntry): Promise<void>;
}

function supabaseStore(url: string, serviceKey: string): CircleStore {
  const endpoint = `${url.replace(/\/$/, "")}/rest/v1/circle_entries?on_conflict=email_normalized`;
  return {
    async upsert(entry) {
      // Only send optional columns that have a value, so a repeat entry never
      // erases what someone told us before.
      const row: Record<string, unknown> = {
        name: entry.name,
        email: entry.email,
        email_normalized: entry.email.trim().toLowerCase(),
        consent: true,
      };
      const optional: [string, string | undefined][] = [
        ["city", entry.city],
        ["instagram", entry.instagram],
        ["role", entry.role],
        ["music", entry.music],
        ["involvement", entry.involvement],
        ["message", entry.message],
        ["referral_code", entry.referralCode],
        ["source_path", entry.sourcePath],
        ["ip_hash", entry.ipHash],
        ["user_agent", entry.userAgent],
      ];
      for (const [key, value] of optional) if (value) row[key] = value;

      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          apikey: serviceKey,
          Authorization: `Bearer ${serviceKey}`,
          "Content-Type": "application/json",
          Prefer: "resolution=merge-duplicates,return=minimal",
        },
        body: JSON.stringify(row),
        cache: "no-store",
      });
      if (!res.ok) throw new Error(`Circle store failed with ${res.status}`);
    },
  };
}

export function getCircleStore(): CircleStore | null {
  if (typeof window !== "undefined") throw new Error("getCircleStore is server-only");
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  return url && key ? supabaseStore(url, key) : null;
}
