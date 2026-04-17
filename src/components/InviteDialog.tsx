import { useState, useEffect } from "react";
import { X, Copy, Check, Mail, Crown, Pencil, Eye } from "lucide-react";
import { createInvite, getListMembers } from "@/lib/api.functions";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import type { Session } from "@supabase/supabase-js";

interface Member {
  user_id: string;
  role: string;
  joined_at: string;
  email: string | null;
}

interface InviteDialogProps {
  open: boolean;
  onClose: () => void;
  listId: string;
  session: Session;
}

const roleLabels: Record<string, { label: string; icon: typeof Crown }> = {
  owner: { label: "Dono", icon: Crown },
  editor: { label: "Editor", icon: Pencil },
  viewer: { label: "Visualizador", icon: Eye },
};

export function InviteDialog({ open, onClose, listId, session }: InviteDialogProps) {
  const [inviteLink, setInviteLink] = useState("");
  const [email, setEmail] = useState("");
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [members, setMembers] = useState<Member[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [selectedRole, setSelectedRole] = useState<"editor" | "viewer">("editor");

  useEffect(() => {
    if (!open) return;
    setLoadingMembers(true);
    getListMembers({
      data: { listId },
      headers: { Authorization: `Bearer ${session.access_token}` },
    })
      .then((res) => setMembers(res.members ?? []))
      .catch((err) => console.error("getListMembers failed", err))
      .finally(() => setLoadingMembers(false));
  }, [open, listId, session.access_token]);

  if (!open) return null;

  const handleGenerateLink = async () => {
    setLoading(true);
    setError("");
    try {
      const { invite } = await createInvite({
        data: { listId, role: "editor" },
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      const link = `${window.location.origin}/invite/${invite.invite_code}`;
      setInviteLink(link);
    } catch (err: any) {
      setError(err.message || "Erro ao criar convite");
    } finally {
      setLoading(false);
    }
  };

  const handleInviteByEmail = async () => {
    if (!email.trim()) return;
    setLoading(true);
    setError("");
    try {
      const { invite } = await createInvite({
        data: { listId, email: email.trim(), role: "editor" },
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      const link = `${window.location.origin}/invite/${invite.invite_code}`;
      setInviteLink(link);
      setEmail("");
    } catch (err: any) {
      setError(err.message || "Erro ao criar convite");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getInitial = (email: string | null) => {
    if (!email) return "?";
    return email.charAt(0).toUpperCase();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="fixed inset-0 bg-foreground/40" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md rounded-t-2xl sm:rounded-2xl bg-card p-6 shadow-xl max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-card-foreground">Convidar Pessoas</h2>
          <button onClick={onClose} className="p-1 text-muted-foreground hover:text-foreground">
            <X size={20} />
          </button>
        </div>

        {/* Members section */}
        <div className="mb-5">
          <p className="text-sm font-medium text-card-foreground mb-3">
            Membros ({members.length})
          </p>
          {loadingMembers ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
              Carregando...
            </div>
          ) : members.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhum membro encontrado.</p>
          ) : (
            <div className="space-y-2">
              {members.map((m) => {
                const roleInfo = roleLabels[m.role] ?? { label: m.role, icon: Eye };
                const RoleIcon = roleInfo.icon;
                return (
                  <div
                    key={m.user_id}
                    className="flex items-center gap-3 rounded-lg bg-muted/50 px-3 py-2"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                        {getInitial(m.email)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="flex-1 text-sm text-card-foreground truncate">
                      {m.email ?? "Sem email"}
                    </span>
                    <Badge variant="secondary" className="flex items-center gap-1 text-xs">
                      <RoleIcon size={12} />
                      {roleInfo.label}
                    </Badge>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="border-t border-border pt-4" />

        {error && (
          <div className="mb-4 rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</div>
        )}

        <div className="space-y-4">
          {/* Generate link */}
          <div>
            <p className="text-sm font-medium text-card-foreground mb-2">Link de convite</p>
            {inviteLink ? (
              <div className="flex gap-2">
                <input
                  readOnly
                  value={inviteLink}
                  className="flex-1 rounded-lg border border-input bg-background px-3 py-2 text-xs text-foreground truncate"
                />
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1 rounded-lg bg-primary px-3 py-2 text-xs font-medium text-primary-foreground"
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                  {copied ? "Copiado!" : "Copiar"}
                </button>
              </div>
            ) : (
              <button
                onClick={handleGenerateLink}
                disabled={loading}
                className="w-full rounded-lg border border-input bg-background py-2.5 text-sm font-medium text-foreground hover:bg-accent transition-colors disabled:opacity-50"
              >
                {loading ? "Gerando..." : "Gerar link de convite"}
              </button>
            )}
          </div>

          {/* Invite by email */}
          <div>
            <p className="text-sm font-medium text-card-foreground mb-2">Convidar por email</p>
            <div className="flex gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@exemplo.com"
                className="flex-1 rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                onKeyDown={(e) => e.key === "Enter" && handleInviteByEmail()}
              />
              <button
                onClick={handleInviteByEmail}
                disabled={loading || !email.trim()}
                className="flex items-center gap-1 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
              >
                <Mail size={14} />
                Enviar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
