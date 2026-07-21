import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import StarRating from "../components/StarRating";
import "./PropertyDetail.css";

export default function PropertyDetail() {
  const { id } = useParams();
  const [listing, setListing] = useState(null);
  const [status, setStatus] = useState("loading");
  const [sort, setSort] = useState("relevant");

  useEffect(() => {
    const controller = new AbortController();
    fetch(`${import.meta.env.VITE_API_BASE_URL || ""}/api/listings/${id}?sort=${sort}`, { signal: controller.signal })
      .then((response) => response.ok ? response.json() : Promise.reject(new Error("Not found")))
      .then((data) => { setListing(data); setStatus("success"); })
      .catch((error) => { if (error.name !== "AbortError") setStatus("error"); });
    return () => controller.abort();
  }, [id, sort]);

  if (status === "loading") return <main className="property-page"><p>Loading property…</p></main>;
  if (status === "error") return <main className="property-page"><h1>Property not found</h1><Link to="/">Return to Browse</Link></main>;

  const price = listing.type === "dorm" ? `$${listing.pricePerSemester?.toLocaleString()} / semester` : `$${listing.rentMin?.toLocaleString()} - $${listing.rentMax?.toLocaleString()} / month`;
  return (
    <main className="property-page">
      <section className="property-hero">
        <div className="property-hero__photo"><img src={listing.photoUrl || "/property-placeholder.svg"} alt={`${listing.name} property`} /></div>
        <div>
          <p className="property-hero__type">{listing.type}</p>
          <h1>{listing.name}</h1>
          <p>{listing.address} · {listing.distanceMi ? `${listing.distanceMi} mi to GSU` : "On campus"}</p>
          <div className="property-hero__rating"><StarRating value={listing.averageRating} /> <span>{listing.reviewCount} reviews</span></div>
          <p className="property-hero__price">{price}</p>
          <Link className="property-hero__cta" to={`/write-review?listing=${listing.id}`}>Write a review</Link>
        </div>
      </section>
      <section className="property-info">
        <div><h2>About this property</h2><p>{listing.description}</p></div>
        <aside><strong>{listing.bedrooms ? `${listing.bedrooms} bedroom${listing.bedrooms === 1 ? "" : "s"}` : "Bedrooms not listed"}</strong><span>Safety: {listing.averageSafetyRating || "Not rated"}</span><span>{listing.amenities.length ? listing.amenities.join(" · ") : "Amenities coming soon"}</span><hr /><strong>Monthly housing estimates</strong><span>Average utilities: {listing.averageUtilities == null ? "Not provided" : `$${listing.averageUtilities}`}</span><span>Parking: {listing.parkingCost == null ? "Not provided" : `$${listing.parkingCost}`}</span><span>Renter&apos;s insurance: {listing.insuranceCost == null ? "Not provided" : `$${listing.insuranceCost}`}</span></aside>
      </section>
      <section className="property-reviews">
        <div className="property-reviews__head"><div><h2>Student reviews</h2><p>Approved experiences from the PantherDen community.</p></div><label>Sort<select value={sort} onChange={(e) => setSort(e.target.value)}><option value="relevant">Most relevant</option><option value="newest">Newest</option><option value="highest">Highest rated</option><option value="lowest">Lowest rated</option></select></label></div>
        {listing.reviews.length === 0 && <p className="property-reviews__empty">No approved reviews yet. Be the first to share your experience.</p>}
        {listing.reviews.map((review) => <article className="review-card" key={review.id}><div><StarRating value={review.rating} /><span>{review.author}</span></div><h3>{review.title}</h3><p>{review.reviewText}</p><small>Safety {review.safetyRating}/5 · Maintenance {review.maintenanceRating}/5 · Lived here {review.moveInDate} to {review.moveOutDate || "present"}</small></article>)}
      </section>
    </main>
  );
}
