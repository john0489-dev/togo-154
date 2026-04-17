import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

// Safe error helper — logs details server-side, returns generic message to client
function safeError(context: string, error: { message?: string; code?: string }): never {
  console.error(`[server] ${context}:`, error);
  throw new Error("Ocorreu um erro inesperado. Tente novamente.");
}

// Get all lists the user is a member of
export const getUserLists = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    // Query via list_members to avoid RLS issues with direct lists query
    const { data, error } = await supabase
      .from("list_members")
      .select("list_id, role, lists(*)")
      .eq("user_id", userId)
      .order("joined_at", { ascending: false });

    if (error) safeError("getUserLists", error);

    const lists = (data ?? []).map((m: any) => ({
      ...m.lists,
      role: m.role,
    }));
    return { lists };
  });

// Create a new list
export const createList = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ name: z.string().min(1).max(100) }))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: list, error } = await supabase
      .from("lists")
      .insert({ name: data.name, created_by: userId })
      .select()
      .single();

    if (error) safeError("createList", error);
    return { list };
  });

// Get restaurants for a list
export const getRestaurants = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ listId: z.string().uuid() }))
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { data: restaurants, error } = await supabase
      .from("restaurants")
      .select("*")
      .eq("list_id", data.listId)
      .order("created_at", { ascending: false });

    if (error) safeError("getRestaurants", error);
    return { restaurants: restaurants ?? [] };
  });

// Add a restaurant
export const addRestaurant = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    z.object({
      listId: z.string().uuid(),
      name: z.string().min(1).max(200),
      location: z.string().max(200),
      cuisine: z.string().max(100),
      visited: z.boolean().optional(),
      rating: z.number().min(0).max(10).optional(),
      address: z.string().max(300).optional(),
      latitude: z.number().optional(),
      longitude: z.number().optional(),
    })
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: restaurant, error } = await supabase
      .from("restaurants")
      .insert({
        list_id: data.listId,
        name: data.name,
        location: data.location,
        cuisine: data.cuisine,
        visited: data.visited ?? false,
        rating: data.rating ?? 0,
        address: data.address ?? null,
        latitude: data.latitude ?? null,
        longitude: data.longitude ?? null,
        added_by: userId,
      })
      .select()
      .single();

    if (error) safeError("addRestaurant", error);
    return { restaurant };
  });

// Update a restaurant
export const updateRestaurant = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    z.object({
      id: z.string().uuid(),
      visited: z.boolean().optional(),
      rating: z.number().min(0).max(10).optional(),
      location: z.string().max(300).optional(),
      address: z.string().max(300).optional(),
      latitude: z.number().optional(),
      longitude: z.number().optional(),
    })
  )
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const update: {
      visited?: boolean;
      rating?: number;
      location?: string;
      address?: string;
      latitude?: number;
      longitude?: number;
    } = {};
    if (data.visited !== undefined) update.visited = data.visited;
    if (data.rating !== undefined) update.rating = data.rating;
    if (data.location !== undefined) update.location = data.location;
    if (data.address !== undefined) update.address = data.address;
    if (data.latitude !== undefined) update.latitude = data.latitude;
    if (data.longitude !== undefined) update.longitude = data.longitude;

    const { error } = await supabase
      .from("restaurants")
      .update(update)
      .eq("id", data.id);

    if (error) safeError("updateRestaurant", error);
    return { success: true };
  });

// ----- Geocoding via Nominatim (OpenStreetMap) -----
type NominatimResult = {
  display_name: string;
  lat: string;
  lon: string;
  type?: string;
  class?: string;
};

async function nominatimSearch(query: string, limit = 5): Promise<NominatimResult[]> {
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

// Search restaurant address suggestions by name (+ optional location bias)
export const searchRestaurantAddress = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    z.object({
      name: z.string().min(2).max(200),
      location: z.string().max(200).optional(),
    })
  )
  .handler(async ({ data }) => {
    const bias = data.location?.trim() || "São Paulo, Brasil";
    const query = `${data.name}, ${bias}`;
    try {
      const results = await nominatimSearch(query, 5);
      const suggestions = results.map((r) => ({
        display_name: r.display_name,
        latitude: parseFloat(r.lat),
        longitude: parseFloat(r.lon),
      }));
      return { suggestions };
    } catch (err) {
      console.error("[searchRestaurantAddress]", err);
      return { suggestions: [] };
    }
  });

// Geocode all restaurants in a list that don't yet have coordinates
export const geocodeListRestaurants = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ listId: z.string().uuid() }))
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { data: rows, error } = await supabase
      .from("restaurants")
      .select("id, name, location, latitude, longitude")
      .eq("list_id", data.listId);

    if (error) safeError("geocodeListRestaurants:fetch", error);

    const pending = (rows ?? []).filter(
      (r: any) => r.latitude == null || r.longitude == null
    );

    let updated = 0;
    let failed = 0;

    for (const r of pending) {
      const bias = r.location?.trim() || "São Paulo, Brasil";
      const query = `${r.name}, ${bias}`;
      try {
        const results = await nominatimSearch(query, 1);
        if (results.length > 0) {
          const top = results[0];
          const { error: upErr } = await supabase
            .from("restaurants")
            .update({
              latitude: parseFloat(top.lat),
              longitude: parseFloat(top.lon),
              address: top.display_name,
            })
            .eq("id", r.id);
          if (upErr) {
            console.error("[geocodeListRestaurants:update]", upErr);
            failed++;
          } else {
            updated++;
          }
        } else {
          failed++;
        }
      } catch (err) {
        console.error("[geocodeListRestaurants:fetch]", err);
        failed++;
      }
      // Be polite with Nominatim's free tier (max 1 req/sec)
      await new Promise((resolve) => setTimeout(resolve, 1100));
    }

    return { total: pending.length, updated, failed };
  });

// Delete a restaurant
export const deleteRestaurant = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ id: z.string().uuid() }))
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { error } = await supabase
      .from("restaurants")
      .delete()
      .eq("id", data.id);

    if (error) safeError("deleteRestaurant", error);
    return { success: true };
  });

// Create invite link
export const createInvite = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    z.object({
      listId: z.string().uuid(),
      email: z.string().email().optional(),
      role: z.enum(["editor", "viewer"]).optional(),
    })
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: invite, error } = await supabase
      .from("list_invites")
      .insert({
        list_id: data.listId,
        email: data.email ?? null,
        role: data.role ?? "editor",
        created_by: userId,
      })
      .select()
      .single();

    if (error) safeError("createInvite", error);
    return { invite };
  });

// Get list members with profile info
export const getListMembers = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ listId: z.string().uuid() }))
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { data: members, error } = await supabase
      .from("list_members")
      .select("user_id, role, joined_at, profiles!list_members_user_id_profiles_fkey(email)")
      .eq("list_id", data.listId)
      .order("joined_at", { ascending: true });

    if (error) safeError("getListMembers", error);

    const result = (members ?? []).map((m: any) => ({
      user_id: m.user_id,
      role: m.role,
      joined_at: m.joined_at,
      email: m.profiles?.email ?? null,
    }));
    return { members: result };
  });

// Seed default restaurants into a list
export const seedDefaultRestaurants = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ listId: z.string().uuid() }))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    // Check if list already has restaurants
    const { count } = await supabase
      .from("restaurants")
      .select("*", { count: "exact", head: true })
      .eq("list_id", data.listId);

    if (count && count > 0) return { seeded: false };

    // Import default data
    const { default: defaultData } = await import("@/lib/restaurant-defaults");
    const rows = defaultData.map((r) => ({
      list_id: data.listId,
      name: r.name,
      location: r.location,
      cuisine: r.cuisine,
      visited: r.visited,
      rating: r.rating,
      added_by: userId,
    }));

    const { error } = await supabase.from("restaurants").insert(rows);
    if (error) safeError("seedDefaultRestaurants", error);
    return { seeded: true };
  });
