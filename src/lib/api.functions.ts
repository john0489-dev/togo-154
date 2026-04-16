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
    })
  )
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { error } = await supabase
      .from("restaurants")
      .update({
        ...(data.visited !== undefined ? { visited: data.visited } : {}),
        ...(data.rating !== undefined ? { rating: data.rating } : {}),
      })
      .eq("id", data.id);

    if (error) safeError("updateRestaurant", error);
    return { success: true };
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

// Get list members
export const getListMembers = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ listId: z.string().uuid() }))
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { data: members, error } = await supabase
      .from("list_members")
      .select("*")
      .eq("list_id", data.listId);

    if (error) safeError("getListMembers", error);
    return { members: members ?? [] };
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
