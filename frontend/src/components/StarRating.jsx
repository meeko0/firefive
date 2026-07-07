import "./StarRating.css";

// value: number like 4.3 -> renders filled/empty stars
export default function StarRating({ value = 0, showValue = true }) {
  const filled = Math.round(value);
  const stars = "★★★★★".slice(0, filled) + "☆☆☆☆☆".slice(0, 5 - filled);
  return (
    <span className="star-rating">
      <span className="star-rating__stars">{stars}</span>
      {showValue && <span className="star-rating__value">{value.toFixed(1)}</span>}
    </span>
  );
}
