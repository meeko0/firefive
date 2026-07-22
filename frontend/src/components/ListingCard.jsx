import { Link } from "react-router-dom";
import StarRating from "./StarRating";
import Badge from "./Badge";
import "./ListingCard.css";

export default function ListingCard({ listing, isFavorite, onFavorite, canFavorite }) {
  const isDorm = listing.type === "dorm";

  const price = isDorm
    ? `$${listing.pricePerSemester.toLocaleString()} / semester`
    : `$${listing.rentMin.toLocaleString()} – $${listing.rentMax.toLocaleString()} / mo`;

  return (
    <Link to={`/property/${listing.id}`} className="listing-card">
      <div className="listing-card__image">
        <Badge kind={listing.type} />
        <button className={`listing-card__heart ${isFavorite ? "is-favorite" : ""}`} type="button" aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"} title={canFavorite ? "Save property" : "Log in to save properties"} onClick={(event) => { event.preventDefault(); event.stopPropagation(); onFavorite(listing.id); }} disabled={!canFavorite}>{isFavorite ? "♥" : "♡"}</button>
      </div>

      <div className="listing-card__body">
        <h3 className="listing-card__name">{listing.name}</h3>
        <p className="listing-card__address">
          {isDorm ? `On campus · ${listing.address}` : listing.address}
        </p>

        <div className="listing-card__meta">
          <StarRating value={listing.rating} />
          <span className="listing-card__reviews">· {listing.reviewCount} reviews</span>
        </div>

        <p className="listing-card__price">{price}</p>
        <p className="listing-card__address">{listing.bedrooms ? `${listing.bedrooms} bedroom${listing.bedrooms === 1 ? "" : "s"}` : "Bedrooms not listed"}</p>

        <div className="listing-card__tags">
          {isDorm ? (
            <>
              <span className="tag">{listing.roomType} room</span>
              {listing.mealPlan && <span className="tag">Meal plan incl.</span>}
            </>
          ) : (
            <>
              <span className="tag">{listing.distanceMi} mi to GSU</span>
              {listing.verified && <Badge kind="verified" />}
            </>
          )}
        </div>
      </div>
    </Link>
  );
}
