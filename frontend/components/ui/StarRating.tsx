import { MaterialIcon } from './MaterialIcon';

interface StarRatingProps {
  rating: number;
  reviews?: number;
  size?: string;
}

export function StarRating({ rating, reviews, size = 'text-sm' }: StarRatingProps) {
  const fullStars = Math.floor(rating);
  const hasHalf = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalf ? 1 : 0);

  return (
    <div className="flex items-center gap-2">
      <div className="flex text-yellow-400">
        {Array.from({ length: fullStars }).map((_, i) => (
          <MaterialIcon key={`full-${i}`} name="star" filled className={size} />
        ))}
        {hasHalf && <MaterialIcon name="star_half" className={size} />}
        {Array.from({ length: emptyStars }).map((_, i) => (
          <MaterialIcon key={`empty-${i}`} name="star" className={size} />
        ))}
      </div>
      {reviews !== undefined && (
        <span className="text-[11px] text-primary/40">({reviews} reviews)</span>
      )}
    </div>
  );
}
