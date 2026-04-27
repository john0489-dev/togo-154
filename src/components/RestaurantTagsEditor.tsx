import { useEffect, useMemo, useRef, useState } from "react";
import { Lock, Plus, X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { usePlan } from "@/hooks/usePlan";
import { useUpgradeModal } from "@/hooks/useUpgradeModal";
import { updateRestaurant } from "@/lib/api.functions";
import { supabase } from "@/integrations/supabase/client";

const MAX_TAGS = 5;
const MAX_TAG_LEN = 40;

interface Props {
  restaurantId: string;
  tags: string[];
  /** Suggested tags (e.g. user's most-used). */
  suggestions?: string[];
  onChange: (tags: string[]) => void;
}

async function authHeaders() {
  const { data } = await supabase.auth.getSession();
  return { Authorization: `Bearer ${data.session?.access_token ?? ""}` };
}

const PALETTE = [
  { bg: "#f6e9d8", fg: "#7a4d1b" },
  { bg: "#e9efe0", fg: "#3f5b25" },
  { bg: "#f0e1e8", fg: "#7a3552" },
  { bg: "#e1ebf0", fg: "#27506a" },
  { bg: "#f5e6dc", fg: "#7a3a1b" },
];

export function chipColorFor(tag: string): { bg: string; fg: string } {
  let h = 0;
  for (let i = 0; i < tag.length; i++) h = (h * 31 + tag.charCodeAt(i)) >>> 0;
  return PALETTE[h % PALETTE.length];
}

export function RestaurantTagsEditor({ restaurantId, tags, suggestions = [], onChange }: Props) {
  const { plan } = usePlan();
  const upgrade = useUpgradeModal();
  const isPro = plan === "pro";

  const [value, setValue] = useState<string[]>(tags);
  const [input, setInput] = useState("");
  const [saving, setSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setValue(tags);
  }, [tags]);

  const filteredSuggestions = useMemo(() => {
    const q = input.trim().toLowerCase();
    return suggestions
      .filter((s) => !value.includes(s))
      .filter((s) => (q ? s.toLowerCase().includes(q) : true))
      .slice(0, 6);
  }, [suggestions, value, input]);

  const persist = async (next: string[]) => {
    setSaving(true);
    try {
      await updateRestaurant({
        data: { id: restaurantId, tags: next },
        headers: await authHeaders(),
      });
      onChange(next);
    } catch (err) {
      console.error("[tags save] failed:", err);
      toast.error("Não foi possível salvar as tags");
      setValue(tags); // revert
    } finally {
      setSaving(false);
    }
  };

  const addTag = (raw: string) => {
    const tag = raw.trim().slice(0, MAX_TAG_LEN);
    if (!tag) return;
    if (value.includes(tag)) {
      setInput("");
      return;
    }
    if (value.length >= MAX_TAGS) {
      toast.error(`Máximo de ${MAX_TAGS} tags`);
      return;
    }
    const next = [...value, tag];
    setValue(next);
    setInput("");
    void persist(next);
  };

  const removeTag = (tag: string) => {
    const next = value.filter((t) => t !== tag);
    setValue(next);
    void persist(next);
  };

  if (!isPro) {
    return (
      <button
        type="button"
        onClick={() => upgrade.open({ featureName: "Notas e tags são exclusivas do To Go Pro" })}
        className="flex w-full items-center justify-between rounded-lg border border-dashed px-3 py-2.5 text-sm text-left transition-colors"
        style={{ borderColor: "#c4844a", color: "#c4844a", background: "#faf7f2" }}
      >
        <span>Adicionar tags...</span>
        <Lock size={14} />
      </button>
    );
  }

  const canAdd = value.length < MAX_TAGS;

  return (
    <div className="space-y-2">
      {value.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {value.map((tag) => {
            const c = chipColorFor(tag);
            return (
              <span
                key={tag}
                className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium"
                style={{ background: c.bg, color: c.fg }}
              >
                {tag}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="ml-0.5 rounded-full p-0.5 hover:bg-black/10"
                  aria-label={`Remover ${tag}`}
                >
                  <X size={11} />
                </button>
              </span>
            );
          })}
        </div>
      )}

      {canAdd && (
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            placeholder="ex: favorito, romântico..."
            maxLength={MAX_TAG_LEN}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === ",") {
                e.preventDefault();
                addTag(input);
              } else if (e.key === "Backspace" && !input && value.length > 0) {
                removeTag(value[value.length - 1]);
              }
            }}
            className="flex-1 rounded-lg border border-border bg-white px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <button
            type="button"
            onClick={() => addTag(input)}
            disabled={!input.trim() || saving}
            className="flex items-center justify-center rounded-lg px-3 text-sm font-medium text-white transition-colors disabled:opacity-50"
            style={{ background: "#c4844a" }}
            aria-label="Adicionar tag"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
          </button>
        </div>
      )}

      {canAdd && filteredSuggestions.length > 0 && (
        <div>
          <p className="text-xs text-muted-foreground mb-1">Sugestões</p>
          <div className="flex flex-wrap gap-1.5">
            {filteredSuggestions.map((s) => {
              const c = chipColorFor(s);
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => addTag(s)}
                  className="inline-flex items-center gap-1 rounded-full border border-dashed px-2.5 py-1 text-xs font-medium transition-colors hover:opacity-80"
                  style={{ borderColor: c.fg, color: c.fg, background: "transparent" }}
                >
                  <Plus size={10} />
                  {s}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        {value.length}/{MAX_TAGS} tags
      </p>
    </div>
  );
}
