import { useState } from "react";
import StarRating from "../components/StarRating";

export default function Reviews() {
  const [sortBy, setSortBy] = useState("newest");

  const review1 = {
    id: 1,
    name: "John Doe",
    verified: true,
    rating: 4,
    residentFrom: "August 2023 - May 2024",
    title: "Review Title/Subject",
    body: "xxxxxxxxxxxxxxx",
  };

  const review2 = {
    id: 2,
    name: "Jane Smith",
    verified: true,
    rating: 4,
    residentFrom: "August 2024 - May 2025",
    title: "Review Title/Subject",
    body: "xxxxxxxxxxxxxxx",
  };

  const review3 = {
    id: 3,
    name: "Alex Smith",
    verified: true,
    rating: 4,
    residentFrom: "August 2025 - May 2026",
    title: "Review Title/Subject",
    body: "xxxxxxxxxxxxxxx",
  };

  let reviews = [review1, review2, review3];

  if (sortBy === "newest") {
    reviews = [review3, review2, review1];
  }

  return (
    <main style={{ maxWidth: 900, margin: "0 auto", padding: 24 }}>
      <h1>Student Housing Reviews</h1>
      <p style={{ color: "var(--muted)" }}>
        Read/Share Reviews from fellow GSU students
      </p>

      <div style={{ marginBottom: 16 }}>
        <span>Sort by: </span>
        <button onClick={() => setSortBy("newest")}>Newest</button>
        <button onClick={() => setSortBy("highest")}>Highest</button>
        <button onClick={() => setSortBy("lowest")}>Lowest</button>
      </div>

      {reviews.map((review) => (
        <div
          key={review.id}
          style={{
            border: "1px solid #ddd",
            padding: 16,
            marginBottom: 16,
          }}
        >
          <p>
            <strong>{review.name}</strong>{" "}
            {review.verified && <span style={{ color: "green" }}>✔ Verified Resident</span>}
          </p>

          <StarRating value={review.rating} showValue={false} />
          <p style={{ color: "var(--muted)" }}>Resident From: {review.residentFrom}</p>

          <p style={{ fontWeight: "bold" }}>{review.title}</p>
          <p>{review.body}</p>
        </div>
      ))}
    </main>
  );
}