import { useState, useEffect, useRef } from "react";
import { X, Loader2 } from "lucide-react";
import { searchRestaurantAddress } from "@/lib/api.functions";

interface AddRestaurantDialogProps {
  open: boolean;
  onClose: () => void;
  onAdd: (data: { name: string; location: string; cuisine: string }) => void;
}

const CUISINE_OPTIONS = [
  "Árabe", "Argentino", "Bar", "Bar de Vinhos", "Brasileiro", "Café",
  "Chinês", "Coreano", "Doceria", "Espanhol", "Francês", "Grego",
  "Hamburgueria", "Indiano", "Italiano", "Japonês", "Mediterrâneo",
  "Mexicano", "Padaria", "Peruano", "Pizzaria", "Português",
  "Sorveteria", "Steakhouse", "Sushi", "Tailandês", "Vegano",
  "Vegetariano", "Vietnamita", "Outro"
];

type Suggestion = { display_name: string; lat: number; lng: number };

export function AddRestaurantDialog({ open, onClose, onAdd }: AddRestaurantDialogProps) {
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [cuisine, setCuisine] = useState("Bar");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [searching, setSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [autoFilled, setAutoFilled] = useState(false);
  const [searched, setSearched] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reqIdRef = useRef(0);

  useEffect(() => {
    if (!open) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const trimmed = name.trim();
    if (trimmed.length < 3) {
      setSuggestions([]);
      setShowSuggestions(false);
      setSearched(false);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      const myId = ++reqIdRef.current;
      setSearching(true);
      try {
        const res = await searchRestaurantAddress({ data: { query: trimmed } });
        if (myId !== reqIdRef.current) return;
        const list = res.suggestions ?? [];
        setSuggestions(list);
        setSearched(true);
        if (list.length === 1) {
          setLocation(list[0].display_name);
          setAutoFilled(true);
          setShowSuggestions(false);
        } else if (list.length > 1) {
          setShowSuggestions(true);
          setAutoFilled(false);
        } else {
          setShowSuggestions(false);
          setAutoFilled(false);
        }
      } finally {
        if (myId === reqIdRef.current) setSearching(false);
      }
    }, 500);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [name, open]);

  if (!open) return null;

  const reset = () => {
    setName("");
    setLocation("");
    setCuisine("Bar");
    setSuggestions([]);
    setShowSuggestions(false);
    setAutoFilled(false);
    setSearched(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onAdd({ name: name.trim(), location: location.trim(), cuisine });
    reset();
    onClose();
  };

  const pickSuggestion = (s: Suggestion) => {
    setLocation(s.display_name);
    setShowSuggestions(false);
    setAutoFilled(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="fixed inset-0 bg-foreground/40" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md rounded-t-2xl sm:rounded-2xl bg-card p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-card-foreground">Adicionar Restaurante</h2>
          <button onClick={onClose} className="p-1 text-muted-foreground hover:text-foreground">
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-card-foreground mb-1">Nome</label>
            <div className="relative">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nome do restaurante"
                className="w-full rounded-lg border border-input bg-background px-3 py-2 pr-9 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                required
              />
              {searching && (
                <Loader2 className="absolute right-2 top-1/2 -translate-y-1/2 animate-spin text-muted-foreground" size={16} />
              )}
            </div>
            {showSuggestions && suggestions.length > 1 && (
              <div className="mt-2 rounded-lg border border-input bg-background shadow-sm max-h-56 overflow-y-auto">
                {suggestions.map((s, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => pickSuggestion(s)}
                    className="w-full text-left px-3 py-2 text-xs text-foreground hover:bg-muted border-b border-input last:border-b-0"
                  >
                    {s.display_name}
                  </button>
                ))}
              </div>
            )}
            {searched && !searching && suggestions.length === 0 && name.trim().length >= 3 && (
              <p className="mt-1 text-xs text-muted-foreground">Nenhum endereço encontrado — digite manualmente</p>
            )}
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-medium text-card-foreground">Localização</label>
              {autoFilled && (
                <button
                  type="button"
                  onClick={() => { setLocation(""); setAutoFilled(false); }}
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  Limpar
                </button>
              )}
            </div>
            <input
              type="text"
              value={location}
              onChange={(e) => { setLocation(e.target.value); setAutoFilled(false); }}
              placeholder="Cidade ou bairro"
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
            {autoFilled && (
              <p className="mt-1 text-xs text-primary">Endereço preenchido automaticamente</p>
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
