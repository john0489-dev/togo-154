import { memo } from "react";
import { Trash2, CheckCircle2, Circle, MapPinOff, Edit3 } from "lucide-react";
import { StarRating } from "./StarRating";

type Restaurant = {
  id: string;
  name: string;
  location: string;
  cuisine: string;
  visited: boolean;
  rating: number;
  latitude?: number | null;
  longitude?: number | null;
  address?: string | null;
};

interface RestaurantCardProps {
  restaurant: Restaurant;
  onToggleVisited: (id: string) => void;
  onDelete: (id: string) => void;
  onRate: (id: string, rating: number) => void;
  onEditAddress?: (id: string) => void;
}

function RestaurantCardImpl({ restaurant, onToggleVisited, onDelete, onRate, onEditAddress }: RestaurantCardProps) {
  const hasCoords = restaurant.latitude != null && restaurant.longitude != null;
  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
      <div className="flex items-start justify-between">
        <div className="min-w-0 flex-1">
          <h3 className="text-base font-semibold text-card-foreground">{restaurant.name}</h3>
          <p className="text-sm text-muted-foreground truncate">{restaurant.location}</p>
        </div>
        <button
          onClick={() => onDelete(restaurant.id)}
          className="p-1 text-muted-foreground hover:text-destructive transition-colors shrink-0"
        >
          <Trash2 size={16} />
        </button>
      </div>

      <div className="mt-2 flex flex-wrap gap-2">
        <span className="inline-flex items-center rounded-full border border-border px-2.5 py-0.5 text-xs font-medium text-secondary-foreground">
          {restaurant.cuisine}
        </span>
        <span
          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${
            restaurant.visited
              ? "bg-[var(--status-visited)]/15 text-[var(--status-visited)]"
              : "bg-[var(--status-to-visit)]/15 text-[var(--status-to-visit)]"
          }`}
        >
          <span
            className={`inline-block h-1.5 w-1.5 rounded-full ${
              restaurant.visited ? "bg-[var(--status-visited)]" : "bg-[var(--status-to-visit)]"
            }`}
          />
          {restaurant.visited ? "Visitado" : "Para Visitar"}
        </span>
        {!hasCoords && onEditAddress && (
          <button
            type="button"
            onClick={() => onEditAddress(restaurant.id)}
            className="inline-flex items-center gap-1 rounded-full bg-amber-100 dark:bg-amber-900/20 px-2.5 py-0.5 text-xs font-medium text-amber-800 dark:text-amber-300 hover:bg-amber-200 dark:hover:bg-amber-900/40 transition-colors"
          >
            <MapPinOff size={11} />
            Sem localização
          </button>
        )}
      </div>

      <div className="mt-3 flex items-center justify-between">
        <StarRating rating={restaurant.rating} onChange={(r) => onRate(restaurant.id, r)} />
        <div className="flex items-center gap-2">
          {hasCoords && onEditAddress && (
            <button
              onClick={() => onEditAddress(restaurant.id)}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
              title="Editar localização"
            >
              <Edit3 size={13} />
            </button>
          )}
          <button
            onClick={() => onToggleVisited(restaurant.id)}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            {restaurant.visited ? (
              <>
                <CheckCircle2 size={16} className="text-[var(--status-visited)]" />
                <span className="text-[var(--status-visited)]">Visitado</span>
              </>
            ) : (
              <>
                <Circle size={16} />
                <span>Marcar como visitado</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export const RestaurantCard = memo(RestaurantCardImpl);
