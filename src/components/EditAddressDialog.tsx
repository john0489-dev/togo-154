import { useState, useEffect, useRef } from "react";
import { X, MapPin, Loader2, Check } from "lucide-react";
import { searchRestaurantAddress } from "@/lib/api.functions";
import type { Session } from "@supabase/supabase-js";

interface AddressSuggestion {
  display_name: string;
  latitude: number;
  longitude: number;
}

interface EditAddressDialogProps {
  open: boolean;
  onClose: () => void;
  session: Session;
  restaurant: {
    id: string;
    name: string;
    location: string;
    address?: string | null;
    latitude?: number | null;
    longitude?: number | null;
  } | null;
  onSave: (data: {
    id: string;
    location: string;
    address?: string;
    latitude?: number;
    longitude?: number;
  }) => Promise<void> | void;
}

export function EditAddressDialog({ open, onClose, session, restaurant, onSave }: EditAddressDialogProps) {
  const [location, setLocation] = useState("");
  const [manualAddress, setManualAddress] = useState("");
  const [manualLat, setManualLat] = useState("");
  const [manualLng, setManualLng] = useState("");
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [searching, setSearching] = useState(false);
  const [searched, setSearched] = useState(false);
  const [selected, setSelected] = useState<AddressSuggestion | null>(null);
  const [mode, setMode] = useState<"search" | "manual">("search");
  const [saving, setSaving] = useState(false);
  const reqIdRef = useRef(0);

  useEffect(() => {
    if (!open || !restaurant) return;
    setLocation(restaurant.location || "");
    setManualAddress(restaurant.address && restaurant.address !== "__not_found__" ? restaurant.address : "");
    setManualLat(restaurant.latitude != null ? String(restaurant.latitude) : "");
    setManualLng(restaurant.longitude != null ? String(restaurant.longitude) : "");
    setSuggestions([]);
    setSelected(null);
    setSearched(false);
    setMode("search");
  }, [open, restaurant]);

  if (!open || !restaurant) return null;

  const handleSearch = async () => {
    const myReq = ++reqIdRef.current;
    setSearching(true);
    setSearched(false);
    try {
      const { suggestions: results } = await searchRestaurantAddress({
        data: { name: restaurant.name, location: location.trim() || undefined },
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (myReq !== reqIdRef.current) return;
      setSuggestions(results);
    } catch (err) {
      console.error("address search failed", err);
    } finally {
      if (myReq === reqIdRef.current) {
        setSearching(false);
        setSearched(true);
      }
    }
  };

  const handlePick = (s: AddressSuggestion) => {
    setSelected(s);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving) return;

    let payload: {
      id: string;
      location: string;
      address?: string;
      latitude?: number;
      longitude?: number;
    } = { id: restaurant.id, location: location.trim() };

    if (mode === "search" && selected) {
      payload.address = selected.display_name;
      payload.latitude = selected.latitude;
      payload.longitude = selected.longitude;
    } else if (mode === "manual") {
      const lat = parseFloat(manualLat);
      const lng = parseFloat(manualLng);
      if (manualAddress.trim()) payload.address = manualAddress.trim();
      if (Number.isFinite(lat) && Number.isFinite(lng)) {
        payload.latitude = lat;
        payload.longitude = lng;
      }
    } else {
      // search mode but nothing selected — just update location
    }

    setSaving(true);
    try {
      await onSave(payload);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  const hasCoords = restaurant.latitude != null && restaurant.longitude != null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="fixed inset-0 bg-foreground/40" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md rounded-t-2xl sm:rounded-2xl bg-card p-6 shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-lg font-semibold text-card-foreground">Editar localização</h2>
          <button onClick={onClose} className="p-1 text-muted-foreground hover:text-foreground">
            <X size={20} />
          </button>
        </div>
        <p className="text-sm text-muted-foreground mb-4 truncate">{restaurant.name}</p>

        {!hasCoords && (
          <div className="mb-4 rounded-lg bg-amber-100 dark:bg-amber-900/20 px-3 py-2 text-xs text-amber-800 dark:text-amber-300">
            Este restaurante ainda não tem coordenadas precisas e não aparece no mapa.
          </div>
        )}

        <div className="flex gap-1 mb-4 rounded-lg bg-muted p-1">
          <button
            type="button"
            onClick={() => setMode("search")}
            className={`flex-1 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
              mode === "search" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
            }`}
          >
            Buscar endereço
          </button>
          <button
            type="button"
            onClick={() => setMode("manual")}
            className={`flex-1 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
              mode === "manual" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
            }`}
          >
            Inserir manualmente
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-card-foreground mb-1">
              Cidade / bairro
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Ex: Vila Madalena, São Paulo"
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          {mode === "search" ? (
            <div>
              <button
                type="button"
                onClick={handleSearch}
                disabled={searching}
                className="w-full rounded-lg border border-input bg-card px-3 py-2 text-sm font-medium text-foreground hover:bg-accent transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {searching ? <Loader2 size={14} className="animate-spin" /> : <MapPin size={14} />}
                {searching ? "Buscando..." : "Buscar endereço no mapa"}
              </button>

              {searched && suggestions.length === 0 && !searching && (
                <p className="mt-2 text-xs text-muted-foreground text-center">
                  Nenhum resultado. Tente refinar a cidade ou use a opção manual.
                </p>
              )}

              {suggestions.length > 0 && (
                <div className="mt-2 rounded-lg border border-border bg-popover overflow-hidden">
                  <ul className="max-h-56 overflow-y-auto">
                    {suggestions.map((s, i) => {
                      const isSel = selected?.display_name === s.display_name;
                      return (
                        <li key={i}>
                          <button
                            type="button"
                            onClick={() => handlePick(s)}
                            className={`flex w-full items-start gap-2 px-3 py-2 text-left text-xs transition-colors ${
                              isSel ? "bg-primary/10 text-foreground" : "text-foreground hover:bg-accent"
                            }`}
                          >
                            {isSel ? (
                              <Check size={14} className="mt-0.5 shrink-0 text-primary" />
                            ) : (
                              <MapPin size={14} className="mt-0.5 shrink-0 text-muted-foreground" />
                            )}
                            <span className="flex-1">{s.display_name}</span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-card-foreground mb-1">
                  Endereço completo
                </label>
                <input
                  type="text"
                  value={manualAddress}
                  onChange={(e) => setManualAddress(e.target.value)}
                  placeholder="Rua, número, bairro, cidade"
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-medium text-card-foreground mb-1">
                    Latitude
                  </label>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={manualLat}
                    onChange={(e) => setManualLat(e.target.value)}
                    placeholder="-23.5505"
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-card-foreground mb-1">
                    Longitude
                  </label>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={manualLng}
                    onChange={(e) => setManualLng(e.target.value)}
                    placeholder="-46.6333"
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Dica: clique com botão direito no Google Maps no local exato → copie as coordenadas.
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={saving}
            className="w-full rounded-lg bg-primary py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {saving ? "Salvando..." : "Salvar"}
          </button>
        </form>
      </div>
    </div>
  );
}
