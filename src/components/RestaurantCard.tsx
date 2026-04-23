import { memo, useState } from "react";
import { Trash2, CheckCircle2, Circle } from "lucide-react";
import { StarRating } from "./StarRating";
import { RestaurantDetailsDialog, type RestaurantDetails } from "./RestaurantDetailsDialog";

interface RestaurantCardProps {
  restaurant: RestaurantDetails;
  onToggleVisited: (id: string) => void;
  onDelete: (id: string) => void;
  onRate: (id: string, rating: number) => void;
}

function RestaurantCardImpl({ restaurant, onToggleVisited, onDelete, onRate }: RestaurantCardProps) {
  const [open, setOpen] = useState(false);

  const stop = (e: React.MouseEvent | React.KeyboardEvent) => e.stopPropagation();

  return (
    <>
      <div
        role="button"
        tabIndex={0}
        onClick={() => setOpen(true)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setOpen(true);
          }
        }}
        className="rounded-[14px] p-4 cursor-pointer transition-all focus:outline-none focus:ring-2 focus:ring-ring"
        style={{ background: "#fff", border: "1px solid #ede9e3" }}
      >
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-base font-semibold text-card-foreground">{restaurant.name}</h3>
            <p className="text-sm text-muted-foreground">{restaurant.location}</p>
          </div>
          <button
            onClick={(e) => {
              stop(e);
              onDelete(restaurant.id);
            }}
            className="p-1 text-muted-foreground hover:text-destructive transition-colors"
            aria-label={`Excluir ${restaurant.name}`}
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
        </div>

        <div className="mt-3 flex items-center justify-between" onClick={stop}>
          <StarRating rating={restaurant.rating} onChange={(r) => onRate(restaurant.id, r)} />
          <button
            onClick={(e) => {
              stop(e);
              onToggleVisited(restaurant.id);
            }}
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

      <RestaurantDetailsDialog
        restaurant={restaurant}
        open={open}
        onOpenChange={setOpen}
        onToggleVisited={onToggleVisited}
        onDelete={onDelete}
        onRate={onRate}
      />
    </>
  );
}

export const RestaurantCard = memo(RestaurantCardImpl);
