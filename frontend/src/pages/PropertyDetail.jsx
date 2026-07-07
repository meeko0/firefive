import { useParams } from "react-router-dom";
import { listings } from "../data/mockListings";

export default function PropertyDetail() {
  const { id } = useParams();
  const listing = listings.find((l) => String(l.id) === id);

  return (
    <main style={{ maxWidth: 800, margin: "0 auto", padding: 24 }}>
      <h1>{listing ? listing.name : "Property not found"}</h1>
      <p style={{ color: "var(--muted)" }}>
        Property detail page — build me out (photos, rating breakdown,
        cost calculator, reviews).
      </p>
    </main>
  );
}
