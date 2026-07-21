import { Star } from "lucide-react";

type StarRatingProps = {
  rating: number;
  size?: number;
  interactive?: boolean;
  onChange?: (rating: number) => void;
};

export default function StarRating({ rating, size = 20, interactive = false, onChange }: StarRatingProps) {
  return (
    <div className="star-rating">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={!interactive}
          onClick={() => interactive && onChange?.(star)}
          className={`${interactive ? "cursor-pointer hover:scale-110" : "cursor-default"} transition-transform duration-150`}
        >
          <Star
            className={star <= rating ? "star-filled fill-current" : "star-empty"}
            style={{ width: size, height: size }}
          />
        </button>
      ))}
    </div>
  );
}
