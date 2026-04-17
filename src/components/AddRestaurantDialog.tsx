import { useState, useEffect, useRef } from "react";
import { X, MapPin, Loader2, Check } from "lucide-react";
import { searchRestaurantAddress } from "@/lib/api.functions";
import type { Session } from "@supabase/supabase-js";

interface AddressSuggestion {
  display_name: string;
  latitude: number;
  longitude: number;
}

interface AddRestaurantDialogProps {
  open: boolean;
  onClose: () => void;
  session: Session;
  onAdd: (data: {
    name: string;
    location: string;
    cuisine: string;
    address?: string;
    latitude?: number;
    longitude?: number;
  }) => void;
}

const CUISINE_OPTIONS = [
  "Árabe", "Argentino", "Bar", "Bar de Vinhos", "Brasileiro", "Café",
  "Chinês", "Coreano", "Doceria", "Espanhol", "Francês", "Grego",
  "Hamburgueria", "Indiano", "Italiano", "Japonês", "Mediterrâneo",
  "Mexicano", "Padaria", "Peruano", "Pizzaria", "Português",
  "Sorveteria", "Steakhouse", "Sushi", "Tailandês", "Vegano",
  "Vegetariano", "Vietnamita", "Outro"
];

export function AddRestaurantDialog({ open, onClose, session, onAdd }: AddRestaurantDialogProps) {
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [cuisine, setCuisine] = useState("Bar");
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [searching, setSearching] = useState(false);
  const [selected, setSelected] = useState<AddressSuggestion | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reqIdRef = useRef(0);

  // Debounced address search by name (+ location bias)
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (name.trim().length < 3) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    if (selected && selected.display_name) return; // user already picked
    debounceRef.current = setTimeout(async () => {
      const myReq = ++reqIdRef.current;
      setSearching(true);
      try {
        const { suggestions: results } = await searchRestaurantAddress({
          data: { name: name.trim(), location: location.trim() || undefined },
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
        if (myReq !== reqIdRef.current) return;
        setSuggestions(results);
        setShowSuggestions(results.length > 0);
      } catch (err) {
        console.error("address search failed", err);
      } finally {
        if (myReq === reqIdRef.current) setSearching(false);
      }
    }, 600);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [name, location, selected, session.access_token]);

  if (!open) return null;

  const handlePickSuggestion = (s: AddressSuggestion) => {
    setSelected(s);
    setLocation(s.display_name);
    setShowSuggestions(false);
  };

  const handleClearSuggestion = () => {
    setSelected(null);
    setShowSuggestions(suggestions.length > 0);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onAdd({
      name: name.trim(),
      location: location.trim(),
      cuisine,
      address: selected?.display_name,
      latitude: selected?.latitude,
      longitude: selected?.longitude,
    });
    setName("");
    setLocation("");
    setCuisine("Bar");
    setSelected(null);
    setSuggestions([]);
    setShowSuggestions(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="fixed inset-0 bg-foreground/40" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md rounded-t-2xl sm:rounded-2xl bg-card p-6 shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-card-foreground">Adicionar Restaurante</h2>
          <button onClick={onClose} className="p-1 text-muted-foreground hover:text-foreground">
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-card-foreground mb-1">
              Nome
            </label>
            <div className="relative">
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (selected) setSelected(null);
                }}
                placeholder="Nome do restaurante"
                className="w-full rounded-lg border border-input bg-background px-3 py-2 pr-9 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                required
              />
              {searching && (
                <Loader2 size={16} className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-muted-foreground" />
              )}
            </div>

            {/* Suggestions dropdown */}
            {showSuggestions && suggestions.length > 0 && !selected && (
              <div className="mt-1 rounded-lg border border-border bg-popover shadow-md overflow-hidden">
                <p className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground bg-muted/50">
                  {suggestions.length === 1 ? "Endereço encontrado" : "Selecione o endereço correto"}
                </p>
                <ul className="max-h-48 overflow-y-auto">
                  {suggestions.map((s, i) => (
                    <li key={i}>
                      <button
                        type="button"
                        onClick={() => handlePickSuggestion(s)}
                        className="flex w-full items-start gap-2 px-3 py-2 text-left text-xs text-foreground hover:bg-accent transition-colors"
                      >
                        <MapPin size={14} className="mt-0.5 shrink-0 text-primary" />
                        <span className="flex-1">{s.display_name}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* No results message */}
            {!searching && name.trim().length >= 3 && !selected && suggestions.length === 0 && showSuggestions === false && (
              <p className="mt-1 text-[11px] text-muted-foreground">
                Nenhum endereço encontrado — preencha manualmente abaixo.
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-card-foreground mb-1">
              Localização / Endereço
            </label>
            {selected ? (
              <div className="rounded-lg border border-primary/40 bg-primary/5 px-3 py-2 flex items-start gap-2">
                <Check size={14} className="mt-0.5 shrink-0 text-primary" />
                <span className="flex-1 text-xs text-foreground">{selected.display_name}</span>
                <button
                  type="button"
                  onClick={handleClearSuggestion}
                  className="text-[11px] font-medium text-primary hover:underline shrink-0"
                >
                  Editar
                </button>
              </div>
            ) : (
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Cidade, bairro ou endereço"
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-card-foreground mb-1">Culinária</label>
            <select
              value={cuisine}
              onChange={(e) => setCuisine(e.target.value)}
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {CUISINE_OPTIONS.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            className="w-full rounded-lg bg-primary py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Adicionar
          </button>
        </form>
      </div>
    </div>
  );
}
