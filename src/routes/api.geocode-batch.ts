import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

// Public batch geocoder. Bypasses RLS via service role.
// Designed to be called repeatedly (cron / manual / script) until `remaining`=0.
// Processes up to 8 restaurants per call (~9s) to stay within Worker timeout.

type NominatimResult = {
  display_name: string;
  lat: string;
  lon: string;
  type?: string;
  class?: string;
};

async function nominatimSearch(query: string, limit = 3): Promise<NominatimResult[]> {
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&addressdetails=1&limit=${limit}&accept-language=pt-BR`;
  const res = await fetch(url, {
    headers: {
      "User-Agent": "ToGo-Restaurants-App/1.0 (lovable.dev)",
      "Accept-Language": "pt-BR,pt;q=0.9",
    },
  });
  if (!res.ok) return [];
  return (await res.json()) as NominatimResult[];
}

function pickBest(results: NominatimResult[], name: string): NominatimResult | null {
  if (results.length === 0) return null;
  const nl = name.toLowerCase();
  const score = (r: NominatimResult) => {
    let s = 0;
    const dn = r.display_name.toLowerCase();
    if (dn.includes(nl)) s += 10;
    if (r.class === "amenity" || r.class === "shop" || r.class === "tourism") s += 5;
    if (
      r.type === "restaurant" ||
      r.type === "cafe" ||
      r.type === "bar" ||
      r.type === "fast_food" ||
      r.type === "pub" ||
      r.type === "bakery" ||
      r.type === "ice_cream"
    ) s += 8;
    return s;
  };
  return [...results].sort((a, b) => score(b) - score(a))[0];
}

export const Route = createFileRoute("/api/geocode-batch")({
  server: {
    handlers: {
      GET: async () => {
        const BATCH = 6;
        // Reset previous "__not_found__" markers so we retry with smarter queries
        await supabaseAdmin
          .from("restaurants")
          .update({ address: null })
          .eq("address", "__not_found__");

        const { data: rows, error } = await supabaseAdmin
          .from("restaurants")
          .select("id, name, location")
          .or("latitude.is.null,longitude.is.null")
          .limit(BATCH);

        if (error) {
          return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
          });
        }

        const pending = rows ?? [];
        let updated = 0;
        let failed = 0;

        for (let i = 0; i < pending.length; i++) {
          const r: any = pending[i];
          const bias = (r.location?.trim() || "São Paulo, Brasil");
          // Try queries in order of specificity
          const queries = [
            `${r.name}, ${bias}`,
            `restaurante ${r.name}, ${bias}`,
          ];
          let found: NominatimResult | null = null;
          for (const q of queries) {
            const results = await nominatimSearch(q, 3);
            const best = pickBest(results, r.name);
            if (best) { found = best; break; }
            if (i < pending.length - 1 || queries.indexOf(q) < queries.length - 1) {
              await new Promise((res) => setTimeout(res, 1100));
            }
          }
          if (found) {
            await supabaseAdmin
              .from("restaurants")
              .update({
                latitude: parseFloat(found.lat),
                longitude: parseFloat(found.lon),
                address: found.display_name,
              })
              .eq("id", r.id);
            updated++;
          } else {
            await supabaseAdmin
              .from("restaurants")
              .update({ address: "__not_found__" })
              .eq("id", r.id);
            failed++;
          }
        }

        const { count: remaining } = await supabaseAdmin
          .from("restaurants")
          .select("*", { count: "exact", head: true })
          .or("latitude.is.null,longitude.is.null")
          .neq("address", "__not_found__");

        return new Response(
          JSON.stringify({
            processed: pending.length,
            updated,
            failed,
            remaining: remaining ?? 0,
          }),
          { status: 200, headers: { "Content-Type": "application/json" } }
        );
      },
    },
  },
});
