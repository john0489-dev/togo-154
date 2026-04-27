import { useEffect, useRef, useState } from "react";
import { Lock, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { usePlan } from "@/hooks/usePlan";
import { useUpgradeModal } from "@/hooks/useUpgradeModal";
import { updateRestaurant } from "@/lib/api.functions";
import { supabase } from "@/integrations/supabase/client";

const MAX_LEN = 500;
const DEBOUNCE_MS = 1000;

interface Props {
  restaurantId: string;
  notes: string;
  onChange: (notes: string) => void;
}

async function authHeaders() {
  const { data } = await supabase.auth.getSession();
  return { Authorization: `Bearer ${data.session?.access_token ?? ""}` };
}

export function RestaurantNotesEditor({ restaurantId, notes, onChange }: Props) {
  const { plan } = usePlan();
  const upgrade = useUpgradeModal();
  const isPro = plan === "pro";

  const [value, setValue] = useState(notes);
  const [saving, setSaving] = useState(false);
  const lastSavedRef = useRef(notes);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync from external prop changes (e.g. realtime / refetch)
  useEffect(() => {
    setValue(notes);
    lastSavedRef.current = notes;
  }, [notes]);

  const persist = async (next: string) => {
    if (next === lastSavedRef.current) return;
    setSaving(true);
    try {
      await updateRestaurant({
        data: { id: restaurantId, notes: next },
        headers: await authHeaders(),
      });
      lastSavedRef.current = next;
      onChange(next);
    } catch (err) {
      console.error("[notes save] failed:", err);
      toast.error("Não foi possível salvar a nota");
    } finally {
      setSaving(false);
    }
  };

  const scheduleSave = (next: string) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => persist(next), DEBOUNCE_MS);
  };

  const handleBlur = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    void persist(value);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  if (!isPro) {
    return (
      <button
        type="button"
        onClick={() => upgrade.open({ featureName: "Notas e tags são exclusivas do To Go Pro" })}
        className="flex w-full items-center justify-between rounded-lg border border-dashed px-3 py-2.5 text-sm text-left transition-colors"
        style={{ borderColor: "#c4844a", color: "#c4844a", background: "#faf7f2" }}
      >
        <span>Adicionar uma nota...</span>
        <Lock size={14} />
      </button>
    );
  }

  const remaining = MAX_LEN - value.length;

  return (
    <div className="space-y-1">
      <textarea
        value={value}
        maxLength={MAX_LEN}
        placeholder="Adicione uma nota... ex: peça o risoto"
        onChange={(e) => {
          setValue(e.target.value);
          scheduleSave(e.target.value);
        }}
        onBlur={handleBlur}
        rows={3}
        className="w-full resize-none rounded-lg border border-border bg-white px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
      />
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{saving ? <Loader2 size={12} className="animate-spin inline" /> : "\u00A0"}</span>
        <span className={remaining < 50 ? "text-destructive" : ""}>{value.length}/{MAX_LEN}</span>
      </div>
    </div>
  );
}
