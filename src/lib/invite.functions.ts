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
      throw new Error(memberErr.message);
    }

    // Mark as accepted
    await supabaseAdmin
      .from("list_invites")
      .update({ accepted: true })
      .eq("id", invite.id);

    return { listId: invite.list_id, alreadyMember: false };
  });
