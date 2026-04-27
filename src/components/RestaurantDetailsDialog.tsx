import { useEffect, useState } from "react";
import { CheckCircle2, Circle, MapPin, Trash2, ExternalLink, Calendar, User } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { StarRating } from "./StarRating";
import { supabase } from "@/integrations/supabase/client";

export type RestaurantDetails = {
  id: string;
  name: string;
  location: string;
  cuisine: string;
  visited: boolean;
  rating: number;
  latitude?: number | null;
  longitude?: number | null;
  address?: string | null;
  added_by?: string | null;
  created_at?: string;
  list_id?: string | null;
  photos?: string[] | null;
};

interface Props {
  restaurant: RestaurantDetails;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onToggleVisited: (id: string) => void;
  onDelete: (id: string) => void;
  onRate: (id: string, rating: number) => void;
  onPhotosChange?: (id: string, photos: string[]) => void;
}

const dateFmt = new Intl.DateTimeFormat("pt-BR", { dateStyle: "medium" });

export function RestaurantDetailsDialog({
  restaurant,
  open,
  onOpenChange,
  onToggleVisited,
  onDelete,
  onRate,
  onPhotosChange,
}: Props) {
  const [addedByEmail, setAddedByEmail] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !restaurant.added_by || !restaurant.list_id) {
      setAddedByEmail(null);
      return;
    }
    let cancelled = false;
    (async () => {
      const { data } = await supabase.rpc("get_user_email_for_list_member", {
        _user_id: restaurant.added_by!,
        _list_id: restaurant.list_id!,
      });
      if (!cancelled) setAddedByEmail((data as string | null) ?? null);
    })();
    return () => {
      cancelled = true;
    };
  }, [open, restaurant.added_by, restaurant.list_id]);

  const mapsUrl =
    restaurant.latitude != null && restaurant.longitude != null
      ? `https://www.google.com/maps/search/?api=1&query=${restaurant.latitude},${restaurant.longitude}`
      : restaurant.address
        ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(restaurant.address)}`
        : null;

  const createdAt = restaurant.created_at ? new Date(restaurant.created_at) : null;

  const handleDelete = () => {
    if (window.confirm(`Excluir "${restaurant.name}"? Esta ação não pode ser desfeita.`)) {
      onDelete(restaurant.id);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md sm:rounded-2xl p-0 overflow-hidden">
        <div
          className="px-6 pt-6 pb-4"
          style={{ background: "var(--hero-gradient)" }}
        >
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-primary-foreground tracking-tight pr-8 text-left">
              {restaurant.name}
            </DialogTitle>
          </DialogHeader>
          <div className="mt-3 flex flex-wrap gap-2">
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                restaurant.visited
                  ? "bg-[var(--status-visited)]/20 text-primary-foreground"
                  : "bg-[var(--status-to-visit)]/25 text-primary-foreground"
              }`}
            >
              <span
                className={`inline-block h-1.5 w-1.5 rounded-full ${
                  restaurant.visited ? "bg-[var(--status-visited)]" : "bg-[var(--status-to-visit)]"
                }`}
              />
              {restaurant.visited ? "Visitado" : "Para Visitar"}
            </span>
            <span className="inline-flex items-center rounded-full bg-primary-foreground/20 px-2.5 py-0.5 text-xs font-medium text-primary-foreground">
              {restaurant.cuisine}
            </span>
          </div>
        </div>

        <div className="px-6 py-5 space-y-4">
          {/* Location */}
          <div className="flex items-start gap-3">
            <MapPin size={18} className="text-muted-foreground mt-0.5 shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Localização
              </p>
              <p className="text-sm text-foreground mt-0.5">{restaurant.location || "—"}</p>
              {restaurant.address && (
                <p className="text-sm text-muted-foreground mt-1">{restaurant.address}</p>
              )}
              {mapsUrl && (
                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                >
                  Abrir no Google Maps
                  <ExternalLink size={12} />
                </a>
              )}
            </div>
          </div>

          {/* Rating */}
          <div className="rounded-lg border border-border bg-muted/30 p-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Avaliação
            </p>
            <div className="mt-2 flex items-center gap-3">
              <StarRating
                rating={restaurant.rating}
                onChange={(r) => onRate(restaurant.id, r)}
              />
              <span className="text-sm text-muted-foreground">
                {restaurant.rating > 0 ? `${restaurant.rating}/5` : "Sem avaliação"}
              </span>
            </div>
          </div>

          {/* Meta */}
          <div className="grid grid-cols-1 gap-2 text-sm">
            {createdAt && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar size={14} />
                <span>Adicionado em {dateFmt.format(createdAt)}</span>
              </div>
            )}
            {addedByEmail && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <User size={14} />
                <span className="truncate">por {addedByEmail}</span>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-2 pt-2">
            <button
              onClick={() => onToggleVisited(restaurant.id)}
              className={`flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
                restaurant.visited
                  ? "bg-muted text-foreground hover:bg-muted/80"
                  : "bg-primary text-primary-foreground hover:bg-primary/90"
              }`}
            >
              {restaurant.visited ? (
                <>
                  <Circle size={16} />
                  Marcar como não visitado
                </>
              ) : (
                <>
                  <CheckCircle2 size={16} />
                  Marcar como visitado
                </>
              )}
            </button>
            <button
              onClick={handleDelete}
              className="flex items-center justify-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-2.5 text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors"
            >
              <Trash2 size={16} />
              Excluir restaurante
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
