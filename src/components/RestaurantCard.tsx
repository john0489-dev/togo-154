import { memo, useState } from "react";
import { Trash2, CheckCircle2, Circle, StickyNote } from "lucide-react";
import { StarRating } from "./StarRating";
import { RestaurantDetailsDialog, type RestaurantDetails } from "./RestaurantDetailsDialog";
import { RestaurantPhotos } from "./RestaurantPhotos";
import { chipColorFor } from "./RestaurantTagsEditor";

interface RestaurantCardProps {
  restaurant: RestaurantDetails;
  onToggleVisited: (id: string) => void;
  onDelete: (id: string) => void;
  onRate: (id: string, rating: number) => void;
  onPhotosChange?: (id: string, photos: string[]) => void;
  onNotesChange?: (id: string, notes: string) => void;
  onTagsChange?: (id: string, tags: string[]) => void;
  onTagClick?: (tag: string) => void;
  tagSuggestions?: string[];
}

function RestaurantCardImpl({
  restaurant,
  onToggleVisited,
  onDelete,
  onRate,
  onPhotosChange,
  onNotesChange,
  onTagsChange,
  onTagClick,
  tagSuggestions,
}: RestaurantCardProps) {
  const [open, setOpen] = useState(false);
  const stop = (e: React.MouseEvent | React.KeyboardEvent) => e.stopPropagation();

  const note = (restaurant.notes ?? "").trim();
  const tags = restaurant.tags ?? [];

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
        <div className="flex items-start gap-3">
          {/* Thumbnail à esquerda */}
          <div onClick={stop}>
            <RestaurantPhotos
              restaurantId={restaurant.id}
              photos={restaurant.photos ?? []}
              onChange={(next) => onPhotosChange?.(restaurant.id, next)}
              variant="thumbnail"
            />
          </div>

          {/* Conteúdo */}
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h3 className="text-base font-semibold text-card-foreground truncate flex items-center gap-1.5">
                  <span className="truncate">{restaurant.name}</span>
                  {note && (
                    <StickyNote
                      size={14}
                      className="shrink-0"
                      style={{ color: "#c4844a" }}
                      aria-label="Tem nota"
                    />
                  )}
                </h3>
                <p className="text-sm text-muted-foreground truncate">{restaurant.location}</p>
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
          </div>
        </div>

        {/* Note preview */}
        {note && (
          <p
            className="mt-3 text-sm text-muted-foreground line-clamp-2"
            style={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}
          >
            {note}
          </p>
        )}

        {/* Tags */}
        {tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5" onClick={stop}>
            {tags.map((tag) => {
              const c = chipColorFor(tag);
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={(e) => {
                    stop(e);
                    onTagClick?.(tag);
                  }}
                  className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-opacity hover:opacity-80"
                  style={{ background: c.bg, color: c.fg }}
                >
                  {tag}
                </button>
              );
            })}
          </div>
        )}

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
        onPhotosChange={onPhotosChange}
        onNotesChange={onNotesChange}
        onTagsChange={onTagsChange}
        tagSuggestions={tagSuggestions}
      />
    </>
  );
}

export const RestaurantCard = memo(RestaurantCardImpl);
