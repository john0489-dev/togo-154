import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

// Accept invite — uses admin client to read invite by code (RLS restricts by email)
export const acceptInvite = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ inviteCode: z.string().min(1).max(64).regex(/^[a-f0-9]+$/) }))
  .handler(async ({ data, context }) => {
    const { userId } = context;

    // Dynamic import of admin client (server-only)
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // Read invite by code using admin (bypasses RLS)
    const { data: invite, error: fetchErr } = await supabaseAdmin
      .from("list_invites")
      .select("*")
      .eq("invite_code", data.inviteCode)
      .eq("accepted", false)
      .single();

    if (fetchErr || !invite) throw new Error("Convite não encontrado ou já usado.");

    // If the invite is email-targeted, verify the accepting user's email matches
    if (invite.email) {
      const { data: { user }, error: userErr } = await supabaseAdmin.auth.admin.getUserById(userId);
      if (userErr || !user) {
        console.error("[server] Failed to fetch user for email check:", userErr);
        throw new Error("Ocorreu um erro inesperado. Tente novamente.");
      }
      if (user.email?.toLowerCase() !== invite.email.toLowerCase()) {
        throw new Error("Este convite foi criado para outro email.");
      }
    }

    // Add user as member
    const { error: memberErr } = await supabaseAdmin
      .from("list_members")
      .insert({
        list_id: invite.list_id,
        user_id: userId,
        role: invite.role,
      });

    if (memberErr) {
      if (memberErr.code === "23505") {
        return { listId: invite.list_id, alreadyMember: true };
      }
      console.error("[server] Failed to add member:", memberErr);
      throw new Error("Ocorreu um erro inesperado. Tente novamente.");
    }

    // Mark as accepted
    await supabaseAdmin
      .from("list_invites")
      .update({ accepted: true })
      .eq("id", invite.id);

    return { listId: invite.list_id, alreadyMember: false };
  });
