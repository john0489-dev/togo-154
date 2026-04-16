import { Star } from "lucide-react";

interface StarRatingProps {
  rating: number;
  onChange: (rating: number) => void;
  readonly?: boolean;
}

export function StarRating({ rating, onChange, readonly }: StarRatingProps) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          onClick={() => onChange(star === rating ? 0 : star)}
          className="p-0 disabled:cursor-default"
        >
          <Star
            size={18}
            className={
              star <= rating
                ? "fill-[var(--star-active)] text-[var(--star-active)]"
                : "fill-none text-[var(--star-inactive)]"
            }
          />
        </button>
      ))}
    </div>
  );
}
