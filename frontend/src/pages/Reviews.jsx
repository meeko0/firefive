import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchReviews } from "../api/reviews";
import StarRating from "../components/StarRating";
import "./Reviews.css";

export default function Reviews() {
  const [sort, setSort] = useState("relevant"); const [reviews, setReviews] = useState([]); const [status, setStatus] = useState("loading");
  useEffect(() => { const controller = new AbortController(); fetchReviews(sort, controller.signal).then((items) => { setReviews(items); setStatus("success"); }).catch((error) => { if (error.name !== "AbortError") setStatus("error"); }); return () => controller.abort(); }, [sort]);
  return <main className="reviews-page"><header><div><p>Verified student experiences</p><h1>Housing reviews from the GSU community</h1><span>Compare overall satisfaction, safety, and management response before choosing where to live.</span></div><Link to="/write-review">Write a review</Link></header>
    <section className="reviews-toolbar"><div><strong>{reviews.length}</strong><span>approved reviews</span></div><label>Sort reviews<select value={sort} onChange={(e) => setSort(e.target.value)}><option value="relevant">Most relevant</option><option value="newest">Newest</option><option value="highest">Highest rated</option><option value="lowest">Lowest rated</option></select></label></section>
    {status === "loading" && <p className="reviews-empty">Loading student reviews…</p>}{status === "error" && <p className="reviews-empty">Reviews could not be loaded.</p>}{status === "success" && reviews.length === 0 && <section className="reviews-empty"><h2>No approved reviews yet</h2><p>Verified students can submit the first housing experience for moderator review.</p><Link to="/write-review">Share your experience</Link></section>}
    <section className="reviews-list">{reviews.map((review) => <article key={review.id}><div className="review-top"><div><Link to={`/property/${review.listingId}`}>{review.listingName}</Link><span>Reviewed by {review.author}</span></div><StarRating value={review.rating} /></div><h2>{review.title}</h2><p>{review.reviewText}</p><div className="review-metrics"><span>Safety <strong>{review.safetyRating}/5</strong></span><span>Maintenance <strong>{review.maintenanceRating}/5</strong></span><span>Lived here <strong>{review.moveInDate} – {review.moveOutDate || "present"}</strong></span></div></article>)}</section>
  </main>;
}
